/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

describe("loop.store.ServerConnectionStore", function() {
  "use strict";

  var expect = chai.expect;
  var sandbox, dispatcher, store, requestStubs;
  var clock;
  var sharedActions = loop.shared.actions;
  var sharedUtils = loop.shared.utils;
  var ROOM_INFO_FAILURES = loop.shared.utils.ROOM_INFO_FAILURES;

  beforeEach(function() {
    sandbox = LoopMochaUtils.createSandbox();
    clock = sandbox.useFakeTimers();

    LoopMochaUtils.stubLoopRequest(requestStubs = {
      GetLoopPref: sinon.stub(),
      HangupNow: sinon.stub(),
      "Rooms:Get": sinon.stub().returns({
        roomUrl: "http://invalid"
      }),
      "Rooms:Join": sinon.stub().returns({
        apiKey: "fakeKey",
        sessionId: "fakeSessionId",
        sessionToken: "fakeSessionToken"
      }),
      "Rooms:PushSubscription": sinon.stub(),
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
    var fakeToken, fakeRoomData;

    beforeEach(function() {
      fakeToken = "337-ff-54";
      fakeRoomData = {
        decryptedContext: {
          roomName: "Monkeys"
        },
        participants: [],
        roomUrl: "http://invalid"
      };
      requestStubs["Rooms:Get"].withArgs(fakeToken).returns(fakeRoomData);
      sandbox.stub(store, "_joinRoom").returns(Promise.resolve());
    });

    it("should store the room token", function() {
      return store.setupWindowData(new sharedActions.SetupWindowData({
        roomToken: fakeToken
      })).then(() => {
        expect(store.getStoreState("roomToken")).eql(fakeToken);
      });
    });

    it("should call `_joinRoom`", function() {
      return store.setupWindowData(new sharedActions.SetupWindowData({
        roomToken: fakeToken
      })).then(() => {
        sinon.assert.calledOnce(store._joinRoom);
      });
    });

    it("should dispatch an UpdateRoomInfo action if the get is successful",
      function() {
        return store.setupWindowData(new sharedActions.SetupWindowData({
          roomToken: fakeToken
        })).then(function() {
          sinon.assert.calledOnce(dispatcher.dispatch);
          sinon.assert.calledWithExactly(dispatcher.dispatch,
            new sharedActions.UpdateRoomInfo({
              roomContextUrls: undefined,
              participants: [],
              roomName: fakeRoomData.decryptedContext.roomName,
              roomUrl: fakeRoomData.roomUrl,
              userId: undefined
            }));
        });
      });

    it("should dispatch a RoomFailure action if the get fails",
      function() {
        var fakeError = new Error("fake error");
        fakeError.isError = true;
        requestStubs["Rooms:Get"].withArgs(fakeToken).returns(fakeError);

        return store.setupWindowData(new sharedActions.SetupWindowData({
          roomToken: fakeToken
        })).then(function() {
          sinon.assert.calledOnce(dispatcher.dispatch);
          sinon.assert.calledWithExactly(dispatcher.dispatch,
            new sharedActions.RoomFailure({
              error: fakeError,
              failedJoinRequest: false
            }));
        });
      });
  });

  describe("#fetchServerData", function() {
    var fetchServerAction;

    beforeEach(function() {
      fetchServerAction = new sharedActions.FetchServerData({
        windowType: "room",
        token: "fakeToken"
      });
      sandbox.stub(store, "_joinRoom").returns(Promise.resolve());
    });

    it("should store the room token", function() {
      return store.fetchServerData(new sharedActions.FetchServerData({
        token: "fake",
        windowType: "room"
      })).then(() => {
        expect(store.getStoreState("roomToken")).eql("fake");
      });
    });

    it("should call `_joinRoom`", function() {
      return store.fetchServerData(new sharedActions.FetchServerData({
        token: "fake",
        windowType: "room"
      })).then(() => {
        sinon.assert.calledOnce(store._joinRoom);
      });
    });

    it("should call mozLoop.rooms.get to get the room data", function() {
      return store.fetchServerData(fetchServerAction).then(function() {
        sinon.assert.calledOnce(requestStubs["Rooms:Get"]);
      });
    });

    it("should dispatch an UpdateRoomInfo message with failure if neither roomName nor context are supplied", function() {
      return store.fetchServerData(fetchServerAction).then(function() {
        sinon.assert.called(dispatcher.dispatch);
        sinon.assert.calledWithExactly(dispatcher.dispatch,
          new sharedActions.UpdateRoomInfo({
            roomInfoFailure: ROOM_INFO_FAILURES.NO_DATA,
            roomUrl: "http://invalid",
            userId: undefined
          }));
      });
    });

    describe("mozLoop.rooms.get returns roomName as a separate field (no context)", function() {
      it("should dispatch UpdateRoomInfo if mozLoop.rooms.get is successful", function() {
        var roomDetails = {
          roomName: "fakeName",
          roomUrl: "http://invalid",
          userId: undefined
        };

        requestStubs["Rooms:Get"].returns(roomDetails);

        return store.fetchServerData(fetchServerAction).then(function() {
          sinon.assert.called(dispatcher.dispatch);
          sinon.assert.calledWithExactly(dispatcher.dispatch,
            new sharedActions.UpdateRoomInfo(_.extend({
            }, roomDetails)));
        });
      });
    });

    describe("mozLoop.rooms.get returns encryptedContext", function() {
      var roomDetails, expectedDetails;

      beforeEach(function() {
        roomDetails = {
          context: {
            value: "fakeContext"
          },
          roomUrl: "http://invalid",
          userId: undefined
        };
        expectedDetails = {
          roomUrl: "http://invalid",
          userId: undefined
        };

        requestStubs["Rooms:Get"].returns(roomDetails);

        sandbox.stub(loop.crypto, "isSupported").returns(true);
      });

      it("should dispatch UpdateRoomInfo message with 'unsupported' failure if WebCrypto is unsupported", function() {
        loop.crypto.isSupported.returns(false);

        return store.fetchServerData(fetchServerAction).then(function() {
          sinon.assert.called(dispatcher.dispatch);
          sinon.assert.calledWithExactly(dispatcher.dispatch,
            new sharedActions.UpdateRoomInfo(_.extend({
              roomInfoFailure: ROOM_INFO_FAILURES.WEB_CRYPTO_UNSUPPORTED
            }, expectedDetails)));
        });
      });

      it("should dispatch UpdateRoomInfo message with 'no crypto key' failure if there is no crypto key", function() {
        return store.fetchServerData(fetchServerAction).then(function() {
          sinon.assert.called(dispatcher.dispatch);
          sinon.assert.calledWithExactly(dispatcher.dispatch,
            new sharedActions.UpdateRoomInfo(_.extend({
              roomInfoFailure: ROOM_INFO_FAILURES.NO_CRYPTO_KEY
            }, expectedDetails)));
        });
      });

      it("should dispatch UpdateRoomInfo message with 'decrypt failed' failure if decryption failed", function() {
        fetchServerAction.cryptoKey = "fakeKey";

        // This is a work around to turn promise into a sync action to make handling test failures
        // easier.
        sandbox.stub(loop.crypto, "decryptBytes", function() {
          return {
            then: function(resolve, reject) {
              reject(new Error("Operation unsupported"));
            }
          };
        });

        return store.fetchServerData(fetchServerAction).then(function() {
          sinon.assert.called(dispatcher.dispatch);
          sinon.assert.calledWithExactly(dispatcher.dispatch,
            new sharedActions.UpdateRoomInfo(_.extend({
              roomInfoFailure: ROOM_INFO_FAILURES.DECRYPT_FAILED
            }, expectedDetails)));
        });
      });

      it("should dispatch UpdateRoomInfo message with the context if decryption was successful", function() {
        fetchServerAction.cryptoKey = "fakeKey";

        var roomContext = {
          roomName: "The wonderful Loopy room",
          urls: [{
            description: "An invalid page",
            location: "http://invalid.com",
            thumbnail: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
          }]
        };

        // This is a work around to turn promise into a sync action to make handling test failures
        // easier.
        sandbox.stub(loop.crypto, "decryptBytes", function() {
          return {
            then: function(resolve) {
              resolve(JSON.stringify(roomContext));
            }
          };
        });

        return store.fetchServerData(fetchServerAction).then(function() {
          var expectedData = _.extend({
            roomContextUrls: roomContext.urls,
            roomName: roomContext.roomName
          }, expectedDetails);

          sinon.assert.called(dispatcher.dispatch);
          sinon.assert.calledWithExactly(dispatcher.dispatch,
            new sharedActions.UpdateRoomInfo(expectedData));
        });
      });
    });
    describe("User Agent Room Handling", function() {
      var channelListener, roomDetails;

      beforeEach(function() {
        sandbox.stub(sharedUtils, "isFirefox").returns(true);

        roomDetails = {
          roomName: "fakeName",
          roomUrl: "http://invalid",
          userId: undefined
        };
        requestStubs["Rooms:Get"].returns(roomDetails);

        sandbox.stub(window, "addEventListener", function(eventName, listener) {
          if (eventName === "WebChannelMessageToContent") {
            channelListener = listener;
          }
        });
        sandbox.stub(window, "removeEventListener", function(eventName, listener) {
          if (eventName === "WebChannelMessageToContent" &&
              listener === channelListener) {
            channelListener = null;
          }
        });
      });

      it("should dispatch UserAgentHandlesRoom with false if the user agent is not Firefox", function() {
        sharedUtils.isFirefox.returns(false);

        return store.fetchServerData(fetchServerAction).then(function() {
          sinon.assert.called(dispatcher.dispatch);
          sinon.assert.calledWithExactly(dispatcher.dispatch,
            new sharedActions.UserAgentHandlesRoom({
              handlesRoom: false
            }));
        });
      });

      it("should dispatch with false after a timeout if there is no response from the channel", function() {
        // When the dispatchEvent is called, we know the setup code has run, so
        // advance the timer.
        sandbox.stub(window, "dispatchEvent", function() {
          sandbox.clock.tick(250);
        });

        return store.fetchServerData(fetchServerAction).then(function() {
          sinon.assert.called(dispatcher.dispatch);
          sinon.assert.calledWithExactly(dispatcher.dispatch,
            new sharedActions.UserAgentHandlesRoom({
              handlesRoom: false
            }));
        });
      });

      it("should not dispatch if a message is returned not for the link-clicker", function() {
        // When the dispatchEvent is called, we know the setup code has run, so
        // advance the timer.
        sandbox.stub(window, "dispatchEvent", function() {
          // We call the listener twice, but the first time with an invalid id.
          // Hence we should only get the dispatch once.
          channelListener({
            detail: {
              id: "invalid-id",
              message: null
            }
          });
          channelListener({
            detail: {
              id: "loop-link-clicker",
              message: null
            }
          });
        });

        return store.fetchServerData(fetchServerAction).then(function() {
          // Although this is only called once for the UserAgentHandlesRoom,
          // it gets called twice due to the UpdateRoomInfo. Therefore,
          // we test both results here.
          sinon.assert.calledTwice(dispatcher.dispatch);
          sinon.assert.calledWithExactly(dispatcher.dispatch,
            new sharedActions.UserAgentHandlesRoom({
              handlesRoom: false
            }));
          sinon.assert.calledWithExactly(dispatcher.dispatch,
            new sharedActions.UpdateRoomInfo(roomDetails));
        });
      });

      it("should dispatch with false if the user agent does not understand the message", function() {
        // When the dispatchEvent is called, we know the setup code has run, so
        // advance the timer.
        sandbox.stub(window, "dispatchEvent", function() {
          channelListener({
            detail: {
              id: "loop-link-clicker",
              message: null
            }
          });
        });

        return store.fetchServerData(fetchServerAction).then(function() {
          sinon.assert.called(dispatcher.dispatch);
          sinon.assert.calledWithExactly(dispatcher.dispatch,
            new sharedActions.UserAgentHandlesRoom({
              handlesRoom: false
            }));
        });
      });

      it("should dispatch with false if the user agent cannot handle the message", function() {
        // When the dispatchEvent is called, we know the setup code has run, so
        // advance the timer.
        sandbox.stub(window, "dispatchEvent", function() {
          channelListener({
            detail: {
              id: "loop-link-clicker",
              message: {
                response: false
              }
            }
          });
        });

        return store.fetchServerData(fetchServerAction).then(function() {
          sinon.assert.called(dispatcher.dispatch);
          sinon.assert.calledWithExactly(dispatcher.dispatch,
            new sharedActions.UserAgentHandlesRoom({
              handlesRoom: false
            }));
        });
      });

      it("should dispatch with true if the user agent can handle the message", function() {
        // When the dispatchEvent is called, we know the setup code has run, so
        // advance the timer.
        sandbox.stub(window, "dispatchEvent", function() {
          channelListener({
            detail: {
              id: "loop-link-clicker",
              message: {
                response: true
              }
            }
          });
        });

        return store.fetchServerData(fetchServerAction).then(function() {
          sinon.assert.called(dispatcher.dispatch);
          sinon.assert.calledWithExactly(dispatcher.dispatch,
            new sharedActions.UserAgentHandlesRoom({
              handlesRoom: true
            }));
        });
      });
    });
  });

  describe("#SetupWebRTCTokens", function() {
    it("should store the session token", function() {
      store.setupWebRTCTokens(new sharedActions.SetupWebRTCTokens({
        apiKey: "fake123",
        sessionId: "fake321",
        sessionToken: "fake"
      }));

      expect(store.getStoreState("sessionToken")).eql("fake");
    });
  });

  describe("#_joinRoom", function() {
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
      store._joinRoom();

      sinon.assert.calledOnce(requestStubs["Rooms:Join"]);
      sinon.assert.calledWith(requestStubs["Rooms:Join"], "fakeToken", "display_name_guest");
    });

    it("should dispatch `SetupWebRTCTokens` on success", function() {
      store._joinRoom();

      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWith(dispatcher.dispatch,
        new sharedActions.SetupWebRTCTokens({
          apiKey: "9876543210",
          sessionToken: "12563478",
          sessionId: "15263748"
        }));
    });

    it("should dispatch `RoomFailure` on error", function() {
      var fakeError = new Error("fake");
      fakeError.isError = true;
      requestStubs["Rooms:Join"].returns(fakeError);

      store._joinRoom();

      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWith(dispatcher.dispatch,
        new sharedActions.RoomFailure({
          error: fakeError,
          failedJoinRequest: true
        }));
    });


    it("should call Rooms:RefreshMembership before the expiresTime",
      function() {
        store._joinRoom();

        clock.tick(fakeJoinedData.expires * 1000);

        sinon.assert.calledOnce(requestStubs["Rooms:RefreshMembership"]);
        sinon.assert.calledWith(requestStubs["Rooms:RefreshMembership"],
          "fakeToken", "12563478");
      });

    it("should call mozLoop.rooms.refreshMembership before the next expiresTime",
      function() {
        requestStubs["Rooms:RefreshMembership"].returns({ expires: 40 });

        store._joinRoom();

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

        store._joinRoom();

        // Clock tick for the first expiry time (which
        // sets up the refreshMembership).
        clock.tick(fakeJoinedData.expires * 1000);

        // The first call is the JoinedRoom in the _joinRoom().
        // The second is the subsequent failure.
        sinon.assert.calledTwice(dispatcher.dispatch);
        sinon.assert.calledWith(dispatcher.dispatch,
          new sharedActions.RoomFailure({
            error: fakeError,
            failedJoinRequest: false
          }));
      });
  });

  describe("windowUnload", function() {
    beforeEach(function() {
      store.setStoreState({
        roomToken: "fakeToken",
        sessionToken: "1627384950"
      });
    });

    it("should clear any existing timeout", function() {
      sandbox.stub(window, "clearTimeout");
      store._timeout = {};

      store.windowUnload();

      sinon.assert.calledOnce(clearTimeout);
    });

    it("should call 'HangupNow' Loop API if it is the standalone", function() {
      store._isDesktop = false;
      store._timeout = {};

      store.windowUnload();

      sinon.assert.calledOnce(requestStubs["HangupNow"]);
      sinon.assert.calledWithExactly(requestStubs["HangupNow"],
        "fakeToken", "1627384950");
    });

    it("should not call 'HangupNow' Loop API if it is on desktop", function() {
      store._isDesktop = true;
      store._timeout = {};

      store.windowUnload();

      sinon.assert.notCalled(requestStubs["HangupNow"]);
    });
  });

  describe("Events", function() {
    describe("update:{roomToken}", function() {
      beforeEach(function() {
        var fakeRoomData = {
          decryptedContext: {
            roomName: "Monkeys"
          },
          participants: [],
          roomUrl: "http://invalid"
        };
        requestStubs["Rooms:Get"].returns(fakeRoomData);
      });

      it("should register a listener when setupWindowData is received", function() {
        return store.setupWindowData(new sharedActions.SetupWindowData({
          roomToken: "fakeToken"
        })).then(() => {
          sinon.assert.calledOnce(requestStubs["Rooms:PushSubscription"]);
          sinon.assert.calledWithExactly(requestStubs["Rooms:PushSubscription"],
            ["update:fakeToken"]);
        });
      });

      it("should register a listener when fetchServerData is received", function() {
        return store.fetchServerData(new sharedActions.FetchServerData({
          token: "fakeToken",
          windowType: "room"
        })).then(() => {
          sinon.assert.calledOnce(requestStubs["Rooms:PushSubscription"]);
          sinon.assert.calledWithExactly(requestStubs["Rooms:PushSubscription"],
            ["update:fakeToken"]);
        });
      });

      describe("Event actions", () => {
        beforeEach(function() {
          return store.setupWindowData(new sharedActions.SetupWindowData({
            roomToken: "fakeToken"
          })).then(() => {
            // Reset the dispatcher stub for any dispatch calls that happened
            // in the setupWindowData call.
            dispatcher.dispatch.reset();
          });
        });

        it("should dispatch an UpdateRoomInfo action", function() {
          var fakeRoomData = {
            decryptedContext: {
              roomName: "fakeName",
              urls: {
                fake: "url"
              }
            },
            roomUrl: "original"
          };

          LoopMochaUtils.publish("Rooms:Update:fakeToken", fakeRoomData);

          sinon.assert.calledOnce(dispatcher.dispatch);
          sinon.assert.calledWithExactly(dispatcher.dispatch,
            new sharedActions.UpdateRoomInfo({
              participants: undefined,
              roomName: fakeRoomData.decryptedContext.roomName,
              roomUrl: fakeRoomData.roomUrl,
              roomContextUrls: {
                fake: "url"
              }
            }));
        });

        it("should not update anything when another room is updated", function() {
          var fakeRoomData = {
            decryptedContext: {
              roomName: "fakeName",
              urls: {
                fake: "url"
              }
            },
            roomUrl: "original"
          };

          LoopMochaUtils.publish("Rooms:Update:invalidToken", fakeRoomData);

          sinon.assert.notCalled(dispatcher.dispatch);
        });
      });
    });
  });
});
