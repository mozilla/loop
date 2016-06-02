/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

describe("loop.store.ServerConnectionStore", function() {
  "use strict";

  var expect = chai.expect;
  var sandbox, dispatcher, store, requestStubs;
  var clock;
  var sharedActions = loop.shared.actions;

  beforeEach(function() {
    sandbox = LoopMochaUtils.createSandbox();
    clock = sandbox.useFakeTimers();

    LoopMochaUtils.stubLoopRequest(requestStubs = {
      GetLoopPref: sinon.stub(),
      "Rooms:Get": sinon.stub().returns({
        roomUrl: "http://invalid"
      }),
      "Rooms:Join": sinon.stub().returns({}),
      "Rooms:RefreshMembership": sinon.stub().returns({ expires: 42 })
    });

    dispatcher = new loop.Dispatcher();
    sandbox.stub(dispatcher, "dispatch");

    store = new loop.store.ServerConnectionStore(dispatcher, {});

    sandbox.stub(document.mozL10n ? document.mozL10n : navigator.mozL10n, "get", function(x) {
      return x;
    });
  });

  afterEach(function() {
    sandbox.restore();
    LoopMochaUtils.restore();
  });

  describe("#getInitialStoreState", function() {
    it("should return an object with initial values set to null", function() {
      var initialState = store.getInitialStoreState();

      expect(initialState).to.have.a.property("roomToken", null);
    });
  });

  describe("#setupWindowData", function() {
    it("should store the room token", function() {
      store.setupWindowData(new sharedActions.SetupWindowData({
        roomToken: "fake"
      }));

      expect(store.getStoreState("roomToken")).eql("fake");
    });
  });

  describe("#fetchServerData", function() {
    it("should store the room token", function() {
      store.fetchServerData(new sharedActions.FetchServerData({
        token: "fake",
        windowType: "room"
      }));

      expect(store.getStoreState("roomToken")).eql("fake");
    });
  });

  describe("#joinedRoom", function() {
    it("should store the session token", function() {
      store.joinedRoom(new sharedActions.JoinedRoom({
        apiKey: "fake123",
        sessionId: "fake321",
        sessionToken: "fake",
        expires: 50
      }));

      expect(store.getStoreState("sessionToken")).eql("fake");
    });
  });

  describe("#gotMediaPermission", function() {
    var fakeJoinedData, fakeRoomData;

    beforeEach(function() {
      fakeJoinedData = {
        apiKey: "9876543210",
        sessionToken: "12563478",
        sessionId: "15263748",
        expires: 20
      };
      fakeRoomData = {
        decryptedContext: {
          roomName: "Monkeys"
        },
        participants: [],
        roomUrl: "http://invalid"
      };

      requestStubs["Rooms:Join"].returns(fakeJoinedData);
      store.setStoreState({
        roomToken: "fakeToken",
        sessionToken: "12563478"
      });

      requestStubs["Rooms:Get"].returns(fakeRoomData);
    });
    it("should call rooms.join on mozLoop", function() {
      store.gotMediaPermission();

      sinon.assert.calledOnce(requestStubs["Rooms:Join"]);
      sinon.assert.calledWith(requestStubs["Rooms:Join"], "fakeToken", "display_name_guest");
    });

    it("should dispatch `JoinedRoom` on success", function() {
      store.gotMediaPermission();

      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWith(dispatcher.dispatch,
        new sharedActions.JoinedRoom(fakeJoinedData));
    });

    it("should dispatch `RoomFailure` on error", function() {
      var fakeError = new Error("fake");
      fakeError.isError = true;
      requestStubs["Rooms:Join"].returns(fakeError);

      store.gotMediaPermission();

      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWith(dispatcher.dispatch,
        new sharedActions.RoomFailure({
          error: fakeError,
          failedJoinRequest: true
        }));
    });


    it("should call Rooms:RefreshMembership before the expiresTime",
      function() {
        store.gotMediaPermission();

        clock.tick(fakeJoinedData.expires * 1000);

        sinon.assert.calledOnce(requestStubs["Rooms:RefreshMembership"]);
        sinon.assert.calledWith(requestStubs["Rooms:RefreshMembership"],
          "fakeToken", "12563478");
      });

    it("should call mozLoop.rooms.refreshMembership before the next expiresTime",
      function() {
        requestStubs["Rooms:RefreshMembership"].returns({ expires: 40 });

        store.gotMediaPermission();

        // Clock tick for the first expiry time (which
        // sets up the refreshMembership).
        clock.tick(fakeJoinedData.expires * 1000);

        // Clock tick for expiry time in the refresh membership response.
        clock.tick(40000);

        sinon.assert.calledTwice(requestStubs["Rooms:RefreshMembership"]);
        sinon.assert.calledWith(requestStubs["Rooms:RefreshMembership"],
          "fakeToken", "12563478");
      });

    it("should dispatch `RoomFailure` if the refreshMembership call failed",
      function() {
        var fakeError = new Error("fake");
        fakeError.isError = true;
        requestStubs["Rooms:RefreshMembership"].returns(fakeError);

        store.gotMediaPermission();

        // Clock tick for the first expiry time (which
        // sets up the refreshMembership).
        clock.tick(fakeJoinedData.expires * 1000);

        // The first call is the JoinedRoom in the gotMediaPermission().
        // The second is the subsequent failure.
        sinon.assert.calledTwice(dispatcher.dispatch);
        sinon.assert.calledWith(dispatcher.dispatch,
          new sharedActions.RoomFailure({
            error: fakeError,
            failedJoinRequest: false
          }));
      });
  });

});
