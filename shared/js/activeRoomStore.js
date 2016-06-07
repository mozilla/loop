/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var loop = loop || {};
loop.store = loop.store || {};

loop.store.ROOM_STATES = {
    // The initial state of the room
    INIT: "room-init",
    // The store is gathering the room data
    // XXX akita - We could probably drop this and go from init to ready.
    GATHER: "room-gather",
    // The store has got the room data
    READY: "room-ready",
    // Obtaining media from the user
    MEDIA_WAIT: "room-media-wait",
    // Joining the room is taking place
    JOINING: "room-joining",
    // The room is known to be joined on the loop-server
    JOINED: "room-joined",
    // The room is connected to the sdk server.
    SESSION_CONNECTED: "room-session-connected",
    // There are participants in the room.
    HAS_PARTICIPANTS: "room-has-participants",
    // There was an issue with the room
    FAILED: "room-failed",
    // The room is full
    FULL: "room-full",
    // The room conversation has ended, displays the feedback view.
    ENDED: "room-ended",
    // The window is closing
    CLOSING: "room-closing"
};

loop.store.ActiveRoomStore = (function() {
  "use strict";

  var sharedActions = loop.shared.actions;
  var CHAT_CONTENT_TYPES = loop.shared.utils.CHAT_CONTENT_TYPES;
  var FAILURE_DETAILS = loop.shared.utils.FAILURE_DETAILS;
  var SCREEN_SHARE_STATES = loop.shared.utils.SCREEN_SHARE_STATES;

  // Error numbers taken from
  // https://github.com/mozilla-services/loop-server/blob/master/loop/errno.json
  var REST_ERRNOS = loop.shared.utils.REST_ERRNOS;

  var ROOM_STATES = loop.store.ROOM_STATES;

  var updateContextTimer = null;

  /**
   * Active room store.
   *
   * @param {loop.Dispatcher} dispatcher  The dispatcher for dispatching actions
   *                                      and registering to consume actions.
   * @param {Object} options Options object:
   * - {OTSdkDriver} sdkDriver  The SDK driver instance.
   */
  var ActiveRoomStore = loop.store.createStore({

    // XXX Further actions are registered in setupWindowData and
    // fetchServerData when we know what window type this is. At some stage,
    // we might want to consider store mixins or some alternative which
    // means the stores would only be created when we want them.
    actions: [
      "setupWindowData",
      "fetchServerData"
    ],

    initialize: function(options) {
      if (!options.sdkDriver) {
        throw new Error("Missing option sdkDriver");
      }
      this._sdkDriver = options.sdkDriver;

      this._isDesktop = options.isDesktop || false;
    },

    /**
     * This is a list of states that need resetting when the room is left,
     * due to user choice, failure or other reason. It is a subset of
     * getInitialStoreState as some items (e.g. roomState, failureReason,
     * context information) can persist across room exit & re-entry.
     *
     * @type {Array}
     */
    _statesToResetOnLeave: [
      "audioMuted",
      "chatMessageExchanged",
      "localSrcMediaElement",
      "localVideoDimensions",
      "mediaConnected",
      "receivingScreenShare",
      "remoteAudioEnabled",
      "remotePeerDisconnected",
      "remoteSrcMediaElement",
      "remoteVideoDimensions",
      "remoteVideoEnabled",
      "streamPaused",
      "screenSharingState",
      "screenShareMediaElement",
      "videoMuted"
    ],

    /**
     * Returns initial state data for this active room.
     *
     * When adding states, consider if _statesToResetOnLeave needs updating
     * as well.
     */
    getInitialStoreState: function() {
      return {
        roomState: ROOM_STATES.INIT,
        audioMuted: false,
        videoMuted: false,
        remoteAudioEnabled: false,
        remoteVideoEnabled: false,
        failureReason: undefined,
        // Whether or not Firefox can handle this room in the conversation
        // window, rather than us handling it in the standalone.
        userAgentHandlesRoom: undefined,
        // Tracks if the room has been used during this
        // session. 'Used' means at least one call has been placed
        // with it. Entering and leaving the room without seeing
        // anyone is not considered as 'used'
        used: false,
        localVideoDimensions: {},
        remoteVideoDimensions: {},
        screenSharingState: SCREEN_SHARE_STATES.INACTIVE,
        sharingPaused: false,
        receivingScreenShare: false,
        remotePeerDisconnected: false,
        // True when sharing screen has been paused.
        streamPaused: false,
        // True if media has been connected both-ways.
        mediaConnected: false,
        // True if a chat message was sent or received during a session.
        // Read more at https://wiki.mozilla.org/Loop/Session.
        chatMessageExchanged: false,
        // The participants in the room.
        participants: [],
        // The WebRTC tokens for the room.
        webrtcTokens: {}
      };
    },

    /**
     * Handles a room failure.
     *
     * @param {sharedActions.RoomFailure} actionData
     */
    roomFailure: function(actionData) {
      function getReason(serverCode) {
        switch (serverCode) {
          case REST_ERRNOS.INVALID_TOKEN:
          case REST_ERRNOS.EXPIRED:
            return FAILURE_DETAILS.EXPIRED_OR_INVALID;
          case undefined:
            // XHR errors reach here with errno as undefined
            return FAILURE_DETAILS.COULD_NOT_CONNECT;
          default:
            return FAILURE_DETAILS.UNKNOWN;
        }
      }

      console.error("Error in state `" + this._storeState.roomState + "`:",
        actionData.error);

      var exitState = this._storeState.roomState !== ROOM_STATES.FAILED ?
        this._storeState.roomState : this._storeState.failureExitState;

      this.setStoreState({
        error: actionData.error,
        failureReason: getReason(actionData.error.errno),
        failureExitState: exitState
      });

      this._leaveRoom(actionData.error.errno === REST_ERRNOS.ROOM_FULL ?
          ROOM_STATES.FULL : ROOM_STATES.FAILED);
    },

    /**
     * Attempts to retry getting the room data if there has been a room failure.
     */
    retryAfterRoomFailure: function() {
      if (this._storeState.failureReason === FAILURE_DETAILS.EXPIRED_OR_INVALID) {
        console.error("Invalid retry attempt for expired or invalid url");
        return;
      }

      switch (this._storeState.failureExitState) {
        case ROOM_STATES.GATHER:
          this.dispatchAction(new sharedActions.FetchServerData({
            cryptoKey: this._storeState.roomCryptoKey,
            token: this._storeState.roomToken,
            windowType: "room"
          }));
          return;
        case ROOM_STATES.INIT:
        case ROOM_STATES.ENDED:
        case ROOM_STATES.CLOSING:
          console.error("Unexpected retry for exit state", this._storeState.failureExitState);
          return;
        default:
          // For all other states, we simply join the room. We avoid dispatching
          // another action here so that metrics doesn't get two notifications
          // in a row (one for retry, one for the join).
          this.initiateWebRTC();
          return;
      }
    },

    /**
     * Registers the actions with the dispatcher that this store is interested
     * in after the initial setup has been performed.
     */
    _registerPostSetupActions: function() {
      // Protect against calling this twice, as we don't want to register
      // before we know what type we are, but in some cases we need to re-do
      // an action (e.g. FetchServerData).
      if (this._registeredActions) {
        return;
      }

      this._registeredActions = true;

      var actions = [
        "roomFailure",
        "retryAfterRoomFailure",
        "updateRoomInfo",
        "userAgentHandlesRoom",
        "gotMediaPermission",
        "initiateWebRTC",
        "joinedRoom",
        "connectedToSdkServers",
        "connectionFailure",
        "setMute",
        "screenSharingState",
        "receivingScreenShare",
        "remotePeerDisconnected",
        "remotePeerConnected",
        "windowUnload",
        "leaveRoom",
        "feedbackComplete",
        "mediaStreamCreated",
        "mediaStreamDestroyed",
        "remoteVideoStatus",
        "videoDimensionsChanged",
        "startBrowserShare",
        "endScreenShare",
        "toggleBrowserSharing",
        "connectionStatus",
        "mediaConnected",
        "videoScreenStreamChanged",
        "setupWebRTCTokens"
      ];
      // Register actions that are only used on Desktop.
      if (this._isDesktop) {
        // 'receivedTextChatMessage' and  'sendTextChatMessage' actions are only
        // registered for Telemetry. Once measured, they're unregistered.
        actions.push("receivedTextChatMessage", "sendTextChatMessage");
      }
      this.dispatcher.register(this, actions);

      this._onDeleteListener = this._handleRoomDelete.bind(this);

      var roomToken = this._storeState.roomToken;
      loop.request("Rooms:PushSubscription", ["delete:" + roomToken]);
      loop.subscribe("Rooms:Delete:" + roomToken, this._handleRoomDelete.bind(this));
    },

    /**
     * Execute setupWindowData event action from the dispatcher. This gets
     * the room data from the Loop API, and dispatches an UpdateRoomInfo event.
     *
     * @param {sharedActions.SetupWindowData} actionData
     */
    setupWindowData: function(actionData) {
      this.setStoreState({
        roomState: ROOM_STATES.GATHER,
        roomToken: actionData.roomToken
      });

      this._registerPostSetupActions();
    },

    /**
     * Execute fetchServerData event action from the dispatcher. For rooms
     * we need to get the room context information from the server. We don't
     * need other data until the user decides to join the room.
     * This action is only used for the standalone UI.
     *
     * @param {sharedActions.FetchServerData} actionData
     */
    fetchServerData: function(actionData) {
      if (actionData.windowType !== "room") {
        // Nothing for us to do here, leave it to other stores.
        return;
      }

      this.setStoreState({
        roomState: ROOM_STATES.GATHER,
        roomToken: actionData.token,
        roomCryptoKey: actionData.cryptoKey,
        standalone: true
      });

      this._registerPostSetupActions();
    },

    /**
     * Handles the updateRoomInfo action. Updates the room data.
     *
     * @param {sharedActions.updateRoomInfo} actionData
     */
    updateRoomInfo: function(actionData) {
      // Now we've got the data, bump the state to READY if we were previously
      // waiting for it.
      if (this._storeState.roomState === ROOM_STATES.GATHER) {
        this.setStoreState({
          roomState: ROOM_STATES.READY,
          participants: actionData.participants
        });
        return;
      }

      this.setStoreState({
        participants: actionData.participants
      });
    },

    /**
     * Handles the userAgentHandlesRoom action. Updates the store's data with
     * the new state.
     *
     */
    userAgentHandlesRoom: function(actionData) {
      this.setStoreState({
        userAgentHandlesRoom: actionData.handlesRoom
      });
    },

    /**
     * Handles the deletion of a room, notified by the Loop rooms API.
     *
     */
    _handleRoomDelete: function() {
      this._sdkDriver.forceDisconnectAll(function() {
        window.close();
      });
    },

    /**
     * Checks that there are audio and video devices available, and joins the
     * room if there are. If there aren't then it will dispatch a ConnectionFailure
     * action with NO_MEDIA.
     */
    _checkDevicesAndInitiateWebRTC: function() {
      // XXX Ideally we'd do this check before joining a room, but we're waiting
      // for the UX for that. See bug 1166824. In the meantime this gives us
      // additional information for analysis.
      loop.shared.utils.hasAudioOrVideoDevices(function(hasDevices) {

        if (hasDevices) {
          // MEDIA_WAIT causes the views to dispatch sharedActions.SetupStreamElements,
          // which in turn starts the sdk obtaining the device permission.
          this.setStoreState({ roomState: ROOM_STATES.MEDIA_WAIT });
        } else {
          this.dispatchAction(new sharedActions.ConnectionFailure({
            reason: FAILURE_DETAILS.NO_MEDIA
          }));
        }
      }.bind(this));
    },

    /**
     * Hands off the room join to Firefox.
     */
    _handoffRoomJoin: function() {
      var channelListener;

      function handleRoomJoinResponse(e) {
        if (e.detail.id !== "loop-link-clicker") {
          return;
        }

        window.removeEventListener("WebChannelMessageToContent", channelListener);

        if (!e.detail.message || !e.detail.message.response) {
          // XXX Firefox didn't handle this, even though it said it could
          // previously. We should add better user feedback here.
          console.error("Firefox didn't handle room it said it could.");
        } else if (e.detail.message.alreadyOpen) {
          this.dispatcher.dispatch(new sharedActions.ConnectionFailure({
            reason: FAILURE_DETAILS.ROOM_ALREADY_OPEN
          }));
        } else {
          this.dispatcher.dispatch(new sharedActions.JoinedRoom({
            apiKey: "",
            sessionToken: "",
            sessionId: "",
            expires: 0
          }));
        }
      }

      channelListener = handleRoomJoinResponse.bind(this);

      window.addEventListener("WebChannelMessageToContent", channelListener);

      // Now we're set up, dispatch an event.
      window.dispatchEvent(new window.CustomEvent("WebChannelMessageToChrome", {
        detail: {
          id: "loop-link-clicker",
          message: {
            command: "openRoom",
            roomToken: this._storeState.roomToken
          }
        }
      }));
    },

    /**
     * Handles the action to join to a room.
     */
    initiateWebRTC: function() {
      // Reset the failure reason if necessary.
      if (this.getStoreState().failureReason) {
        this.setStoreState({ failureReason: undefined });
      }

      // If we're standalone and we know Firefox can handle the room, then hand
      // it off.
      if (this._storeState.standalone && this._storeState.userAgentHandlesRoom) {
        this.dispatcher.dispatch(new sharedActions.MetricsLogJoinRoom({
          userAgentHandledRoom: true,
          ownRoom: true
        }));
        this._handoffRoomJoin();
        return;
      }

      this.dispatcher.dispatch(new sharedActions.MetricsLogJoinRoom({
        userAgentHandledRoom: false
      }));

      // Otherwise, we handle the room ourselves.
      this._checkDevicesAndInitiateWebRTC();
    },

    /**
     * Saves the WebRTC tokens for use later.
     *
     * @param {sharedActions.SetupWebRTCTokens} actionData
     */
    setupWebRTCTokens: function(actionData) {
      this.setStoreState({
        webrtcTokens: {
          apiKey: actionData.apiKey,
          sessionToken: actionData.sessionToken,
          sessionId: actionData.sessionId
        }
      });
    },

    /**
     * Handles the action that signifies when media permission has been
     * granted and starts joining the room.
     */
    gotMediaPermission: function() {
      // If we're standalone and firefox is handling, then just store the new
      // state. No need to do anything else.
      if (this._storeState.standalone && this._storeState.userAgentHandlesRoom) {
        this.setStoreState({
          roomState: ROOM_STATES.JOINED
        });
        return;
      }

      this.setStoreState({
        roomState: ROOM_STATES.JOINED
      });

      this._sdkDriver.connectSession(this._storeState.webrtcTokens);

      loop.request("AddConversationContext", this._storeState.windowId,
        this._storeState.webrtcTokens.sessionId, "");
    },

    /**
     * Handles recording when the sdk has connected to the servers.
     */
    connectedToSdkServers: function() {
      this.setStoreState({
        roomState: ROOM_STATES.SESSION_CONNECTED
      });
    },

    /**
     * Handles disconnection of this local client from the sdk servers.
     *
     * @param {sharedActions.ConnectionFailure} actionData
     */
    connectionFailure: function(actionData) {
      var exitState = this._storeState.roomState === ROOM_STATES.FAILED ?
        this._storeState.failureExitState : this._storeState.roomState;

      // Treat all reasons as something failed. In theory, clientDisconnected
      // could be a success case, but there's no way we should be intentionally
      // sending that and still have the window open.
      this.setStoreState({
        failureReason: actionData.reason,
        failureExitState: exitState
      });

      this._leaveRoom(ROOM_STATES.FAILED);
    },

    /**
     * Records the mute state for the stream.
     *
     * @param {sharedActions.setMute} actionData The mute state for the stream type.
     */
    setMute: function(actionData) {
      // XXX akita - temporary bad place to initiate joins. Also see
      // otSdkDriver#setMute.
      if (this._storeState.roomState === ROOM_STATES.READY ||
          this._storeState.roomState === ROOM_STATES.ENDED) {
        this.dispatcher.dispatch(new sharedActions.InitiateWebRTC());
        return;
      }

      var muteState = {};
      muteState[actionData.type + "Muted"] = !actionData.enabled;
      this.setStoreState(muteState);
    },

    /**
     * Handles a media stream being created. This may be a local or a remote stream.
     *
     * @param {sharedActions.MediaStreamCreated} actionData
     */
    mediaStreamCreated: function(actionData) {
      if (actionData.isLocal) {
        this.setStoreState({
          localAudioEnabled: actionData.hasAudio,
          localVideoEnabled: actionData.hasVideo,
          localSrcMediaElement: actionData.srcMediaElement
        });
        return;
      }

      this.setStoreState({
        remoteAudioEnabled: actionData.hasAudio,
        remoteVideoEnabled: actionData.hasVideo,
        remoteSrcMediaElement: actionData.srcMediaElement
      });
    },

    /**
     * Handles a media stream being destroyed. This may be a local or a remote stream.
     *
     * @param {sharedActions.MediaStreamDestroyed} actionData
     */
    mediaStreamDestroyed: function(actionData) {
      if (actionData.isLocal) {
        this.setStoreState({
          localSrcMediaElement: null
        });
        return;
      }

      this.setStoreState({
        remoteSrcMediaElement: null
      });
    },

    /**
     * Handles a remote stream having video enabled or disabled.
     *
     * @param {sharedActions.RemoteVideoStatus} actionData
     */
    remoteVideoStatus: function(actionData) {
      this.setStoreState({
        remoteVideoEnabled: actionData.videoEnabled
      });
    },

    /**
     * Records when the remote media has been connected.
     */
    mediaConnected: function() {
      this.setStoreState({ mediaConnected: true });
    },

    /**
     * Used to note the current screensharing state.
     */
    screenSharingState: function(actionData) {
      this.setStoreState({ screenSharingState: actionData.state });

      loop.request("SetScreenShareState", this.getStoreState().windowId,
        actionData.state === SCREEN_SHARE_STATES.ACTIVE);
    },

    /**
     * Used to note the current state of receiving screenshare data.
     *
     * XXX this should be split into multiple actions to make the code clearer.
     */
    receivingScreenShare: function(actionData) {
      if (!actionData.receiving &&
          this.getStoreState().remoteVideoDimensions.screen) {
        // Remove the remote video dimensions for type screen as we're not
        // getting the share anymore.
        var newDimensions = _.extend(this.getStoreState().remoteVideoDimensions);
        delete newDimensions.screen;
        this.setStoreState({
          receivingScreenShare: actionData.receiving,
          remoteVideoDimensions: newDimensions,
          screenShareMediaElement: null
        });
      } else {
        this.setStoreState({
          receivingScreenShare: actionData.receiving,
          screenShareMediaElement: actionData.srcMediaElement ?
                                  actionData.srcMediaElement : null
        });
      }
    },

    /**
     * Handles switching browser (aka tab) sharing to a new window. Should
     * only be used for browser sharing.
     *
     * @param {Number} windowId  The new windowId to start sharing.
     */
    _handleSwitchBrowserShare: function(windowId) {
      if (Array.isArray(windowId)) {
        windowId = windowId[0];
      }
      if (!windowId) {
        return;
      }
      if (windowId.isError) {
        console.error("Error getting the windowId: " + windowId.message);
        this.dispatchAction(new sharedActions.ScreenSharingState({
          state: SCREEN_SHARE_STATES.INACTIVE
        }));
        return;
      }

      var screenSharingState = this.getStoreState().screenSharingState;

      if (screenSharingState === SCREEN_SHARE_STATES.PENDING) {
        // Screen sharing is still pending, so assume that we need to kick it off.
        var options = {
          videoSource: "browser",
          constraints: {
            browserWindow: windowId,
            scrollWithPage: true
          }
        };
        this._sdkDriver.startScreenShare(options);
      } else if (screenSharingState === SCREEN_SHARE_STATES.ACTIVE) {
        // Just update the current share.
        this._sdkDriver.switchAcquiredWindow(windowId);
      } else {
        console.error("Unexpectedly received windowId for browser sharing when pending");
      }

      // Only update context if sharing is not paused and there's somebody.
      if (!this.getStoreState().sharingPaused && this._hasParticipants()) {
        this._checkTabContext();
      }
    },

    /**
     * Get the current tab context to update the room context.
     */
    _checkTabContext: function() {
      loop.request("GetSelectedTabMetadata").then(function(meta) {
        // Avoid sending the event if there is no data nor url.
        if (!meta || !meta.url) {
          return;
        }

        if (updateContextTimer) {
          clearTimeout(updateContextTimer);
        }

        updateContextTimer = setTimeout(function() {
          this.dispatchAction(new sharedActions.UpdateRoomContext({
            newRoomDescription: meta.title || meta.description || meta.url,
            newRoomThumbnail: meta.favicon,
            newRoomURL: meta.url,
            roomToken: this.getStoreState().roomToken
          }));
          updateContextTimer = null;
        }.bind(this), 500);
      }.bind(this));
    },

    /**
     * Initiates a browser tab sharing publisher.
     *
     * @param {sharedActions.StartBrowserShare} actionData
     */
    startBrowserShare: function() {
      if (this._storeState.screenSharingState !== SCREEN_SHARE_STATES.INACTIVE) {
        console.error("Attempting to start browser sharing when already running.");
        return;
      }

      // For the unit test we already set the state here, instead of indirectly
      // via an action, because actions are queued thus depending on the
      // asynchronous nature of `loop.request`.
      this.setStoreState({ screenSharingState: SCREEN_SHARE_STATES.PENDING });
      this.dispatchAction(new sharedActions.ScreenSharingState({
        state: SCREEN_SHARE_STATES.PENDING
      }));

      this._browserSharingListener = this._handleSwitchBrowserShare.bind(this);

      // Set up a listener for watching screen shares. This will get notified
      // with the first windowId when it is added, so we start off the sharing
      // from within the listener.
      loop.request("AddBrowserSharingListener", this.getStoreState().windowId)
        .then(this._browserSharingListener);
      loop.subscribe("BrowserSwitch", this._browserSharingListener);
    },

    /**
     * Ends an active screenshare session.
     */
    endScreenShare: function() {
      if (this._browserSharingListener) {
        // Remove the browser sharing listener as we don't need it now.
        loop.request("RemoveBrowserSharingListener", this.getStoreState().windowId);
        loop.unsubscribe("BrowserSwitch", this._browserSharingListener);
        this._browserSharingListener = null;
      }

      if (this._sdkDriver.endScreenShare()) {
        this.dispatchAction(new sharedActions.ScreenSharingState({
          state: SCREEN_SHARE_STATES.INACTIVE
        }));
      }
    },

    /**
     * Handle browser sharing being enabled or disabled.
     *
     * @param {sharedActions.ToggleBrowserSharing} actionData
     */
    toggleBrowserSharing: function(actionData) {
      this.setStoreState({
        sharingPaused: !actionData.enabled
      });

      // If unpausing, check the context as it might have changed.
      if (actionData.enabled) {
        this._checkTabContext();
      }
    },

    /**
     * Handles recording when a remote peer has connected to the servers.
     */
    remotePeerConnected: function() {
      this.setStoreState({
        remotePeerDisconnected: false,
        roomState: ROOM_STATES.HAS_PARTICIPANTS,
        used: true
      });
    },

    /**
     * Handles a remote peer disconnecting from the session. As we currently only
     * support 2 participants, we declare the room as SESSION_CONNECTED as soon as
     * one participant leaves.
     */
    remotePeerDisconnected: function() {
      // Update the participants to just the owner.
      var participants = this.getStoreState("participants");
      if (participants) {
        participants = participants.filter(function(participant) {
          return participant.owner;
        });
      }

      this.setStoreState({
        mediaConnected: false,
        participants: participants,
        roomState: ROOM_STATES.SESSION_CONNECTED,
        remotePeerDisconnected: true,
        remoteSrcMediaElement: null,
        streamPaused: false
      });
    },

    /**
     * Handles an SDK status update, forwarding it to the server.
     *
     * @param {sharedActions.ConnectionStatus} actionData
     */
    connectionStatus: function(actionData) {
      loop.request("Rooms:SendConnectionStatus", this.getStoreState("roomToken"),
        this._storeState.webrtcTokens.sessionToken, actionData);
    },

    /**
     * Handles the window being unloaded. Ensures the room is left.
     */
    windowUnload: function() {
      this._leaveRoom(ROOM_STATES.CLOSING);

      if (!this._onUpdateListener) {
        return;
      }

      // If we're closing the window, we can stop listening to updates.
      var roomToken = this.getStoreState().roomToken;
      loop.unsubscribe("Rooms:Delete:" + roomToken, this._onDeleteListener);
      loop.unsubscribe("SocialProvidersChanged", this._onSocialProvidersUpdate);
      delete this._onDeleteListener;
      delete this._onShareWidgetUpdate;
      delete this._onSocialProvidersUpdate;
    },

    /**
     * Handles a room being left.
     */
    leaveRoom: function() {
      this._leaveRoom(ROOM_STATES.ENDED,
                      false);
    },

    /**
     * Handles leaving a room. Clears any membership timeouts, then
     * signals to the server the leave of the room.
     * NOTE: if you add something here, please also consider if something needs
     *       to be done on the chrome side as well (e.g.
     *       MozLoopService#openChatWindow).
     *
     * @param {ROOM_STATES} nextState         The next state to switch to.
     */
    _leaveRoom: function(nextState) {
      if (this._storeState.standalone && this._storeState.userAgentHandlesRoom) {
        // If the user agent is handling the room, all we need to do is advance
        // to the next state.
        this.setStoreState({
          roomState: nextState
        });
        return;
      }

      if (loop.standaloneMedia) {
        loop.standaloneMedia.multiplexGum.reset();
      }

      // Call this direct rather than via an action, as we want it to start
      // happening now so that it happens before the disconnectSession.
      this.endScreenShare();

      // We probably don't need to end screen share separately, but lets be safe.
      this._sdkDriver.disconnectSession();

      // Reset various states.
      var originalStoreState = this.getInitialStoreState();
      var newStoreState = {};

      this._statesToResetOnLeave.forEach(function(state) {
        newStoreState[state] = originalStoreState[state];
      });

      newStoreState.roomState = nextState;

      this.setStoreState(newStoreState);
    },

    /**
     * When feedback is complete, we go back to the ready state, rather than
     * init or gather, as we don't need to get the data from the server again.
     */
    feedbackComplete: function() {
      this.setStoreState({
        roomState: ROOM_STATES.READY,
        // Reset the used state here as the user has now given feedback and the
        // next time they enter the room, the other person might not be there.
        used: false
      });
    },

    /**
     * Handles a change in dimensions of a video stream and updates the store data
     * with the new dimensions of a local or remote stream.
     *
     * @param {sharedActions.VideoDimensionsChanged} actionData
     */
    videoDimensionsChanged: function(actionData) {
      // NOTE: in the future, when multiple remote video streams are supported,
      //       we'll need to make this support multiple remotes as well. Good
      //       starting point for video tiling.
      var storeProp = (actionData.isLocal ? "local" : "remote") + "VideoDimensions";
      var nextState = {};
      nextState[storeProp] = this.getStoreState()[storeProp];
      nextState[storeProp][actionData.videoType] = actionData.dimensions;
      this.setStoreState(nextState);
    },

    /**
     * Listen to screen stream changes in order to check if sharing screen
     * has been paused.
     *
     * @param {sharedActions.VideoScreenStreamChanged} actionData
     */
    videoScreenStreamChanged: function(actionData) {
      this.setStoreState({
        streamPaused: !actionData.hasVideo
      });
    },

    /**
     * Handles chat messages received and/ or about to send. If this is the first
     * chat message for the current session, register a count with telemetry.
     * It will unhook the listeners when the telemetry criteria have been
     * fulfilled to make sure we remain lean.
     * Note: the 'receivedTextChatMessage' and 'sendTextChatMessage' actions are
     *       only registered on Desktop.
     *
     * @param  {sharedActions.ReceivedTextChatMessage|SendTextChatMessage} actionData
     */
    _handleTextChatMessage: function(actionData) {
      if (!this._isDesktop || this.getStoreState().chatMessageExchanged ||
          actionData.contentType !== CHAT_CONTENT_TYPES.TEXT) {
        return;
      }

      this.setStoreState({ chatMessageExchanged: true });
      // There's no need to listen to these actions anymore.
      this.dispatcher.unregister(this, [
        "receivedTextChatMessage",
        "sendTextChatMessage"
      ]);
    },

    /**
     * Handles received text chat messages. For telemetry purposes only.
     *
     * @param {sharedActions.ReceivedTextChatMessage} actionData
     */
    receivedTextChatMessage: function(actionData) {
      this._handleTextChatMessage(actionData);
    },

    /**
     * Handles sending of a chat message. For telemetry purposes only.
     *
     * @param {sharedActions.SendTextChatMessage} actionData
     */
    sendTextChatMessage: function(actionData) {
      this._handleTextChatMessage(actionData);
    },

    /**
     * Checks if the room is empty or has participants.
     *
     */
    _hasParticipants: function() {
      // Update the participants to just the owner.
      var participants = this.getStoreState("participants");
      if (participants) {
        participants = participants.filter(function(participant) {
          return !participant.owner;
        });

        return participants.length > 0;
      }

      return false;
    }
  });

  return ActiveRoomStore;
})();
