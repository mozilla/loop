/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

describe("loop.store.TextChatStore", function() {
  "use strict";

  var expect = chai.expect;
  var sharedActions = loop.shared.actions;
  var CHAT_MESSAGE_TYPES = loop.store.CHAT_MESSAGE_TYPES;
  var CHAT_CONTENT_TYPES = loop.shared.utils.CHAT_CONTENT_TYPES;

  var dispatcher, fakeDataDriver, sandbox, store;

  var callCount, sendMessage;

  beforeEach(function() {
    callCount = 0;
    sandbox = sinon.sandbox.create();
    sandbox.useFakeTimers();

    dispatcher = new loop.Dispatcher();
    sandbox.stub(dispatcher, "dispatch");
    // Spy must be created before initialize is called.
    sandbox.spy(loop.store.TextChatStore.prototype, "setOwnDisplayName");
    sandbox.spy(loop.store.TextChatStore.prototype, "updateOwnDisplayName");

    fakeDataDriver = {
      sendTextChatMessage: sinon.stub()
    };

    // stubs for loop.subscribe events
    window.addMessageListener = (name, cb) => {
      sendMessage = cb;
      ++callCount;
    };
    window.removeMessageListener = sinon.stub();
    window.sendAsyncMessage = sinon.stub();

    store = new loop.store.TextChatStore(dispatcher, {
      dataDriver: fakeDataDriver
    });

    sandbox.stub(window, "dispatchEvent");
    sandbox.stub(window, "CustomEvent", function(name) {
      this.name = name;
    });
  });

  afterEach(function() {
    sandbox.restore();

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
      var subscriptions = loop.subscribe.inspect();

      expect(callCount).to.eql(1);
      expect(Object.getOwnPropertyNames(subscriptions).length).to.eql(1);
      expect(subscriptions["Panel:SetOwnDisplayName"].length).to.eql(1);
    });

    it("should call updateOwnDisplayName on 'Panel:SetOwnDisplayName' events", () => {
      var setNameAction = new sharedActions.SetOwnDisplayName({
        displayName: "FooBar"
      });
      var actionData = { data: [setNameAction] };

      sendMessage({ data: ["Panel:SetOwnDisplayName", actionData] });

      sinon.assert.calledOnce(store.updateOwnDisplayName);
      sinon.assert.calledWithExactly(store.updateOwnDisplayName, actionData);
    });

    it("should pass the new username to setOwnDisplayName", () => {
      var setNameAction = new sharedActions.SetOwnDisplayName({
        displayName: "FooBar"
      });
      var actionData = { data: [setNameAction] };

      sendMessage({ data: ["Panel:SetOwnDisplayName", actionData] });

      sinon.assert.calledOnce(store.setOwnDisplayName);
      sinon.assert.calledWithExactly(store.setOwnDisplayName,
                                     actionData.data[0]);
    });
  });

  describe("#actions", function() {
    it("should have 'setOwnDisplayName' in the actions array", function() {
      expect("setOwnDisplayName").to.be.oneOf(store.actions);
    });
  });

  describe("#dataChannelsAvailable", function() {
    it("should set textChatEnabled to the supplied state", function() {
      store.dataChannelsAvailable(new sharedActions.DataChannelsAvailable({
        available: true
      }));

      expect(store.getStoreState("textChatEnabled")).eql(true);
    });

    it("should dispatch a LoopChatEnabled event", function() {
      store.dataChannelsAvailable(new sharedActions.DataChannelsAvailable({
        available: true
      }));

      sinon.assert.calledOnce(window.dispatchEvent);
      sinon.assert.calledWithExactly(window.dispatchEvent,
        new CustomEvent("LoopChatEnabled"));
    });

    it("should not dispatch a LoopChatEnabled event if available is false", function() {
      store.dataChannelsAvailable(new sharedActions.DataChannelsAvailable({
        available: false
      }));

      sinon.assert.notCalled(window.dispatchEvent);
    });
  });

  describe("#getInitialStoreState", function() {
    it("should return an object which has no ownUserInfo property", function() {
      let initialState = store.getInitialStoreState();

      expect(initialState).to.not.have.property("displayName");
    });
  });

  describe("#receivedTextChatMessage", function() {
    it("should add the message to the list", function() {
      var message = "Hello!";

      store.receivedTextChatMessage({
        contentType: CHAT_CONTENT_TYPES.TEXT,
        message: message,
        displayName: "Display Name",
        extraData: undefined,
        sentTimestamp: "2015-06-24T23:58:53.848Z",
        receivedTimestamp: "1970-01-01T00:00:00.000Z"
      });

      expect(store.getStoreState("messageList")).eql([{
        type: CHAT_MESSAGE_TYPES.RECEIVED,
        contentType: CHAT_CONTENT_TYPES.TEXT,
        message: message,
        displayName: "Display Name",
        extraData: undefined,
        sentTimestamp: "2015-06-24T23:58:53.848Z",
        receivedTimestamp: "1970-01-01T00:00:00.000Z"
      }]);
    });

    it("should add the context tile to the list", function() {
      store.receivedTextChatMessage({
        type: CHAT_MESSAGE_TYPES.SENT,
        contentType: CHAT_CONTENT_TYPES.CONTEXT_TILE,
        message: "fake",
        extraData: {
          roomToken: "fakeRoomToken",
          newRoomThumbnail: "favicon",
          newRoomURL: "https://www.fakeurl.com"
        },
        sentTimestamp: "2015-06-24T23:58:53.848Z",
        receivedTimestamp: "1970-01-01T00:00:00.000Z"
      });

      expect(store.getStoreState("messageList")).eql([{
        type: CHAT_MESSAGE_TYPES.RECEIVED,
        contentType: CHAT_CONTENT_TYPES.CONTEXT_TILE,
        message: "fake",
        extraData: {
          roomToken: "fakeRoomToken",
          newRoomThumbnail: "favicon",
          newRoomURL: "https://www.fakeurl.com"
        },
        sentTimestamp: "2015-06-24T23:58:53.848Z",
        receivedTimestamp: "1970-01-01T00:00:00.000Z"
      }]);
    });

    it("should not add messages for unknown content types", function() {
      store.receivedTextChatMessage({
        contentType: "invalid type",
        message: "Hi",
        displayName: "Display Name"
      });

      expect(store.getStoreState("messageList").length).eql(0);
    });

    it("should dispatch a LoopChatMessageAppended event", function() {
      store.setStoreState({ textChatEnabled: true });
      store.receivedTextChatMessage({
        contentType: CHAT_CONTENT_TYPES.TEXT,
        message: "Hello!",
        displayName: "Fake Name"
      });

      sinon.assert.calledOnce(window.dispatchEvent);
      sinon.assert.calledWithExactly(window.dispatchEvent,
        new CustomEvent("LoopChatMessageAppended"));
    });
  });

  describe("#sendTextChatMessage", function() {
    it("should send the message", function() {
      store.setStoreState({ displayName: "John Smith" });
      var messageData = {
        contentType: CHAT_CONTENT_TYPES.TEXT,
        displayName: "John Smith",
        message: "Yes, that's what this is called."
      };

      store.sendTextChatMessage(messageData);

      sinon.assert.calledOnce(fakeDataDriver.sendTextChatMessage);
      sinon.assert.calledWithExactly(fakeDataDriver.sendTextChatMessage, messageData);
    });

    // Bug 1279054 changed the way it is displayed, until we can
    // compare userId on fixing Bug 1279792
    it.skip("should add the message to the list", function() {
      store.setStoreState({ displayName: "John Smith" });
      var messageData = {
        contentType: CHAT_CONTENT_TYPES.TEXT,
        message: "It's awesome!",
        sentTimestamp: "2015-06-24T23:58:53.848Z",
        receivedTimestamp: "2015-06-24T23:58:53.848Z"
      };

      store.sendTextChatMessage(messageData);

      expect(store.getStoreState("messageList")).eql([{
        type: CHAT_MESSAGE_TYPES.SENT,
        contentType: messageData.contentType,
        displayName: "John Smith",
        message: messageData.message,
        extraData: undefined,
        sentTimestamp: "2015-06-24T23:58:53.848Z",
        receivedTimestamp: "2015-06-24T23:58:53.848Z"
      }]);
    });

    // Bug 1279054 changed the way it is displayed, until we can
    // compare userId on fixing Bug 1279792
    it.skip("should dipatch a LoopChatMessageAppended event", function() {
      store.setStoreState({ textChatEnabled: true });
      store.sendTextChatMessage({
        contentType: CHAT_CONTENT_TYPES.TEXT,
        message: "Hello!"
      });

      sinon.assert.calledOnce(window.dispatchEvent);
      sinon.assert.calledWithExactly(window.dispatchEvent,
        new CustomEvent("LoopChatMessageAppended"));
    });
  });

  describe("#setOwnDisplayName", function() {
    it("should store ownUserInfo from the actionData", function() {
      let fakeDisplayName = "Fake displayName";

      store.setOwnDisplayName({ displayName: fakeDisplayName });

      expect(store.getStoreState("displayName")).to.eql(fakeDisplayName);
    });
  });

  describe("#updateRoomInfo", function() {
    it("should add the context to the list", function() {
      store.updateRoomInfo(new sharedActions.UpdateRoomInfo({
        roomName: "Let's share!",
        roomUrl: "fake",
        roomContextUrls: [{
          description: "A wonderful event",
          location: "http://wonderful.invalid",
          thumbnail: "fake"
        }]
      }));

      expect(store.getStoreState("messageList")).eql([
        {
          type: CHAT_MESSAGE_TYPES.SPECIAL,
          contentType: CHAT_CONTENT_TYPES.CONTEXT,
          message: "A wonderful event",
          extraData: {
            location: "http://wonderful.invalid",
            thumbnail: "fake"
          }
        }
      ]);
    });

    it("should not add more than one context message", function() {
      store.updateRoomInfo(new sharedActions.UpdateRoomInfo({
        roomUrl: "fake",
        roomContextUrls: [{
          description: "A wonderful event",
          location: "http://wonderful.invalid",
          thumbnail: "fake"
        }]
      }));

      expect(store.getStoreState("messageList")).eql([{
        type: CHAT_MESSAGE_TYPES.SPECIAL,
        contentType: CHAT_CONTENT_TYPES.CONTEXT,
        message: "A wonderful event",
        extraData: {
          location: "http://wonderful.invalid",
          thumbnail: "fake"
        }
      }]);

      store.updateRoomInfo(new sharedActions.UpdateRoomInfo({
        roomUrl: "fake",
        roomContextUrls: [{
          description: "A wonderful event2",
          location: "http://wonderful.invalid2",
          thumbnail: "fake2"
        }]
      }));

      expect(store.getStoreState("messageList")).eql([{
        type: CHAT_MESSAGE_TYPES.SPECIAL,
        contentType: CHAT_CONTENT_TYPES.CONTEXT,
        message: "A wonderful event2",
        extraData: {
          location: "http://wonderful.invalid2",
          thumbnail: "fake2"
        }
      }]);
    });

    it("should not dispatch a LoopChatMessageAppended event", function() {
      store.updateRoomInfo(new sharedActions.UpdateRoomInfo({
        roomName: "Let's share!",
        roomUrl: "fake"
      }));

      sinon.assert.notCalled(window.dispatchEvent);
    });
  });

  describe("#updateRoomContext", function() {
    beforeEach(function() {
      store.setStoreState({ messageList: [] });
      store.updateRoomContext(new sharedActions.UpdateRoomContext({
        newRoomDescription: "fake",
        newRoomThumbnail: "favicon",
        newRoomURL: "https://www.fakeurl.com",
        roomToken: "fakeRoomToken"
      }));
    });

    it("should add the room context to the list", function() {
      expect(store.getStoreState("messageList").length).eql(1);
      expect(store.getStoreState("messageList")[0].contentType)
        .eql(CHAT_CONTENT_TYPES.CONTEXT_TILE);
    });

    it("should not add the room context if the last tile has the same domain", function() {
      store.updateRoomContext(new sharedActions.UpdateRoomContext({
        newRoomDescription: "fake",
        newRoomThumbnail: "favicon",
        newRoomURL: "https://www.fakeurl.com/test/same_domain",
        roomToken: "fakeRoomToken"
      }));

      expect(store.getStoreState("messageList").length).eql(1);
    });

    it("should add the room context if the last tile has not the same domain", function() {
      store.updateRoomContext(new sharedActions.UpdateRoomContext({
        newRoomDescription: "fake",
        newRoomThumbnail: "favicon",
        newRoomURL: "https://www.myfakeurl.com",
        roomToken: "fakeRoomToken"
      }));

      expect(store.getStoreState("messageList").length).eql(2);
    });
  });

  describe("#remotePeerDisconnected", function() {

    it("should append the right message when peer disconnected cleanly", function() {
      store.remotePeerDisconnected(new sharedActions.RemotePeerDisconnected({
        peerHungup: true
      }));

      expect(store.getStoreState("messageList").length).eql(1);
      expect(store.getStoreState("messageList")[0].contentType).eql(
          CHAT_CONTENT_TYPES.NOTIFICATION
      );
      expect(store.getStoreState("messageList")[0].message).eql("peer_left_session");
    });

    it("should append the right message when peer disconnected unexpectedly", function() {
      store.remotePeerDisconnected(new sharedActions.RemotePeerDisconnected({
        peerHungup: false
      }));

      expect(store.getStoreState("messageList").length).eql(1);
      expect(store.getStoreState("messageList")[0].contentType).eql(
          CHAT_CONTENT_TYPES.NOTIFICATION
      );
      expect(store.getStoreState("messageList")[0].message).eql("peer_unexpected_quit");
    });
  });

  describe("#remotePeerConnected", function() {
    it("should append the right message when peer connected", function() {
      store.remotePeerConnected(new sharedActions.RemotePeerConnected());

      expect(store.getStoreState("messageList").length).eql(1);
      expect(store.getStoreState("messageList")[0].contentType).eql(
          CHAT_CONTENT_TYPES.NOTIFICATION
      );
      expect(store.getStoreState("messageList")[0].message).eql("peer_join_session");
    });
  });
});
