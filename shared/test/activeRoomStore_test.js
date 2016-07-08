/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

describe("loop.store.ActiveRoomStore", function() {
  "use strict";

  var expect = chai.expect;
  var sharedActions = loop.shared.actions;
  var REST_ERRNOS = loop.shared.utils.REST_ERRNOS;
  var ROOM_STATES = loop.store.ROOM_STATES;
  var CHAT_CONTENT_TYPES = loop.shared.utils.CHAT_CONTENT_TYPES;
  var FAILURE_DETAILS = loop.shared.utils.FAILURE_DETAILS;
  var SCREEN_SHARE_STATES = loop.shared.utils.SCREEN_SHARE_STATES;
  var sandbox, dispatcher, store, requestStubs, fakeSdkDriver;
  var clock;

  beforeEach(function() {
    sandbox = LoopMochaUtils.createSandbox();
    clock = sandbox.useFakeTimers();

    LoopMochaUtils.stubLoopRequest(requestStubs = {
      GetLoopPref: sinon.stub(),
      GetSelectedTabMetadata: sinon.stub(),
      SetLoopPref: sinon.stub(),
      AddConversationContext: sinon.stub(),
      AddBrowserSharingListener: sinon.stub().returns(42),
      RemoveBrowserSharingListener: sinon.stub(),
      "Rooms:Get": sinon.stub().returns({
        roomUrl: "http://invalid"
      }),
      "Rooms:Join": sinon.stub().returns({}),
      "Rooms:RefreshMembership": sinon.stub().returns({ expires: 42 }),
      "Rooms:SendConnectionStatus": sinon.stub(),
      "Rooms:PushSubscription": sinon.stub(),
      SetScreenShareState: sinon.stub(),
      GetActiveTabWindowId: sandbox.stub().returns(42),
      TelemetryAddValue: sinon.stub()
    });

    dispatcher = new loop.Dispatcher();
    sandbox.stub(dispatcher, "dispatch");
    sandbox.stub(window, "close");

    fakeSdkDriver = {
      connectSession: sinon.stub(),
      disconnectSession: sinon.stub(),
      forceDisconnectAll: sinon.stub().callsArg(0),
      retryPublishWithoutVideo: sinon.stub(),
      startScreenShare: sinon.stub(),
      switchAcquiredWindow: sinon.stub(),
      toggleBrowserSharing: sinon.stub(),
      endScreenShare: sinon.stub().returns(true)
    };

    store = new loop.store.ActiveRoomStore(dispatcher, {
      sdkDriver: fakeSdkDriver
    });

    sandbox.stub(document.mozL10n ? document.mozL10n : navigator.mozL10n, "get", function(x) {
      return x;
    });
  });

  afterEach(function() {
    sandbox.restore();
    LoopMochaUtils.restore();
  });

  describe("#constructor", function() {
    it("should throw an error if sdkDriver is missing", function() {
      expect(function() {
        new loop.store.ActiveRoomStore(dispatcher, { mozLoop: {} });
      }).to.Throw(/sdkDriver/);
    });
  });

  describe("#getInitialStoreState", function() {
    it("should return an object with roomState set to INIT", function() {
      var initialState = store.getInitialStoreState();

      expect(initialState).to.have.a.property("roomState", ROOM_STATES.INIT);
    });
  });

  describe("#roomFailure", function() {
    var fakeError;

    beforeEach(function() {
      sandbox.stub(console, "error");

      fakeError = new Error("fake");

      store.setStoreState({
        roomState: ROOM_STATES.JOINED,
        roomToken: "fakeToken",
        sessionToken: "1627384950",
        windowId: "42"
      });
    });

    it("should log the error", function() {
      store.roomFailure(new sharedActions.RoomFailure({
        error: fakeError,
        failedJoinRequest: false
      }));

      sinon.assert.calledOnce(console.error);
      sinon.assert.calledWith(console.error,
        sinon.match(ROOM_STATES.JOINED), fakeError);
    });

    it("should set the state to `FULL` on server error room full", function() {
      fakeError.errno = REST_ERRNOS.ROOM_FULL;

      store.roomFailure(new sharedActions.RoomFailure({
        error: fakeError,
        failedJoinRequest: false
      }));

      expect(store._storeState.roomState).eql(ROOM_STATES.FULL);
    });

    it("should set the state to `FAILED` on generic error", function() {
      // errno !== undefined
      fakeError.errno = 999;
      store.roomFailure(new sharedActions.RoomFailure({
        error: fakeError,
        failedJoinRequest: false
      }));

      expect(store._storeState.roomState).eql(ROOM_STATES.FAILED);
      expect(store._storeState.failureReason).eql(FAILURE_DETAILS.UNKNOWN);
    });

    it("should set the state to `COULD_NOT_CONNECT` on undefined errno", function() {
      store.roomFailure(new sharedActions.RoomFailure({
        error: fakeError,
        failedJoinRequest: false
      }));

      expect(store._storeState.roomState).eql(ROOM_STATES.FAILED);
      expect(store._storeState.failureReason).eql(FAILURE_DETAILS.COULD_NOT_CONNECT);
    });

    it("should set the failureReason to EXPIRED_OR_INVALID on server error: " +
      "invalid token", function() {
        fakeError.errno = REST_ERRNOS.INVALID_TOKEN;

        store.roomFailure(new sharedActions.RoomFailure({
          error: fakeError,
          failedJoinRequest: false
        }));

        expect(store._storeState.roomState).eql(ROOM_STATES.FAILED);
        expect(store._storeState.failureReason).eql(FAILURE_DETAILS.EXPIRED_OR_INVALID);
      });

    it("should set the failureReason to EXPIRED_OR_INVALID on server error: " +
      "expired", function() {
        fakeError.errno = REST_ERRNOS.EXPIRED;

        store.roomFailure(new sharedActions.RoomFailure({
          error: fakeError,
          failedJoinRequest: false
        }));

        expect(store._storeState.roomState).eql(ROOM_STATES.FAILED);
        expect(store._storeState.failureReason).eql(FAILURE_DETAILS.EXPIRED_OR_INVALID);
      });

    it("should disconnect from the servers via the sdk", function() {
      store.roomFailure(new sharedActions.RoomFailure({
        error: fakeError,
        failedJoinRequest: false
      }));

      sinon.assert.calledOnce(fakeSdkDriver.disconnectSession);
    });

    it("should remove the sharing listener", function() {
      sandbox.stub(loop, "unsubscribe");

      // Setup the listener.
      store.startBrowserShare();

      // Now simulate room failure.
      store.roomFailure(new sharedActions.RoomFailure({
        error: fakeError,
        failedJoinRequest: false
      }));

      sinon.assert.calledOnce(loop.unsubscribe);
      sinon.assert.calledWith(loop.unsubscribe, "BrowserSwitch");
    });
  });

  describe("#retryAfterRoomFailure", function() {
    beforeEach(function() {
      sandbox.stub(console, "error");
    });

    it("should reject attempts to retry for invalid/expired urls", function() {
      store.setStoreState({
        failureReason: FAILURE_DETAILS.EXPIRED_OR_INVALID
      });

      store.retryAfterRoomFailure();

      sinon.assert.calledOnce(console.error);
      sinon.assert.calledWithMatch(console.error, "Invalid");
      sinon.assert.notCalled(dispatcher.dispatch);
    });

    it("should reject attempts if the failure exit state is not expected", function() {
      store.setStoreState({
        failureReason: FAILURE_DETAILS.UNKNOWN,
        failureExitState: ROOM_STATES.INIT
      });

      store.retryAfterRoomFailure();

      sinon.assert.calledOnce(console.error);
      sinon.assert.calledWithMatch(console.error, "Unexpected");
      sinon.assert.notCalled(dispatcher.dispatch);
    });

    it("should dispatch a FetchServerData action when the exit state is GATHER", function() {
      store.setStoreState({
        failureReason: FAILURE_DETAILS.UNKNOWN,
        failureExitState: ROOM_STATES.GATHER,
        roomCryptoKey: "fakeKey",
        roomToken: "fakeToken"
      });

      store.retryAfterRoomFailure();

      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWithExactly(dispatcher.dispatch,
        new sharedActions.FetchServerData({
          cryptoKey: "fakeKey",
          token: "fakeToken",
          windowType: "room"
        }));
    });

    it("should initiate webrtc for other states", function() {
      sandbox.stub(store, "initiateWebRTC");

      store.setStoreState({
        failureReason: FAILURE_DETAILS.UNKNOWN,
        failureExitState: ROOM_STATES.MEDIA_WAIT,
        roomCryptoKey: "fakeKey",
        roomToken: "fakeToken"
      });

      store.retryAfterRoomFailure();

      sinon.assert.calledOnce(store.initiateWebRTC);
    });
  });

  describe("#setupWindowData", function() {
    var fakeToken;

    beforeEach(function() {
      fakeToken = "337-ff-54";

      store = new loop.store.ActiveRoomStore(dispatcher, {
        sdkDriver: {}
      });
    });

    it("should set the state to `GATHER`", function() {
      store.setupWindowData(new sharedActions.SetupWindowData({
        roomToken: fakeToken
      }));

      expect(store.getStoreState()).to.have.property(
        "roomState", ROOM_STATES.GATHER);
    });

    it("should store the room token and window id", function() {
      store.setupWindowData(new sharedActions.SetupWindowData({
        roomToken: fakeToken
      }));

      expect(store.getStoreState().roomToken).eql(fakeToken);
    });
  });

  describe("#fetchServerData", function() {
    var fetchServerAction;

    beforeEach(function() {
      fetchServerAction = new sharedActions.FetchServerData({
        windowType: "room",
        token: "fakeToken"
      });
    });

    it("should save the token", function() {
      store.fetchServerData(fetchServerAction);

      expect(store.getStoreState().roomToken).eql("fakeToken");
    });

    it("should set the state to `GATHER`", function() {
      store.fetchServerData(fetchServerAction);

      expect(store.getStoreState().roomState).eql(ROOM_STATES.GATHER);
    });
  });

  describe("#videoDimensionsChanged", function() {
    it("should not contain any video dimensions at the very start", function() {
      expect(store.getStoreState()).eql(store.getInitialStoreState());
    });

    it("should update the store with new video dimensions", function() {
      var actionData = {
        isLocal: true,
        videoType: "camera",
        dimensions: { width: 640, height: 480 }
      };

      store.videoDimensionsChanged(new sharedActions.VideoDimensionsChanged(actionData));

      expect(store.getStoreState().localVideoDimensions)
        .to.have.property(actionData.videoType, actionData.dimensions);

      actionData.isLocal = false;
      store.videoDimensionsChanged(new sharedActions.VideoDimensionsChanged(actionData));

      expect(store.getStoreState().remoteVideoDimensions)
        .to.have.property(actionData.videoType, actionData.dimensions);
    });
  });

  describe("#videoScreenStreamChanged", function() {
    it("should set streamPaused if screen stream has no video", function() {
      var actionData = {
        hasVideo: false
      };

      store.videoScreenStreamChanged(new sharedActions.VideoScreenStreamChanged(actionData));
      expect(store.getStoreState().streamPaused).eql(true);
    });
  });

  describe("#updateRoomInfo", function() {
    var fakeRoomInfo;

    beforeEach(function() {
      fakeRoomInfo = {
        roomContextUrls: [{
          description: "fake site",
          location: "http://invalid.com",
          thumbnail: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
        }],
        roomName: "Its a room",
        roomUrl: "http://invalid",
        participants: [{
          displayName: "Owner",
          owner: true
        }]
      };
    });

    it("should save the room information", function() {
      store.updateRoomInfo(new sharedActions.UpdateRoomInfo(fakeRoomInfo));

      var state = store.getStoreState();

      expect(state.participants).eql(fakeRoomInfo.participants);
    });

    it("should set the state to READY when the previous state was GATHER", function() {
      store.setStoreState({ roomState: ROOM_STATES.GATHER });

      store.updateRoomInfo(new sharedActions.UpdateRoomInfo(fakeRoomInfo));

      var state = store.getStoreState();

      expect(state.roomState).eql(ROOM_STATES.READY);
    });

    it("should not change the state when the previous state is not GATHER", function() {
      store.setStoreState({ roomState: ROOM_STATES.INIT });

      store.updateRoomInfo(new sharedActions.UpdateRoomInfo(fakeRoomInfo));

      var state = store.getStoreState();

      expect(state.roomState).eql(ROOM_STATES.INIT);
    });
  });

  describe("#initiateWebRTC", function() {
    var hasDevicesStub;

    beforeEach(function() {
      store.setStoreState({ roomState: ROOM_STATES.READY });
      hasDevicesStub = sandbox.stub(loop.shared.utils, "hasAudioOrVideoDevices");
    });

    it("should reset failureReason", function() {
      store.setStoreState({ failureReason: "Test" });

      store.initiateWebRTC();

      expect(store.getStoreState().failureReason).eql(undefined);
    });

    it("should set the state to MEDIA_WAIT if media devices are present", function() {
      hasDevicesStub.callsArgWith(0, true);

      store.initiateWebRTC();

      expect(store.getStoreState().roomState).eql(ROOM_STATES.MEDIA_WAIT);
    });

    it("should not set the state to MEDIA_WAIT if no media devices are present", function() {
      hasDevicesStub.callsArgWith(0, false);

      store.initiateWebRTC();

      expect(store.getStoreState().roomState).eql(ROOM_STATES.READY);
    });

    it("should dispatch `ConnectionFailure` if no media devices are present", function() {
      hasDevicesStub.callsArgWith(0, false);

      store.initiateWebRTC();

      sinon.assert.called(dispatcher.dispatch);
      sinon.assert.calledWithExactly(dispatcher.dispatch,
        new sharedActions.ConnectionFailure({
          reason: FAILURE_DETAILS.NO_MEDIA
        }));
    });
  });

  describe("#gotMediaPermission", function() {
    var fakeRoomData;

    beforeEach(function() {
      fakeRoomData = {
        decryptedContext: {
          roomName: "Monkeys"
        },
        participants: [],
        roomUrl: "http://invalid"
      };
      requestStubs["Rooms:Get"].returns(fakeRoomData);

      store.setStoreState({
        roomToken: "fakeToken",
        webrtcTokens: {
          apiKey: "9876543210",
          sessionToken: "12563478",
          sessionId: "15263748"
        }
      });
    });

    it("should set the state to `JOINED`", function() {
      store.gotMediaPermission();

      expect(store._storeState.roomState).eql(ROOM_STATES.JOINED);
    });

    it("should set the state to `JOINED` when Firefox handles the room", function() {
      store.setStoreState({
        userAgentHandlesRoom: true,
        standalone: true
      });

      store.gotMediaPermission();

      expect(store._storeState.roomState).eql(ROOM_STATES.JOINED);
    });

    it("should start the session connection with the sdk", function() {
      store.gotMediaPermission();

      sinon.assert.calledOnce(fakeSdkDriver.connectSession);
      sinon.assert.calledWithExactly(fakeSdkDriver.connectSession, {
        apiKey: "9876543210",
        sessionToken: "12563478",
        sessionId: "15263748"
      });
    });

    // XXX akita Will be fixed in Bug 1268826
    it.skip("should call LoopAPI.AddConversationContext", function() {
      return store.setupWindowData(new sharedActions.SetupWindowData({
        windowId: "42",
        type: "room"
      })).then(function() {
        store.gotMediaPermission();

        sinon.assert.calledOnce(requestStubs.AddConversationContext);
        sinon.assert.calledWithExactly(requestStubs.AddConversationContext,
                                       "42", "15263748", "");
      });
    });
  });

  describe("#connectedToSdkServers", function() {
    it("should set the state to `SESSION_CONNECTED`", function() {
      store.connectedToSdkServers(new sharedActions.ConnectedToSdkServers());

      expect(store.getStoreState().roomState).eql(ROOM_STATES.SESSION_CONNECTED);
    });
  });

  describe("#connectionFailure", function() {
    var connectionFailureAction;

    beforeEach(function() {
      store.setStoreState({
        roomState: ROOM_STATES.JOINED,
        roomToken: "fakeToken",
        sessionToken: "1627384950",
        windowId: "42"
      });

      connectionFailureAction = new sharedActions.ConnectionFailure({
        reason: "FAIL"
      });
    });

    it("should store the failure reason", function() {
      store.connectionFailure(connectionFailureAction);

      expect(store.getStoreState().failureReason).eql("FAIL");
    });

    it("should disconnect from the servers via the sdk", function() {
      store.connectionFailure(connectionFailureAction);

      sinon.assert.calledOnce(fakeSdkDriver.disconnectSession);
    });

    it("should call 'endScreenShare'", function() {
      sandbox.stub(store, "endScreenShare");

      store.connectionFailure(connectionFailureAction);

      sinon.assert.calledOnce(store.endScreenShare);
    });

    it("should remove the sharing listener", function() {
      sandbox.stub(loop, "unsubscribe");

      // Setup the listener.
      store.startBrowserShare();

      // Now simulate connection failure.
      store.connectionFailure(connectionFailureAction);

      sinon.assert.calledOnce(loop.unsubscribe);
      sinon.assert.calledWith(loop.unsubscribe, "BrowserSwitch");
    });

    it("should set the state to `FAILED`", function() {
      store.connectionFailure(connectionFailureAction);

      expect(store.getStoreState().roomState).eql(ROOM_STATES.FAILED);
    });
  });

  describe("#setMute", function() {
    it("should save the mute state for the audio stream", function() {
      store.setStoreState({ audioMuted: false });

      store.setMute(new sharedActions.SetMute({
        type: "audio",
        enabled: true
      }));

      expect(store.getStoreState().audioMuted).eql(false);
    });

    it("should save the mute state for the video stream", function() {
      store.setStoreState({ videoMuted: true });

      store.setMute(new sharedActions.SetMute({
        type: "video",
        enabled: false
      }));

      expect(store.getStoreState().videoMuted).eql(true);
    });
  });

  describe("#mediaStreamCreated", function() {
    var fakeStreamElement;

    beforeEach(function() {
      fakeStreamElement = { name: "fakeStreamElement" };
    });

    it("should add a local video object to the store", function() {
      expect(store.getStoreState()).to.not.have.property("localSrcMediaElement");

      store.mediaStreamCreated(new sharedActions.MediaStreamCreated({
        hasAudio: false,
        hasVideo: false,
        isLocal: true,
        srcMediaElement: fakeStreamElement
      }));

      expect(store.getStoreState().localSrcMediaElement).eql(fakeStreamElement);
      expect(store.getStoreState()).to.not.have.property("remoteSrcMediaElement");
    });

    it("should set the local video enabled", function() {
      store.setStoreState({
        localAudioEnabled: false,
        localVideoEnabled: false,
        remoteVideoEnabled: false
      });

      store.mediaStreamCreated(new sharedActions.MediaStreamCreated({
        hasAudio: true,
        hasVideo: true,
        isLocal: true,
        srcMediaElement: fakeStreamElement
      }));

      expect(store.getStoreState().localVideoEnabled).eql(true);
      expect(store.getStoreState().localAudioEnabled).eql(true);
      expect(store.getStoreState().remoteVideoEnabled).eql(false);
    });

    it("should add a remote video object to the store", function() {
      expect(store.getStoreState()).to.not.have.property("remoteSrcMediaElement");

      store.mediaStreamCreated(new sharedActions.MediaStreamCreated({
        hasAudio: false,
        hasVideo: false,
        isLocal: false,
        srcMediaElement: fakeStreamElement
      }));

      expect(store.getStoreState()).not.have.property("localSrcMediaElement");
      expect(store.getStoreState().remoteSrcMediaElement).eql(fakeStreamElement);
    });

    it("should set the remote video enabled", function() {
      store.setStoreState({
        localVideoEnabled: false,
        remoteVideoEnabled: false
      });

      store.mediaStreamCreated(new sharedActions.MediaStreamCreated({
        hasAudio: true,
        hasVideo: true,
        isLocal: false,
        srcMediaElement: fakeStreamElement
      }));

      expect(store.getStoreState().localVideoEnabled).eql(false);
      expect(store.getStoreState().remoteVideoEnabled).eql(true);
      expect(store.getStoreState().remoteAudioEnabled).eql(true);
    });

    it("should call startBrowserShare when is desktop", function() {
      sandbox.stub(store, "startBrowserShare");
      store._isDesktop = true;
      store.setStoreState({
        localVideoEnabled: false,
        remoteVideoEnabled: false
      });

      store.mediaStreamCreated(new sharedActions.MediaStreamCreated({
        hasAudio: true,
        hasVideo: true,
        isLocal: false,
        srcMediaElement: fakeStreamElement
      }));

      sinon.assert.calledOnce(store.startBrowserShare);
    });
  });

  describe("#mediaStreamDestroyed", function() {
    var fakeStreamElement;

    beforeEach(function() {
      fakeStreamElement = { name: "fakeStreamElement" };

      store.setStoreState({
        localSrcMediaElement: fakeStreamElement,
        remoteSrcMediaElement: fakeStreamElement
      });
    });

    it("should clear the local video object", function() {
      store.mediaStreamDestroyed(new sharedActions.MediaStreamDestroyed({
        isLocal: true
      }));

      expect(store.getStoreState().localSrcMediaElement).eql(null);
      expect(store.getStoreState().remoteSrcMediaElement).eql(fakeStreamElement);
    });

    it("should clear the remote video object", function() {
      store.mediaStreamDestroyed(new sharedActions.MediaStreamDestroyed({
        isLocal: false
      }));

      expect(store.getStoreState().localSrcMediaElement).eql(fakeStreamElement);
      expect(store.getStoreState().remoteSrcMediaElement).eql(null);
    });
  });

  describe("#remoteVideoStatus", function() {
    it("should set remoteVideoEnabled to true", function() {
      store.setStoreState({
        remoteVideoEnabled: false
      });

      store.remoteVideoStatus(new sharedActions.RemoteVideoStatus({
        videoEnabled: true
      }));

      expect(store.getStoreState().remoteVideoEnabled).eql(true);
    });

    it("should set remoteVideoEnabled to false", function() {
      store.setStoreState({
        remoteVideoEnabled: true
      });

      store.remoteVideoStatus(new sharedActions.RemoteVideoStatus({
        videoEnabled: false
      }));

      expect(store.getStoreState().remoteVideoEnabled).eql(false);
    });
  });

  describe("#mediaConnected", function() {
    it("should set mediaConnected to true", function() {
      store.mediaConnected();

      expect(store.getStoreState().mediaConnected).eql(true);
    });
  });

  describe("#screenSharingState", function() {
    beforeEach(function() {
      store.setStoreState({ windowId: "1234" });
    });

    it("should save the state", function() {
      store.screenSharingState(new sharedActions.ScreenSharingState({
        state: SCREEN_SHARE_STATES.ACTIVE
      }));

      expect(store.getStoreState().screenSharingState).eql(SCREEN_SHARE_STATES.ACTIVE);
    });

    it("should set screen sharing active when the state is active", function() {
      store.screenSharingState(new sharedActions.ScreenSharingState({
        state: SCREEN_SHARE_STATES.ACTIVE
      }));

      sinon.assert.calledOnce(requestStubs.SetScreenShareState);
      sinon.assert.calledWithExactly(requestStubs.SetScreenShareState, "1234", true);
    });

    it("should set screen sharing inactive when the state is inactive", function() {
      store.screenSharingState(new sharedActions.ScreenSharingState({
        state: SCREEN_SHARE_STATES.INACTIVE
      }));

      sinon.assert.calledOnce(requestStubs.SetScreenShareState);
      sinon.assert.calledWithExactly(requestStubs.SetScreenShareState, "1234", false);
    });
  });

  describe("#receivingScreenShare", function() {
    it("should save the state", function() {
      store.receivingScreenShare(new sharedActions.ReceivingScreenShare({
        receiving: true
      }));

      expect(store.getStoreState().receivingScreenShare).eql(true);
    });

    it("should add a screenShareMediaElement to the store when sharing is active", function() {
      var fakeStreamElement = { name: "fakeStreamElement" };
      expect(store.getStoreState()).to.not.have.property("screenShareMediaElement");

      store.receivingScreenShare(new sharedActions.ReceivingScreenShare({
        receiving: true,
        srcMediaElement: fakeStreamElement
      }));

      expect(store.getStoreState()).to.have.property("screenShareMediaElement",
        fakeStreamElement);
    });

    it("should clear the screenShareMediaElement from the store when sharing is inactive", function() {
      store.setStoreState({
        screenShareMediaElement: {
          name: "fakeStreamElement"
        }
      });

      store.receivingScreenShare(new sharedActions.ReceivingScreenShare({
        receiving: false,
        srcMediaElement: null
      }));

      expect(store.getStoreState().screenShareMediaElement).eql(null);
    });

    it("should delete the screen remote video dimensions if screen sharing is not active", function() {
      store.setStoreState({
        remoteVideoDimensions: {
          screen: { fake: 10 },
          camera: { fake: 20 }
        }
      });

      store.receivingScreenShare(new sharedActions.ReceivingScreenShare({
        receiving: false
      }));

      expect(store.getStoreState().remoteVideoDimensions).eql({
        camera: { fake: 20 }
      });
    });
  });

  describe("#startBrowserShare", function() {
    beforeEach(function() {
      store.setStoreState({
        roomState: ROOM_STATES.JOINED,
        roomToken: "fakeToken",
        sessionToken: "1627384950",
        participants: [{
          displayName: "Owner",
          owner: true
        }, {
          displayName: "Guest",
          owner: false
        }]
      });

      sandbox.stub(console, "error");
      sandbox.stub(store, "_handleSwitchBrowserShare");
    });

    afterEach(function() {
      store.endScreenShare();
    });

    it("should log an error if the state is not inactive", function() {
      store.setStoreState({
        screenSharingState: SCREEN_SHARE_STATES.PENDING
      });

      store.startBrowserShare(new sharedActions.StartBrowserShare());

      sinon.assert.calledOnce(console.error);
    });

    it("should not do anything if the state is not inactive", function() {
      store.setStoreState({
        screenSharingState: SCREEN_SHARE_STATES.PENDING
      });

      store.startBrowserShare(new sharedActions.StartBrowserShare());

      sinon.assert.notCalled(requestStubs.AddBrowserSharingListener);
      sinon.assert.notCalled(fakeSdkDriver.startScreenShare);
    });

    it("should set the state to 'pending'", function() {
      store.startBrowserShare(new sharedActions.StartBrowserShare());
      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWith(dispatcher.dispatch,
        new sharedActions.ScreenSharingState({
          state: SCREEN_SHARE_STATES.PENDING
        }));
    });

    it("should add a browser sharing listener for tab sharing", function() {
      store.startBrowserShare(new sharedActions.StartBrowserShare());

      sinon.assert.calledOnce(requestStubs.AddBrowserSharingListener);
    });

    describe("Screen share Events", function() {
      it("should call _handleSwitchBrowserShare", function() {
        store.startBrowserShare(new sharedActions.StartBrowserShare());

        LoopMochaUtils.publish("BrowserSwitch", 72);

        sinon.assert.calledOnce(store._handleSwitchBrowserShare);
      });
    });
  });

  describe("#_handleSwitchBrowserShare", function() {
    var getSelectedTabMetadataStub;

    beforeEach(function() {
      getSelectedTabMetadataStub = sinon.stub();
      LoopMochaUtils.stubLoopRequest({
        GetSelectedTabMetadata: getSelectedTabMetadataStub.returns({
          title: "fakeTitle",
          favicon: "fakeFavicon",
          url: "http://www.fakeurl.com"
        })
      });

      store.setStoreState({
        roomState: ROOM_STATES.JOINED,
        roomToken: "fakeToken",
        screenSharingState: SCREEN_SHARE_STATES.ACTIVE,
        sessionToken: "1627384950",
        participants: [{
          displayName: "Owner",
          owner: true
        }, {
          displayName: "Guest",
          owner: false
        }]
      });

      // Stub to prevent errors surfacing in the console.
      sandbox.stub(console, "error");
    });

    afterEach(function() {
      store.endScreenShare();
    });

    it("should log an error in the console", function() {
      var err = new Error("foo");
      err.isError = true;
      store._handleSwitchBrowserShare(err);

      sinon.assert.calledOnce(console.error);
    });

    it("should end the screen sharing session when the listener receives an error", function() {
      var err = new Error("foo");
      err.isError = true;
      store._handleSwitchBrowserShare(err);

      // The dispatcher was already called once in beforeEach().
      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWith(dispatcher.dispatch,
        new sharedActions.ScreenSharingState({
          state: SCREEN_SHARE_STATES.INACTIVE
        }));
      sinon.assert.notCalled(fakeSdkDriver.switchAcquiredWindow);
    });

    it("should save the windowId when the state is INACTIVE", function() {
      store.setStoreState({
        screenSharingState: SCREEN_SHARE_STATES.INACTIVE
      });

      store._handleSwitchBrowserShare(72);

      expect(store._savedWindowId, 72);
    });

    it("should not do anything else when the state is INACTIVE", function() {
      store.setStoreState({
        screenSharingState: SCREEN_SHARE_STATES.INACTIVE
      });

      store._handleSwitchBrowserShare(72);

      sinon.assert.notCalled(dispatcher.dispatch);
      sinon.assert.notCalled(fakeSdkDriver.startScreenShare);
      sinon.assert.notCalled(fakeSdkDriver.switchAcquiredWindow);
    });

    it("should save the windowId when sharing is paused", function() {
      store.setStoreState({
        screenSharingState: SCREEN_SHARE_STATES.ACTIVE,
        sharingPaused: true
      });

      store._handleSwitchBrowserShare(72);

      expect(store._savedWindowId, 72);
    });

    it("should not do anything else when the state is paused", function() {
      store.setStoreState({
        screenSharingState: SCREEN_SHARE_STATES.ACTIVE,
        sharingPaused: true
      });

      store._handleSwitchBrowserShare(72);

      sinon.assert.notCalled(dispatcher.dispatch);
      sinon.assert.notCalled(fakeSdkDriver.startScreenShare);
      sinon.assert.notCalled(fakeSdkDriver.switchAcquiredWindow);
    });

    it("should invoke the SDK driver with the correct options if the state is pending", function() {
      store.setStoreState({
        screenSharingState: SCREEN_SHARE_STATES.PENDING
      });

      store._handleSwitchBrowserShare(42);

      sinon.assert.calledOnce(fakeSdkDriver.startScreenShare);
      sinon.assert.calledWith(fakeSdkDriver.startScreenShare, {
        videoSource: "browser",
        constraints: {
          browserWindow: 42,
          scrollWithPage: true
        }
      });
    });

    it("should update the SDK driver when the state is active", function() {
      store._handleSwitchBrowserShare(72);

      sinon.assert.calledOnce(fakeSdkDriver.switchAcquiredWindow);
      sinon.assert.calledWithExactly(fakeSdkDriver.switchAcquiredWindow, 72);
    });

    it("should log an error if the state is unexpected", function() {
      store.setStoreState({
        screenSharingState: "invalid"
      });

      store._handleSwitchBrowserShare(72);

      sinon.assert.calledOnce(console.error);
    });

    it("should request the new metadata when the browser being shared change", function() {
      store._handleSwitchBrowserShare(42);

      clock.tick(500);

      sinon.assert.calledOnce(getSelectedTabMetadataStub);
      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWithExactly(dispatcher.dispatch,
        new sharedActions.UpdateRoomContext({
          newRoomDescription: "fakeTitle",
          newRoomThumbnail: "fakeFavicon",
          newRoomURL: "http://www.fakeurl.com",
          roomToken: store.getStoreState().roomToken
      }));
    });

    it("should process only one request", function() {
      store.startBrowserShare(new sharedActions.StartBrowserShare());
      // Simulates multiple requests.
      store._handleSwitchBrowserShare(42);
      store._handleSwitchBrowserShare(42);

      clock.tick(500);

      sinon.assert.calledTwice(getSelectedTabMetadataStub);
      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWithExactly(dispatcher.dispatch,
        new sharedActions.UpdateRoomContext({
          newRoomDescription: "fakeTitle",
          newRoomThumbnail: "fakeFavicon",
          newRoomURL: "http://www.fakeurl.com",
          roomToken: store.getStoreState().roomToken
      }));
    });

    it("should not process a request without url", function() {
      getSelectedTabMetadataStub.returns({
        title: "fakeTitle",
        favicon: "fakeFavicon"
      });

      store._handleSwitchBrowserShare(42);

      clock.tick(500);

      sinon.assert.calledOnce(getSelectedTabMetadataStub);
      sinon.assert.notCalled(dispatcher.dispatch);
    });

    it("should not process a request if sharing is paused", function() {
      store.setStoreState({
        sharingPaused: true
      });

      store._handleSwitchBrowserShare(42);
      clock.tick(500);

      sinon.assert.notCalled(getSelectedTabMetadataStub);
      sinon.assert.notCalled(dispatcher.dispatch);
    });

    it("should not process a request if no-one is in the room", function() {
      store.setStoreState({
        participants: [{
          displayName: "Owner",
          owner: true
        }]
      });

      store._handleSwitchBrowserShare(42);

      clock.tick(500);

      sinon.assert.notCalled(getSelectedTabMetadataStub);
      sinon.assert.notCalled(dispatcher.dispatch);
    });
  });

  describe("#endScreenShare", function() {
    it("should set the state to 'inactive'", function() {
      store.endScreenShare();

      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWith(dispatcher.dispatch,
        new sharedActions.ScreenSharingState({
          state: SCREEN_SHARE_STATES.INACTIVE
        }));
    });

    it("should remove the sharing listener", function() {
      // Setup the listener.
      store.startBrowserShare();

      // Now stop the screen share.
      store.endScreenShare();

      sinon.assert.calledOnce(requestStubs.RemoveBrowserSharingListener);
    });
  });

  describe("#toggleBrowserSharing", function() {
    it("should set paused to false when enabled", function() {
      store.toggleBrowserSharing(new sharedActions.ToggleBrowserSharing({
        enabled: true
      }));

      expect(store.getStoreState().sharingPaused).eql(false);
    });

    it("should set paused to true when not enabled", function() {
      store.toggleBrowserSharing(new sharedActions.ToggleBrowserSharing({
        enabled: false
      }));

      expect(store.getStoreState().sharingPaused).eql(true);
    });

    it("should update context when enabled", function() {
      var getSelectedTabMetadataStub = sinon.stub();
      LoopMochaUtils.stubLoopRequest({
        GetSelectedTabMetadata: getSelectedTabMetadataStub.returns({
          title: "fakeTitle",
          favicon: "fakeFavicon",
          url: "http://www.fakeurl.com"
        })
      });
      store.setStoreState({
        roomState: ROOM_STATES.JOINED,
        roomToken: "fakeToken"
      });

      store.toggleBrowserSharing(new sharedActions.ToggleBrowserSharing({
        enabled: true
      }));
      clock.tick(500);

      sinon.assert.calledOnce(getSelectedTabMetadataStub);
      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWith(dispatcher.dispatch,
        new sharedActions.UpdateRoomContext({
          newRoomDescription: "fakeTitle",
          newRoomThumbnail: "fakeFavicon",
          newRoomURL: "http://www.fakeurl.com",
          roomToken: "fakeToken"
      }));
    });
  });

  describe("#remotePeerConnected", function() {
    it("should set the state to `HAS_PARTICIPANTS`", function() {
      store.remotePeerConnected();

      expect(store.getStoreState().roomState).eql(ROOM_STATES.HAS_PARTICIPANTS);
    });
  });

  describe("#remotePeerDisconnected", function() {
    it("should set the state to `SESSION_CONNECTED`", function() {
      store.remotePeerDisconnected();

      expect(store.getStoreState().roomState).eql(ROOM_STATES.SESSION_CONNECTED);
    });

    it("should clear the mediaConnected state", function() {
      store.setStoreState({
        mediaConnected: true
      });

      store.remotePeerDisconnected();

      expect(store.getStoreState().mediaConnected).eql(false);
    });

    it("should clear the remoteSrcMediaElement", function() {
      store.setStoreState({
        remoteSrcMediaElement: { name: "fakeStreamElement" }
      });

      store.remotePeerDisconnected();

      expect(store.getStoreState().remoteSrcMediaElement).eql(null);
    });

    it("should remove non-owner participants", function() {
      store.setStoreState({
        participants: [{ owner: true }, {}]
      });

      store.remotePeerDisconnected();

      var participants = store.getStoreState().participants;
      expect(participants).to.have.length.of(1);
      expect(participants[0].owner).eql(true);
    });

    it("should keep the owner participant", function() {
      store.setStoreState({
        participants: [{ owner: true }]
      });

      store.remotePeerDisconnected();

      var participants = store.getStoreState().participants;
      expect(participants).to.have.length.of(1);
      expect(participants[0].owner).eql(true);
    });

    it("should clear the streamPaused state", function() {
      store.setStoreState({
        streamPaused: true
      });

      store.remotePeerDisconnected();

      expect(store.getStoreState().streamPaused).eql(false);
    });

    it("should set the remotePeerDisconnected to `true", function() {
      store.setStoreState({
        remotePeerDisconnected: false
      });

      store.remotePeerDisconnected();

      expect(store.getStoreState().remotePeerDisconnected).eql(true);
    });
  });

  describe("#connectionStatus", function() {
    it("should call rooms.sendConnectionStatus on mozLoop", function() {
      store.setStoreState({
        roomToken: "fakeToken",
        webrtcTokens: {
          sessionToken: "9876543210"
        }
      });

      var data = new sharedActions.ConnectionStatus({
        event: "Publisher.streamCreated",
        state: "sendrecv",
        connections: 2,
        recvStreams: 1,
        sendStreams: 2
      });

      store.connectionStatus(data);

      sinon.assert.calledOnce(requestStubs["Rooms:SendConnectionStatus"]);
      sinon.assert.calledWith(requestStubs["Rooms:SendConnectionStatus"],
        "fakeToken", "9876543210", data);
    });
  });

  describe("#windowUnload", function() {
    beforeEach(function() {
      store.setStoreState({
        roomState: ROOM_STATES.JOINED,
        roomToken: "fakeToken",
        sessionToken: "1627384950",
        windowId: "1234"
      });
    });

    it("should set screen sharing inactive", function() {
      store.screenSharingState(new sharedActions.ScreenSharingState({
        state: SCREEN_SHARE_STATES.INACTIVE
      }));

      sinon.assert.calledOnce(requestStubs.SetScreenShareState);
      sinon.assert.calledWithExactly(requestStubs.SetScreenShareState, "1234", false);
    });

    it("should disconnect from the servers via the sdk", function() {
      store.windowUnload();

      sinon.assert.calledOnce(fakeSdkDriver.disconnectSession);
    });

    it("should call 'endScreenShare'", function() {
      sandbox.stub(store, "endScreenShare");

      store.windowUnload();

      sinon.assert.calledOnce(store.endScreenShare);
    });

    it("should remove the sharing listener", function() {
      sandbox.stub(loop, "unsubscribe");

      // Setup the listener.
      store.startBrowserShare();

      // Now unload the window.
      store.windowUnload();

      sinon.assert.calledOnce(loop.unsubscribe);
      sinon.assert.calledWith(loop.unsubscribe, "BrowserSwitch");
    });

    it("should set the state to CLOSING", function() {
      store.windowUnload();

      expect(store._storeState.roomState).eql(ROOM_STATES.CLOSING);
    });
  });

  describe("#leaveRoom", function() {
    beforeEach(function() {
      store.setStoreState({
        roomState: ROOM_STATES.JOINED,
        roomToken: "fakeToken",
        sessionToken: "1627384950"
      });
    });

    it("should disconnect from the servers via the sdk", function() {
      store.leaveRoom();

      sinon.assert.calledOnce(fakeSdkDriver.disconnectSession);
    });

    it("should call 'endScreenShare'", function() {
      sandbox.stub(store, "endScreenShare");

      store.leaveRoom();

      sinon.assert.calledOnce(store.endScreenShare);
    });

    it("should set the state to ENDED", function() {
      store.leaveRoom();

      expect(store._storeState.roomState).eql(ROOM_STATES.ENDED);
    });

    it("should reset various store states", function() {
      store.setStoreState({
        audioMuted: true,
        localVideoDimensions: { x: 10 },
        receivingScreenShare: true,
        remotePeerDisconnected: true,
        remoteVideoDimensions: { y: 10 },
        screenSharingState: true,
        videoMuted: true,
        chatMessageExchanged: false
      });

      store.leaveRoom();

      expect(store._storeState.audioMuted).eql(false);
      expect(store._storeState.localVideoDimensions).eql({});
      expect(store._storeState.receivingScreenShare).eql(false);
      expect(store._storeState.remotePeerDisconnected).eql(false);
      expect(store._storeState.remoteVideoDimensions).eql({});
      expect(store._storeState.screenSharingState).eql(SCREEN_SHARE_STATES.INACTIVE);
      expect(store._storeState.videoMuted).eql(false);
      expect(store._storeState.chatMessageExchanged).eql(false);
    });

    it("should not reset the room context", function() {
      store.setStoreState({
        roomContextUrls: [{ fake: 1 }],
        roomName: "fred"
      });

      store.leaveRoom();

      expect(store._storeState.roomName).eql("fred");
      expect(store._storeState.roomContextUrls).eql([{ fake: 1 }]);
    });
  });

  describe("#_handleTextChatMessage", function() {
    beforeEach(function() {
      var fakeRoomData = {
        decryptedContext: {
          roomName: "Monkeys"
        },
        participants: [],
        roomUrl: "http://invalid"
      };
      requestStubs["Rooms:Get"].returns(fakeRoomData);

      store._isDesktop = true;
      store.setupWindowData(new sharedActions.SetupWindowData({
        roomToken: "fakeToken"
      }));
    });

    function assertWeDidNothing() {
      expect(dispatcher._eventData.receivedTextChatMessage.length).eql(1);
      expect(dispatcher._eventData.sendTextChatMessage.length).eql(1);
      expect(store.getStoreState().chatMessageExchanged).eql(false);
      sinon.assert.notCalled(requestStubs.TelemetryAddValue);
    }

    it("should not do anything for the link clicker side", function() {
      store._isDesktop = false;

      store._handleTextChatMessage(new sharedActions.SendTextChatMessage({
        contentType: CHAT_CONTENT_TYPES.TEXT,
        message: "Hello!",
        sentTimestamp: 1401318000000
      }));

      assertWeDidNothing();
    });

    it("should not do anything when a chat message has arrived before", function() {
      store.setStoreState({ chatMessageExchanged: true });

      store._handleTextChatMessage(new sharedActions.ReceivedTextChatMessage({
        contentType: CHAT_CONTENT_TYPES.TEXT,
        message: "Hello!",
        receivedTimestamp: 1401318000000
      }));

      sinon.assert.notCalled(requestStubs.TelemetryAddValue);
    });

    it("should not do anything for non-chat messages", function() {
      store._handleTextChatMessage(new sharedActions.SendTextChatMessage({
        contentType: CHAT_CONTENT_TYPES.CONTEXT,
        message: "Hello!",
        sentTimestamp: 1401318000000
      }));

      assertWeDidNothing();
    });
  });

  describe("Events", function() {
    describe("delete:{roomToken}", function() {
      var fakeRoomData = {
        decryptedContext: {
          roomName: "Its a room"
        },
        roomToken: "fakeToken",
        roomUrl: "http://invalid"
      };

      beforeEach(function() {
        requestStubs["Rooms:Get"].returns(fakeRoomData);
        store.setupWindowData(new sharedActions.SetupWindowData({
          roomToken: "fakeToken"
        }));
      });

      // XXX akita-sidebar
      it.skip("should disconnect all room connections", function() {
        LoopMochaUtils.publish("Rooms:Delete:" + fakeRoomData.roomToken, fakeRoomData);

        sinon.assert.calledOnce(fakeSdkDriver.forceDisconnectAll);
      });

      it("should not disconnect anything when another room is deleted", function() {
        LoopMochaUtils.publish("Rooms:Delete:invalidToken", fakeRoomData);

        sinon.assert.notCalled(fakeSdkDriver.forceDisconnectAll);
      });
    });
  });
});
