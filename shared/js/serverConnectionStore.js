/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var loop = loop || {};
loop.store = loop.store || {};

loop.store.ServerConnectionStore = (function(mozL10n) {
  "use strict";

  var sharedActions = loop.shared.actions;

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
      "joinedRoom",
      "gotMediaPermission",
      "setupWindowData"
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
        roomToken: null
      };
    },

    /**
     * Execute setupWindowData event action from the dispatcher. This just
     * stores the room token.
     *
     * @param {sharedActions.SetupWindowData} actionData
     */
    setupWindowData: function(actionData) {
      this.setStoreState({
        roomToken: actionData.roomToken
      });
    },

    /**
     * Execute fetchServerData event action from the dispatcher. For rooms
     *
     * @param {sharedActions.SetupWindowData} actionData
     */
    fetchServerData: function(actionData) {
      this.setStoreState({
        roomToken: actionData.token
      });
    },

    /**
     * Handles saving the needed sessionToken
     *
     * @param {sharedActions.JoinedRoom} actionData
     */
    joinedRoom: function(actionData) {
      this.setStoreState({
        sessionToken: actionData.sessionToken
      });
    },

    /**
     * Handles the action that signifies when media permission has been
     * granted and starts joining the room.
     */
    gotMediaPermission: function() {
      loop.request("Rooms:Join", this._storeState.roomToken,
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

        this.dispatchAction(new sharedActions.JoinedRoom({
          apiKey: result.apiKey,
          sessionToken: result.sessionToken,
          sessionId: result.sessionId,
          expires: result.expires
        }));

        this._setRefreshTimeout(result.expires);
      }.bind(this));
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
