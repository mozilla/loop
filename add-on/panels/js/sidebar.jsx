/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var loop = loop || {};

loop.sidebar = (function() {
  "use strict";
console.info(loop);
  var ROOM_STATES = loop.store.ROOM_STATES;
  var sharedActions = loop.shared.actions;
  var sharedUtils = loop.shared.utils;
  var sharedMixins = loop.shared.mixins;

  loop.config = loop.config || {};
  loop.config.serverUrl = loop.config.serverUrl || "http://localhost:5000";

  var SidebarControllerView = React.createClass({
    mixins: [sharedMixins.UrlHashChangeMixin,
             sharedMixins.DocumentLocationMixin,
             Backbone.Events],

    propTypes: {
      activeRoomStore: React.PropTypes.instanceOf(loop.store.ActiveRoomStore).isRequired,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      standaloneAppStore: React.PropTypes.instanceOf(
        loop.store.StandaloneAppStore).isRequired
    },

    getInitialState: function() {
      return this.props.standaloneAppStore.getStoreState();
    },

    componentWillMount: function() {
      this.listenTo(this.props.standaloneAppStore, "change", function() {
        this.setState(this.props.standaloneAppStore.getStoreState());
      }, this);
    },

    componentWillUnmount: function() {
      this.stopListening(this.props.standaloneAppStore);
    },

    onUrlHashChange: function() {
      this.locationReload();
    },

    render: function() {
      switch (this.state.windowType) {
        case "room": {
          return (
             <SidebarView
               activeRoomStore={this.props.activeRoomStore}
               dispatcher={this.props.dispatcher} />
          );
        }
        default: {
          // The state hasn't been initialised yet, so don't display
          // anything to avoid flicker.
          return (
            <div>
              <p>I'm a sidebar</p>
            </div>
          );
        }
      }
    }
  });

  var SidebarView = React.createClass({
    propTypes: {
      activeRoomStore: React.PropTypes.instanceOf(loop.store.ActiveRoomStore).isRequired,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired
    },

    getInitialState: function() {
      var storeState = this.props.activeRoomStore.getStoreState();
      return storeState;
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
          activeRoomStore={this.props.activeRoomStore}
          audio={{ enabled: !this.state.audioMuted,
                   visible: this._roomIsActive() }}
          dispatcher={this.props.dispatcher}
          isFirefox={true}
          leaveRoom={this.leaveRoom}
          video={{ enabled: !this.state.videoMuted,
                   visible: this._roomIsActive() }} />
      );
    }
  });

  function init() {
    loop.StandaloneMozLoop({
      baseServerUrl: loop.config.serverUrl
    });

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

    // Stores
    var standaloneAppStore = new loop.store.StandaloneAppStore({
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

    var locationData = sharedUtils.locationData();

    dispatcher.dispatch(new sharedActions.ExtractTokenInfo({
      windowPath: locationData.pathname,
      windowHash: locationData.hash
    }));

    React.render(<SidebarControllerView
                    activeRoomStore={activeRoomStore}
                    dispatcher={dispatcher}
                    standaloneAppStore={standaloneAppStore} />, document.querySelector("#main"));
  }

  return {
    init: init
  };
})();

document.addEventListener("DOMContentLoaded", loop.sidebar.init);
