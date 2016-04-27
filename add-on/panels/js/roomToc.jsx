/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
var loop = loop || {};

loop.roomToc = (function() {
  "use strict";
  var tocViews = loop.shared.toc;
  var sharedActions = loop.shared.actions;
  var sharedUtils = loop.shared.utils;

  function init() {
    loop.shared.utils.getBoolPreference = function foo() {};

    var dispatcher = new loop.Dispatcher();
    var sdkDriver = new loop.OTSdkDriver({
      // For the standalone, always request data channels. If they aren't
      // implemented on the client, there won't be a similar message to us, and
      // we won't display the UI.
      constants: {},
      useDataChannels: true,
      dispatcher: dispatcher,
      sdk: OT
    });

    var activeRoomStore = new loop.store.ActiveRoomStore(dispatcher, {
      sdkDriver: sdkDriver
    });

    // XXX akita: Get loop constants
    var roomStore = new loop.store.RoomStore(dispatcher, {
      constants: { CONSTANT: false }
    });

    loop.store.StoreMixin.register({
      activeRoomStore: activeRoomStore,
      roomStore: roomStore
    });

    window.addEventListener("unload", function() {
      dispatcher.dispatch(new sharedActions.WindowUnload());
    });

    React.render(<tocViews.TableOfContentView
                  activeRoomStore={activeRoomStore}
                  dispatcher={dispatcher}
                  isScreenShareActive={false} />, document.querySelector("#main"));

    var locationData = sharedUtils.locationData();
    var hash = locationData.hash.match(/#(.*)/);

    dispatcher.dispatch(new sharedActions.SetupWindowData({
      windowId: "id-test",
      roomToken: hash[1],
      type: "room"
    }));
  }

  return {
    init: init
  };
})();

document.addEventListener("DOMContentLoaded", loop.roomToc.init);
