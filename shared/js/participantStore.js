/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var loop = loop || {};
loop.store = loop.store || {};

loop.store.ParticipantStore = function() {
  "use strict";

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
   */
  var ParticipantStore = loop.store.createStore({
    getInitialStoreState() {
      return {
        participants: new Map()
      };
    },

    actions: [
      "updatedParticipant",
      "updatedPresence"
    ],

    /**
     * Checks if the room is empty or has participants.
     */
    _hasParticipants() {
      return this._storeState.participants.size > 0;
    },

    updatedParticipant(actionData) {
      this._updateParticipantData(actionData.userId, {
        participantName: actionData.participantName
      });
    },

    updatedPresence(actionData) {
      this._updateParticipantData(actionData.userId, {
        isHere: actionData.isHere,
        localPingTime: Date.now() - actionData.pingedAgo
      });
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
        participant.isHere && Date.now() - participant.localPingTime <= 60000);
    }
  });

  return ParticipantStore;
}();
