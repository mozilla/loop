/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

describe("loop.store.ParticipantStore", () => {
  "use strict";

  let { expect } = chai;
  let { actions } = loop.shared;
  let sandbox, dispatcher, store, now;

  beforeEach(() => {
    sandbox = LoopMochaUtils.createSandbox();

    dispatcher = new loop.Dispatcher();
    sandbox.stub(dispatcher, "dispatch");

    now = Date.now();
    sandbox.stub(Date, "now", () => now);

    store = new loop.store.ParticipantStore(dispatcher);
  });

  afterEach(() => {
    sandbox.restore();
    LoopMochaUtils.restore();
  });

  describe("#getInitialStoreState", () => {
    it("should return an object with a property called participants", () => {
      let initialState = store.getInitialStoreState();

      expect(initialState.participants).not.eql(null);
    });
  });

  describe("updatedParticipant", () => {
    it("should store the participant", () => {
      let action = new actions.UpdatedParticipant({
        userId: "fakeID",
        participantName: "fakeName"
      });

      let participants = store.getStoreState("participants");
      store.updatedParticipant(action);
      expect(participants.get("fakeID")).not.eql(undefined);
      expect(participants.get("fakeID")).eql({
        participantName: "fakeName",
        isHere: false,
        localPingTime: null
      });
    });
  });

  describe("_hasParticipants", () => {
    beforeEach(() => {
      let currentParticipants = store.getStoreState("participants");
      store.setStoreState({
        participants: currentParticipants.set("fakeID", {
          participantName: "Cool Name",
          isHere: false,
          localPingTime: null
        })
      });
    });

    it("should check if the room has participants", () => {
      let hasParticipants = store._hasParticipants();

      expect(hasParticipants).eql(true);
    });
  });

  describe("updatedPresence", () => {
    beforeEach(() => {
      let currentParticipants = store.getStoreState("participants");
      store.setStoreState({
        participants: currentParticipants.set("fakeID", {
          participantName: "Cool Name",
          isHere: false,
          localPingTime: null
        })
      });
    });

    it("should store the participant presence data", () => {
      let action = new actions.UpdatedPresence({
        userId: "fakeID",
        isHere: true,
        pingedAgo: 1000
      });

      let participants = store.getStoreState("participants");
      store.updatedPresence(action);
      expect(participants.get("fakeID").isHere).eql(true);
      expect(participants.get("fakeID").localPingTime).eql(now - 1000);
    });
  });

  describe("getOnlineParticipants", () => {
    beforeEach(() => {
      let currentParticipants = store.getStoreState("participants");
      currentParticipants.set("fakeID", {
          participantName: "Cool Name",
          isHere: false,
          localPingTime: null
      });
      currentParticipants.set("fakeID2", {
        participantName: "Cool Name",
        isHere: true,
        localPingTime: now
      });
      store.setStoreState({
        participants: currentParticipants
      });
    });

    it("should return the participants that are online in the room", () => {
      let onlineParticipants = store.getOnlineParticipants();
      expect(onlineParticipants.length).eql(1);
    });

    it("should not return participants whose pingTime has not been updated recently", () => {
      let currentParticipants = store.getStoreState("participants");
      currentParticipants.set("fakeID2", {
        participantName: "Cool Name",
        isHere: true,
        localPingTime: now - 120000
      });

      store.setStoreState({
        participants: currentParticipants
      });

      let onlineParticipants = store.getOnlineParticipants();
      expect(onlineParticipants.length).eql(0);
    });
  });
});
