/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var loop = loop || {};

loop.sidebar = (function(mozL10n) {
  "use strict";

  var ROOM_STATES = loop.store.ROOM_STATES;
  var sharedActions = loop.shared.actions;
  var sharedUtils = loop.shared.utils;

  var SidebarControllerView = React.createClass({
    mixins: [loop.store.StoreMixin("activeRoomStore")],

    propTypes: {
      activeRoomStore: React.PropTypes.instanceOf(loop.store.ActiveRoomStore).isRequired,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired
    },

    getInitialState: function() {
      return this.getStoreState();
    },

    componentWillMount: function() {
      this.props.activeRoomStore.on("change", function() {
        this.setState(this.props.activeRoomStore.getStoreState());
      }, this);
    },

    componentWillUnmount: function() {
      this.props.activeRoomStore.off("change", null, this);
    },

    render: function() {
      if (this.state.roomState === ROOM_STATES.ROOM_GATHER) {
        return (
          <div>
            <p>{"If you see this, please file a bug"}</p>
          </div>
        );
      }

      return (
         <DesktopSidebarView
           activeRoomStore={this.props.activeRoomStore}
           dispatcher={this.props.dispatcher} />
      );
    }
  });

  var DesktopSidebarView = React.createClass({
    mixins: [loop.store.StoreMixin("activeRoomStore")],

    propTypes: {
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired
    },

    getInitialState: function() {
      return this.getStoreState();
    },

    leaveRoom: function() {
      this.props.dispatcher.dispatch(new sharedActions.LeaveRoom());
    },

    /**
     * Checks if current room is active.
     *
     * @return {Boolean}
     */
    _roomIsActive: function() {
      return this.state.roomState === ROOM_STATES.JOINED ||
             this.state.roomState === ROOM_STATES.SESSION_CONNECTED ||
             this.state.roomState === ROOM_STATES.HAS_PARTICIPANTS;
    },

    render: function() {
      return (
        <loop.shared.toc.SidebarView
          activeRoomStore={this.getStore()}
          audio={{ enabled: !this.state.audioMuted,
                   visible: this._roomIsActive() }}
          dispatcher={this.props.dispatcher}
          introSeen={true}
          isFirefox={true}
          leaveRoom={this.leaveRoom}
          video={{ enabled: !this.state.videoMuted,
                   visible: this._roomIsActive() }} />
      );
    }
  });

  function init() {
    var requests = [
      ["GetAllConstants"],
      ["GetAllStrings"],
      ["GetLocale"]
    ];

    return loop.requestMulti.apply(null, requests).then(function(results) {
      var requestIdx = 0;
      var constants = results[requestIdx];

      // Do the initial L10n setup, we do this before anything
      // else to ensure the L10n environment is setup correctly.
      var stringBundle = results[++requestIdx];
      var locale = results[++requestIdx];
      mozL10n.initialize({
        locale: locale,
        getStrings: function(key) {
          if (!(key in stringBundle)) {
            console.error("No string found for key: ", key);
            return JSON.stringify({ textContent: "foo" });
          }

          return JSON.stringify({ textContent: stringBundle[key] });
        }
      });

      var dispatcher = new loop.Dispatcher();
      var sdkDriver = new loop.OTSdkDriver({
        // For the standalone, always request data channels. If they aren't
        // implemented on the client, there won't be a similar message to us, and
        // we won't display the UI.
        constants: constants,
        useDataChannels: true,
        dispatcher: dispatcher,
        sdk: OT
      });

      var activeRoomStore = new loop.store.ActiveRoomStore(dispatcher, {
        sdkDriver: sdkDriver
      });

      var textChatStore = new loop.store.TextChatStore(dispatcher, {
        sdkDriver: sdkDriver
      });

      loop.store.StoreMixin.register({
        activeRoomStore: activeRoomStore,
        textChatStore: textChatStore
      });

      window.addEventListener("unload", function() {
        dispatcher.dispatch(new sharedActions.WindowUnload());
      });

      React.render(<SidebarControllerView
                      activeRoomStore={activeRoomStore}
                      dispatcher={dispatcher} />, document.querySelector("#main"));

      var locationData = sharedUtils.locationData();
      var hash = locationData.hash.match(/#(.*)/);

      dispatcher.dispatch(new sharedActions.SetupWindowData({
        windowId: "id-test",
        roomToken: hash[1],
        type: "room"
      }));
    });
  }

  return {
    init: init
  };
})(document.mozL10n);

document.addEventListener("DOMContentLoaded", loop.sidebar.init);
