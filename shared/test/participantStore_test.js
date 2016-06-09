/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

describe("loop.store.ParticipantStore", () => {
  "use strict";

  let { expect } = chai;
  let { actions } = loop.shared;
  let clock, dispatcher, fakeDataDriver, now, sandbox, store;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    sandbox = LoopMochaUtils.createSandbox();

    dispatcher = new loop.Dispatcher();
    sandbox.stub(dispatcher, "dispatch");

    fakeDataDriver = {
      updateCurrentParticipant: sinon.stub(),
      updateCurrentPresence: sinon.stub()
    };

    now = Date.now();
    sandbox.stub(Date, "now", () => now);

    store = new loop.store.ParticipantStore(dispatcher, {
      dataDriver: fakeDataDriver,
      updateParticipant: true
    });
  });

  afterEach(() => {
    clock.restore();
    sandbox.restore();
    LoopMochaUtils.restore();
  });

  describe("#getInitialStoreState", () => {
    it("should return an object with a property called participants", () => {
      let initialState = store.getInitialStoreState();

      expect(initialState.participants).not.eql(null);
    });
  });

  describe("leaveRoom", () => {
    it("should update presence to not here", () => {
      store._currentUserId = "myID";
      let action = new actions.LeaveRoom();
      store.leaveRoom(action);

      sinon.assert.calledOnce(fakeDataDriver.updateCurrentPresence);
      sinon.assert.calledWithExactly(fakeDataDriver.updateCurrentPresence,
        "myID", false);
    });
  });

  describe("setOwnDisplayName", () => {
    it("should update current participant's name", () => {
      let action = new actions.SetOwnDisplayName({ displayName: "Cool Name" });
      store.setOwnDisplayName(action);

      expect(store._currentUserObject.participantName).eql("Cool Name");
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

    it("should skip the current participant", () => {
      store._currentUserId = "myID";
      let action = new actions.UpdatedParticipant({
        userId: "myID",
        participantName: "my name"
      });
      store.updatedParticipant(action);

      let participants = store.getStoreState("participants");
      expect(participants.get("myID")).eql(undefined);
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

    it("should start an expiration timer", () => {
      let action = new actions.UpdatedPresence({
        userId: "fakeID",
        isHere: true,
        pingedAgo: 1000
      });

      expect(store._expireTimer).eql(null);
      store.updatedPresence(action);

      expect(store._expireTimer).not.eql(null);
    });

    it("should expire after some time", () => {
      sandbox.stub(store, "_expirePresence");
      let action = new actions.UpdatedPresence({
        userId: "fakeID",
        isHere: true,
        pingedAgo: 1000
      });

      store.updatedPresence(action);
      sinon.assert.notCalled(store._expirePresence);

      clock.tick(60000);
      sinon.assert.called(store._expirePresence);
    });

    it("should skip the current participant", () => {
      store._currentUserId = "myID";
      let action = new actions.UpdatedPresence({
        userId: "myID",
        isHere: true,
        pingedAgo: 0
      });
      store.updatedPresence(action);

      let participants = store.getStoreState("participants");
      expect(participants.get("myID")).eql(undefined);
    });
  });

  describe("_expirePresence", () => {
    let participants;
    beforeEach(() => {
      participants = store.getStoreState("participants");
      participants.set("fakeID", {
          participantName: "Cool Name",
          isHere: false,
          localPingTime: null
      });
      participants.set("fakeID2", {
        participantName: "Cool Name",
        isHere: true,
        localPingTime: now
      });
      store.setStoreState({ participants });
    });

    it("should leave left and recent participants untouched", () => {
      store._expirePresence();
      let onlineParticipants = store.getOnlineParticipants();
      expect(onlineParticipants.length).eql(1);
    });

    it("should expire old participants", () => {
      participants.set("fakeID3", {
        participantName: "expired",
        isHere: true,
        localPingTime: now - 120000
      });
      store._expirePresence();

      let onlineParticipants = store.getOnlineParticipants();
      expect(onlineParticipants.length).eql(1);
    });

    it("should keep multiple recent participants", () => {
      participants.set("fakeID3", {
        participantName: "not expired",
        isHere: true,
        localPingTime: now
      });
      store._expirePresence();

      let onlineParticipants = store.getOnlineParticipants();
      expect(onlineParticipants.length).eql(2);
    });
  });

  describe("updateRoomInfo", () => {
    it("should remember the user id", () => {
      let action = new actions.UpdateRoomInfo({
        roomUrl: "fake",
        userId: "myID"
      });
      store.updateRoomInfo(action);

      expect(store._currentUserId).eql("myID");
    });

    it("should update the participant record", () => {
      let action = new actions.UpdateRoomInfo({
        roomUrl: "fake",
        userId: "fakeID"
      });
      store.updateRoomInfo(action);

      sinon.assert.calledOnce(fakeDataDriver.updateCurrentParticipant);
      sinon.assert.calledWithExactly(fakeDataDriver.updateCurrentParticipant,
        "fakeID", {});
    });

    it("should update the presence record", () => {
      let action = new actions.UpdateRoomInfo({
        roomUrl: "fake",
        userId: "fakeID"
      });
      store.updateRoomInfo(action);

      sinon.assert.calledOnce(fakeDataDriver.updateCurrentPresence);
      sinon.assert.calledWithExactly(fakeDataDriver.updateCurrentPresence,
        "fakeID", true);
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
