/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var loop = loop || {};
loop.store = loop.store || {};

loop.store.ServerConnectionStore = (function(mozL10n) {
  "use strict";

  var sharedActions = loop.shared.actions;
  var crypto = loop.crypto;
  var ROOM_INFO_FAILURES = loop.shared.utils.ROOM_INFO_FAILURES;

  var OPTIONAL_ROOMINFO_FIELDS = {
    roomContextUrls: "roomContextUrls",
    roomInfoFailure: "roomInfoFailure",
    roomName: "roomName"
  };

  /**
   * Server Connection room store.
   *
   * @param {loop.Dispatcher} dispatcher  The dispatcher for dispatching actions
   *                                      and registering to consume actions.
   */
  var ServerConnectionStore = loop.store.createStore({
    /**
     * The time factor to adjust the expires time to ensure that we send a refresh
     * before the expiry. Currently set as 90%.
     */
    expiresTimeFactor: 0.9,

    /**
     * Registered actions.
     * @type {Array}
     */
    actions: [
      "fetchServerData",
      "setupWebRTCTokens",
      "setupWindowData",
      "updateRoomInfo",
      "windowUnload"
    ],

    /**
     * Returns initial state data for this active room.
     *
     * When adding states, consider if _statesToResetOnLeave needs updating
     * as well.
     */
    getInitialStoreState: function() {
      return {
        // The session token for the WebRTC connection, currently used
        // for authentication for the room refreshes.
        sessionToken: null,
        // The room token.
        roomToken: null,
        // Any context urls associated with the room. This will be for older
        // rooms. XXX akita - update comment with how these are migrated?
        roomContextUrls: null,
        // The room name.
        roomName: null,
        // The room url.
        roomUrl: null,
        // The encryption key for the room.
        roomCryptoKey: null,
        // True if this is running in the standalone context.
        standalone: false
      };
    },

    _initRoomListeners: function() {
      if (this._onUpdateListener) {
        return;
      }

      this._onUpdateListener = this._handleRoomUpdate.bind(this);

      loop.request("Rooms:PushSubscription", ["update:" + this._storeState.roomToken]);
      loop.subscribe("Rooms:Update:" + this._storeState.roomToken,
        this._handleRoomUpdate.bind(this));
    },

    /**
     * Execute setupWindowData event action from the dispatcher. This just
     * stores the room token.
     *
     * @param {sharedActions.SetupWindowData} actionData
     * @return {Promise} For testing purposes, returns a promise that is resolved
     *                   once data is received from the server, and it is determined
     *                   if Firefox handles the room or not.
     */
    setupWindowData: function(actionData) {
      this.setStoreState({
        roomToken: actionData.roomToken
      });

      var joinRoomPromise = this._joinRoom();

      var roomDataPromise = this._getRoomDataForDesktop();

      // Get the window data from the Loop API.
      return Promise.all([joinRoomPromise, roomDataPromise]);
    },

    _getRoomDataForDesktop: function() {
      return loop.request("Rooms:Get", this._storeState.roomToken).then(function(result) {
        var room = result;

        if (result.isError) {
          this.dispatchAction(new sharedActions.RoomFailure({
            error: result,
            failedJoinRequest: false
          }));
          return;
        }

        this._initRoomListeners();

        this.dispatchAction(new sharedActions.UpdateRoomInfo({
          participants: room.participants,
          roomContextUrls: room.decryptedContext.urls,
          roomName: room.decryptedContext.roomName,
          roomUrl: room.roomUrl,
          userId: room.userId
        }));
      }.bind(this));
    },

    /**
     * Execute fetchServerData event action from the dispatcher. For rooms
     *
     * @param {sharedActions.SetupWindowData} actionData
     */
    fetchServerData: function(actionData) {
      if (actionData.windowType !== "room") {
        // Nothing for us to do here, leave it to other stores.
        return Promise.resolve();
      }

      this.setStoreState({
        roomToken: actionData.token,
        roomCryptoKey: actionData.cryptoKey,
        standalone: true
      });

      var dataPromise = this._getRoomDataForStandalone(actionData.cryptoKey);

      var userAgentHandlesPromise = this._promiseDetectUserAgentHandles();

      var joinRoomPromise = this._joinRoom();

      return Promise.all([dataPromise, userAgentHandlesPromise, joinRoomPromise]).then(function(results) {
        this._initRoomListeners();

        // We batch up actions and send them once we've got all the data, so that
        // we don't prematurely display buttons/information before we're ready.
        results.forEach(function(result) {
          if (result && "sendAction" in result) {
            this.dispatcher.dispatch(result.sendAction);
          }
        }.bind(this));
      }.bind(this));
    },

    /**
     * Gets the room data for the standalone, decrypting it as necessary.
     *
     * @param  {String} roomCryptoKey The crypto key associated to the room.
     * @return {Promise}              A promise that is resolved once the get
     *                                and decryption is complete.
     */
    _getRoomDataForStandalone: function(roomCryptoKey) {
      return new Promise(function(resolve) {
        loop.request("Rooms:Get", this._storeState.roomToken).then(function(result) {
          if (result.isError) {
            resolve(new sharedActions.RoomFailure({
              error: result,
              failedJoinRequest: false
            }));
            return;
          }

          var roomInfoData = new sharedActions.UpdateRoomInfo({
            // If we've got this far, then we want to go to the ready state
            // regardless of success of failure. This is because failures of
            // crypto don't stop the user using the room, they just stop
            // us putting up the information.
            roomUrl: result.roomUrl,
            userId: result.userId
          });

          if (!result.context && !result.roomName) {
            roomInfoData.roomInfoFailure = ROOM_INFO_FAILURES.NO_DATA;
            resolve({ sendAction: roomInfoData });
            return;
          }

          // This handles 'legacy', non-encrypted room names.
          if (result.roomName && !result.context) {
            roomInfoData.roomName = result.roomName;
            resolve({ sendAction: roomInfoData });
            return;
          }

          if (!crypto.isSupported()) {
            roomInfoData.roomInfoFailure = ROOM_INFO_FAILURES.WEB_CRYPTO_UNSUPPORTED;
            resolve({ sendAction: roomInfoData });
            return;
          }

          if (!roomCryptoKey) {
            roomInfoData.roomInfoFailure = ROOM_INFO_FAILURES.NO_CRYPTO_KEY;
            resolve({ sendAction: roomInfoData });
            return;
          }

          crypto.decryptBytes(roomCryptoKey, result.context.value)
                .then(function(decryptedResult) {
            var realResult = JSON.parse(decryptedResult);

            roomInfoData.roomContextUrls = realResult.urls;
            roomInfoData.roomName = realResult.roomName;
            resolve({ sendAction: roomInfoData });
          }, function() {
            roomInfoData.roomInfoFailure = ROOM_INFO_FAILURES.DECRYPT_FAILED;
            resolve({ sendAction: roomInfoData });
          });
        }.bind(this));
      }.bind(this));
    },
    /**
     * If the user agent is Firefox, it sends a message to Firefox to see if
     * the room can be handled within Firefox rather than the standalone UI.
     *
     * @return {Promise} A promise that is resolved once it has been determined
     *                   if Firefox can handle the room.
     */
    _promiseDetectUserAgentHandles: function() {
      return new Promise(function(resolve) {
        function resolveWithNotHandlingResponse() {
          resolve({
            sendAction: new sharedActions.UserAgentHandlesRoom({
              handlesRoom: false
            })
          });
        }

        // If we're not Firefox, don't even try to see if it can be handled
        // in the browser.
        if (!loop.shared.utils.isFirefox(navigator.userAgent)) {
          resolveWithNotHandlingResponse();
          return;
        }

        // Set up a timer in case older versions of Firefox don't give us a response.
        var timer = setTimeout(resolveWithNotHandlingResponse, 250);
        var webChannelListenerFunc;

        // Listen for the result.
        function webChannelListener(e) {
          if (e.detail.id !== "loop-link-clicker") {
            return;
          }

          // Stop the default response.
          clearTimeout(timer);

          // Remove the listener.
          window.removeEventListener("WebChannelMessageToContent", webChannelListenerFunc);

          // Resolve with the details of if we're able to handle or not.
          resolve({
            sendAction: new sharedActions.UserAgentHandlesRoom({
              handlesRoom: !!e.detail.message && e.detail.message.response
            })
          });
        }

        webChannelListenerFunc = webChannelListener.bind(this);

        window.addEventListener("WebChannelMessageToContent", webChannelListenerFunc);

        // Now send a message to the chrome to see if it can handle this room.
        window.dispatchEvent(new window.CustomEvent("WebChannelMessageToChrome", {
          detail: {
            id: "loop-link-clicker",
            message: {
              command: "checkWillOpenRoom",
              roomToken: this._storeState.roomToken
            }
          }
        }));
      }.bind(this));
    },

    /**
     * Handles the updateRoomInfo action. Updates the room data.
     *
     * @param {sharedActions.UpdateRoomInfo} actionData
     */
    updateRoomInfo: function(actionData) {
      var newState = {
        roomUrl: actionData.roomUrl
      };
      // Iterate over the optional fields that _may_ be present on the actionData
      // object.
      Object.keys(OPTIONAL_ROOMINFO_FIELDS).forEach(function(field) {
        if (actionData[field] !== undefined) {
          newState[OPTIONAL_ROOMINFO_FIELDS[field]] = actionData[field];
        }
      });

      this.setStoreState(newState);
    },

    /**
     * Handles room updates notified by the Loop rooms API.
     *
     * @param {Object} roomData  The new roomData.
     */
    _handleRoomUpdate: function(roomData) {
      this.dispatchAction(new sharedActions.UpdateRoomInfo({
        roomContextUrls: roomData.decryptedContext.urls,
        participants: roomData.participants,
        roomName: roomData.decryptedContext.roomName,
        roomUrl: roomData.roomUrl
      }));
    },

    /**
     * Handles saving the needed sessionToken
     *
     * @param {sharedActions.SetupWebRTCTokens} actionData
     */
    setupWebRTCTokens: function(actionData) {
      this.setStoreState({
        sessionToken: actionData.sessionToken
      });
    },

    /**
     * Handles the action that signifies when media permission has been
     * granted and starts joining the room.
     */
    _joinRoom: function() {
      return loop.request("Rooms:Join", this._storeState.roomToken,
        mozL10n.get("display_name_guest")).then(function(result) {
        if (result.isError) {
          this.dispatchAction(new sharedActions.RoomFailure({
            error: result,
            // This is an explicit flag to avoid the leave happening if join
            // fails. We can't track it on ROOM_STATES.JOINING as the user
            // might choose to leave the room whilst the XHR is in progress
            // which would then mean we'd run the race condition of not
            // notifying the server of a leave.
            failedJoinRequest: true
          }));
          return;
        }

        this.dispatchAction(new sharedActions.SetupWebRTCTokens({
          apiKey: result.apiKey,
          sessionToken: result.sessionToken,
          sessionId: result.sessionId
        }));

        this._setRefreshTimeout(result.expires);
      }.bind(this));
    },

    /**
     * Handles the window being unloaded.
     */
    windowUnload: function() {
      if (this._timeout) {
        clearTimeout(this._timeout);
        delete this._timeout;

        // If we're not going to close the window, we can hangup the call ourselves.
        // NOTE: when the window _is_ closed, hanging up the call is performed by
        //       MozLoopService, because we can't get a message across to LoopAPI
        //       in time whilst a window is closing.
        if (!this._isDesktop) {
          loop.request("HangupNow", this._storeState.roomToken,
            this._storeState.sessionToken);
        }
      }

      if (!this._onUpdateListener) {
        return;
      }

      // If we're closing the window, we can stop listening to updates.
      var roomToken = this._storeState.roomToken;
      loop.unsubscribe("Rooms:Update:" + roomToken, this._onUpdateListener);
      delete this._onUpdateListener;
    },

    /**
     * Handles setting of the refresh timeout callback.
     *
     * @param {Integer} expireTime The time until expiry (in seconds).
     */
    _setRefreshTimeout: function(expireTime) {
      this._timeout = setTimeout(this._refreshMembership.bind(this),
        expireTime * this.expiresTimeFactor * 1000);
    },

    /**
     * Refreshes the membership of the room with the server, and then
     * sets up the refresh for the next cycle.
     */
    _refreshMembership: function() {
      loop.request("Rooms:RefreshMembership", this._storeState.roomToken,
        this._storeState.sessionToken)
        .then(function(result) {
          if (result.isError) {
            this.dispatchAction(new sharedActions.RoomFailure({
              error: result,
              failedJoinRequest: false
            }));
            return;
          }

          this._setRefreshTimeout(result.expires);
        }.bind(this));
    }
  });

  return ServerConnectionStore;
})(navigator.mozL10n || document.mozL10n);
