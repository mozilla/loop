/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

describe("loop.store.ParticipantStore", () => {
  "use strict";

  let { expect } = chai;
  let { actions } = loop.shared;
  let clock, dispatcher, fakeDataDriver, now, sandbox, store;
  let callCount, sendMessage;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    sandbox = LoopMochaUtils.createSandbox();
    callCount = 0;

    dispatcher = new loop.Dispatcher();
    sandbox.stub(dispatcher, "dispatch");

    fakeDataDriver = {
      updateCurrentParticipant: sinon.stub(),
      updateCurrentPresence: sinon.stub()
    };

    now = Date.now();
    sandbox.stub(Date, "now", () => now);

    // Spy must be created before initialize is called.
    sandbox.spy(loop.store.ParticipantStore.prototype, "setOwnDisplayName");
    sandbox.spy(loop.store.ParticipantStore.prototype, "updateOwnDisplayName");

    // stubs for loop.subscribe events
    window.addMessageListener = (name, cb) => {
      sendMessage = cb;
      ++callCount;
    };
    window.removeMessageListener = sinon.stub();
    window.sendAsyncMessage = sinon.stub();

    store = new loop.store.ParticipantStore(dispatcher, {
      dataDriver: fakeDataDriver,
      updateParticipant: true
    });
  });

  afterEach(() => {
    clock.restore();
    sandbox.restore();
    LoopMochaUtils.restore();

    loop.request.reset();
    loop.subscribe.reset();

    sendMessage = null;
    delete window.addMessageListener;
    delete window.removeMessageListener;
    delete window.sendAsyncMessage;
  });

  describe("#initialize", () => {
    it("should subscribe to 'Panel:SetOwnDisplayName' actions", () => {
      // initialize called in main 'beforeEach' block where TextChatStore
      // is initialized.
      let subscriptions = loop.subscribe.inspect();

      expect(callCount).to.eql(1);
      expect(Object.getOwnPropertyNames(subscriptions).length).to.eql(1);
      expect(subscriptions["Panel:SetOwnDisplayName"].length).to.eql(1);
    });

    it("should call updateOwnDisplayName on 'Panel:SetOwnDisplayName' events", () => {
      let setNameAction = new actions.SetOwnDisplayName({
        displayName: "FooBar"
      });
      let actionData = { data: [setNameAction] };

      sendMessage({ data: ["Panel:SetOwnDisplayName", actionData] });

      sinon.assert.calledOnce(store.updateOwnDisplayName);
      sinon.assert.calledWithExactly(store.updateOwnDisplayName, actionData);
    });

    it("should pass the new username to setOwnDisplayName", () => {
      let setNameAction = new actions.SetOwnDisplayName({
        displayName: "FooBar"
      });
      let actionData = { data: [setNameAction] };

      sendMessage({ data: ["Panel:SetOwnDisplayName", actionData] });

      sinon.assert.calledOnce(store.setOwnDisplayName);
      sinon.assert.calledWithExactly(store.setOwnDisplayName,
        actionData.data[0]);
    });

    it("should updateRoomInfo on 'Panel:SetOwnDisplayName'", () => {
      let setNameAction = new actions.SetOwnDisplayName({
        displayName: "FooBar"
      });
      let actionData = { data: [setNameAction] };
      let userId = "42";
      store._currentUserId = userId;
      sandbox.stub(store, "updateRoomInfo");

      sendMessage({ data: ["Panel:SetOwnDisplayName", actionData] });

      sinon.assert.calledOnce(store.updateRoomInfo);
      sinon.assert.calledWithExactly(store.updateRoomInfo, { userId });
    });
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
    beforeEach(() => {
      store._currentUserId = null;
    });

    it("should remember the user id", () => {
      let action = new actions.UpdateRoomInfo({
        roomUrl: "fake",
        userId: "myID"
      });
      store.updateRoomInfo(action);

      expect(store._currentUserId).eql("myID");
    });

    it("should not add a new participant if user id is not defined", () => {
      let action = new actions.UpdateRoomInfo({
        roomUrl: "fake",
        userId: undefined
      });
      store.updateRoomInfo(action);

      expect(store._currentUserId).eql(null);
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
