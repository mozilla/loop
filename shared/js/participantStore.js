/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var loop = loop || {};
loop.store = loop.store || {};

loop.store.ParticipantStore = function() {
  "use strict";

  // The time between presence updates.
  const PING_TIME = 60000;

  const PARTICIPANT_SCHEMA = {
    participantName: "",
    isHere: false,
    localPingTime: null
  };

  /**
   * Participant store.
   *
   * @param {loop.Dispatcher} dispatcher  The dispatcher for dispatching actions
   *                                      and registering to consume actions.
   * @param {Object}          options     Options object:
   * - {DataDriver} dataDriver The driver to use for updating the participant.
   * - {Boolean} updateParticipant True to periodically update. Default false.
   */
  var ParticipantStore = loop.store.createStore({
    initialize(options = {}) {
      if (!options.dataDriver) {
        throw new Error("Missing option dataDriver");
      }

      this._dataDriver = options.dataDriver;

      if (options.updateParticipant) {
        this._currentUserObject = {};
        this.dispatcher.register(this, [
          "leaveRoom",
          "setOwnDisplayName"
        ]);
      }

      this._expireTimer = null;
    },

    getInitialStoreState() {
      return {
        participants: new Map()
      };
    },

    actions: [
      "updatedParticipant",
      "updatedPresence",
      "updateRoomInfo"
    ],

    /**
     * Checks if the room is empty or has participants.
     */
    _hasParticipants() {
      return this._storeState.participants.size > 0;
    },

    /**
     * Handle LeaveRoom action by updating the current user's presence.
     */
    leaveRoom() {
      this._updatePresence(false);
    },

    /**
     * Handle SetOwnDisplayName action by saving the the current user's name.
     */
    setOwnDisplayName({ displayName }) {
      this._currentUserObject.participantName = displayName;
    },

    updatedParticipant(actionData) {
      if (actionData.userId === this._currentUserId) {
        if (this._currentUserObject) {
          this._currentUserObject.participantName = actionData.participantName;
        }
        return;
      }

      this._updateParticipantData(actionData.userId, {
        participantName: actionData.participantName
      });
    },

    updatedPresence(actionData) {
      if (actionData.userId === this._currentUserId) {
        return;
      }

      this._updateParticipantData(actionData.userId, {
        isHere: actionData.isHere,
        localPingTime: Date.now() - actionData.pingedAgo
      });

      // We just got some presence that we might need to expire later.
      if (this._expireTimer === null) {
        this._expireTimer = setTimeout(() => this._expirePresence(), PING_TIME);
      }
    },

    _updateParticipantData(userId, updatedData) {
      let updatedParticipant = this._storeState.participants.get(userId);
      if (!updatedParticipant) {
        updatedParticipant = _.extend({}, PARTICIPANT_SCHEMA);
      }

      for (let key in updatedData) {
        if (updatedParticipant.hasOwnProperty(key)) {
          updatedParticipant[key] = updatedData[key];
        }
      }

      this.setStoreState({
        participants: this._storeState.participants.set(userId, updatedParticipant)
      });
    },

    /**
     * Check for old presence records of other participants to expire them.
     */
    _expirePresence() {
      this._expireTimer = null;

      // Figure out which participants are still here or expired.
      let anyHere = false;
      let expiredAny = false;
      let { participants } = this._storeState;
      participants.forEach(participant => {
        // We're only interested in participants that might be here.
        if (participant.isHere) {
          // For presence records that are expired, mark them as not here.
          if (Date.now() - participant.localPingTime > PING_TIME) {
            participant.isHere = false;
            expiredAny = true;
          }
          // Remember that there's someone here.
          else {
            anyHere = true;
          }
        }
      });

      // Update the store with now-expired participants to trigger events.
      if (expiredAny) {
        this.setStoreState({ participants });
      }

      // Keep checking for expiration if there's anyone here.
      if (anyHere) {
        this._expireTimer = setTimeout(() => this._expirePresence(), PING_TIME);
      }
    },

    /**
     * Handle UpdateRoomInfo action by saving the id for the current user.
     */
    updateRoomInfo({ userId }) {
      this._currentUserId = userId;

      // Only update if this store is tracking the current user.
      if (this._currentUserObject) {
        this._dataDriver.updateCurrentParticipant(userId, this._currentUserObject);
        this._updatePresence(true);
      }
    },

    /**
     * Update the presence for the current user.
     *
     * @param {Boolean} isHere True to indicate the user hasn't left.
     */
    _updatePresence(isHere) {
      clearTimeout(this._presenceTimer);
      this._presenceTimer = null;

      this._dataDriver.updateCurrentPresence(this._currentUserId, isHere);

      // Keep updating the presence until the user leaves.
      if (isHere) {
        this._presenceTimer = setTimeout(() => this._updatePresence(isHere), PING_TIME);
      }
    },

    /*
     * Gets the online participants in the room taking into account
     * unexpected disconnects/leaves.
     *
     * @return {Array} Returns an array which contains the data of the current
     *                 online participants.
     */
    getOnlineParticipants() {
      // XXX akita bug 1277702: Max ping time allowed is not quite defined
      // yet, so use 1 minute now. If changing this, don't forget the test.
      return [...this._storeState.participants.values()].filter(participant =>
        participant.isHere && Date.now() - participant.localPingTime <= PING_TIME);
    }
  });

  return ParticipantStore;
}();
