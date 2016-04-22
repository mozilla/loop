/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

describe("loop.standaloneRoomViews", function() {
  "use strict";

  var expect = chai.expect;
  var TestUtils = React.addons.TestUtils;

  var ROOM_STATES = loop.store.ROOM_STATES;
  var FAILURE_DETAILS = loop.shared.utils.FAILURE_DETAILS;
  var sharedActions = loop.shared.actions;
  var sharedUtils = loop.shared.utils;
  var fixtures = document.querySelector("#fixtures");

  var sandbox,
      dispatch,
      dispatcher,
      activeRoomStore,
      textChatStore,
      remoteCursorStore;

  var clock,
      fakeWindow,
      view;

  beforeEach(function() {
    sandbox = LoopMochaUtils.createSandbox();
    dispatcher = new loop.Dispatcher();
    dispatch = sandbox.stub(dispatcher, "dispatch");
    activeRoomStore = new loop.store.ActiveRoomStore(dispatcher, {
      mozLoop: {},
      sdkDriver: {}
    });
    textChatStore = new loop.store.TextChatStore(dispatcher, {
      sdkDriver: {}
    });
    remoteCursorStore = new loop.store.RemoteCursorStore(dispatcher, {
      sdkDriver: {}
    });
    loop.store.StoreMixin.register({
      cursorStore: remoteCursorStore,
      activeRoomStore: activeRoomStore,
      textChatStore: textChatStore
    });

    clock = sandbox.useFakeTimers();
    fakeWindow = {
      close: sandbox.stub(),
      addEventListener: function() {},
      document: { addEventListener: function() {} },
      removeEventListener: function() {},
      setTimeout: function(callback) { callback(); }
    };
    loop.shared.mixins.setRootObject(fakeWindow);


    sandbox.stub(navigator.mozL10n, "get", function(key, args) {
      switch (key) {
        case "standalone_title_with_room_name":
          return args.roomName + " — " + args.clientShortname;
        case "legal_text_and_links":
          return args.terms_of_use_url + " " + args.privacy_notice_url;
        default:
          return key;
      }
    });

    // Prevents audio request errors in the test console.
    sandbox.useFakeXMLHttpRequest();
    sandbox.stub(sharedUtils, "isDesktop").returns(true);
    LoopMochaUtils.stubLoopRequest({
      GetDoNotDisturb: sinon.stub().returns(true),
      GetLoopPref: sinon.stub()
    });
  });

  afterEach(function() {
    loop.shared.mixins.setRootObject(window);
    sandbox.restore();
    clock.restore();
    React.unmountComponentAtNode(fixtures);
    view = null;
  });


  describe("TosView", function() {
    var origConfig, node;

    function mountTestComponent() {
      return TestUtils.renderIntoDocument(
        React.createElement(
          loop.standaloneRoomViews.ToSView, {
            dispatcher: dispatcher
          }));
    }

    beforeEach(function() {
      origConfig = loop.config;
      loop.config = {
        legalWebsiteUrl: "http://fakelegal/",
        privacyWebsiteUrl: "http://fakeprivacy/"
      };

      view = mountTestComponent();
      node = view.getDOMNode();
    });

    afterEach(function() {
      loop.config = origConfig;
    });

    it("should dispatch a link click action when the ToS link is clicked", function() {
      // [0] is the first link, the legal one.
      var link = node.querySelectorAll("a")[0];

      TestUtils.Simulate.click(node, { target: link });

      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWithExactly(dispatcher.dispatch,
        new sharedActions.RecordClick({
          linkInfo: loop.config.legalWebsiteUrl
        }));
    });

    it("should dispatch a link click action when the Privacy link is clicked", function() {
      // [0] is the first link, the legal one.
      var link = node.querySelectorAll("a")[1];

      TestUtils.Simulate.click(node, { target: link });

      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWithExactly(dispatcher.dispatch,
        new sharedActions.RecordClick({
          linkInfo: loop.config.privacyWebsiteUrl
        }));
    });

    it("should not dispatch an action when the text is clicked", function() {
      TestUtils.Simulate.click(node, { target: node });

      sinon.assert.notCalled(dispatcher.dispatch);
    });
  });

  describe("StandaloneHandleUserAgentView", function() {
    function mountTestComponent() {
      return TestUtils.renderIntoDocument(
        React.createElement(
          loop.standaloneRoomViews.StandaloneHandleUserAgentView, {
            dispatcher: dispatcher
          }));
    }

    it("should display a join room button if the state is not ROOM_JOINED", function() {
      activeRoomStore.setStoreState({
        roomState: ROOM_STATES.READY,
        roomName: "fakeName"
      });

      view = mountTestComponent();
      var button = view.getDOMNode().querySelector(".info-panel > button");

      expect(button.textContent).eql("rooms_room_join_label");
    });

    it("should dispatch a JoinRoom action when the join room button is clicked", function() {
      activeRoomStore.setStoreState({
        roomState: ROOM_STATES.READY,
        roomName: "fakeName"
      });

      view = mountTestComponent();
      var button = view.getDOMNode().querySelector(".info-panel > button");

      TestUtils.Simulate.click(button);

      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWithExactly(dispatcher.dispatch, new sharedActions.JoinRoom());
    });

    it("should display a enjoy your conversation button if the state is ROOM_JOINED", function() {
      activeRoomStore.setStoreState({
        roomState: ROOM_STATES.JOINED,
        roomName: "fakeName"
      });

      view = mountTestComponent();
      var button = view.getDOMNode().querySelector(".info-panel > button");

      expect(button.textContent).eql("rooms_room_joined_own_conversation_label");
    });

    it("should disable the enjoy your conversation button if the state is ROOM_JOINED", function() {
      activeRoomStore.setStoreState({
        roomState: ROOM_STATES.JOINED,
        roomName: "fakeName"
      });

      view = mountTestComponent();
      var button = view.getDOMNode().querySelector(".info-panel > button");

      expect(button.classList.contains("disabled")).eql(true);
    });

    it("should not display a join button if there is a failure reason", function() {
      activeRoomStore.setStoreState({
        failureReason: FAILURE_DETAILS.ROOM_ALREADY_OPEN,
        roomName: "fakeName"
      });

      view = mountTestComponent();
      var button = view.getDOMNode().querySelector(".info-panel > button");

      expect(button).eql(null);
    });

    it("should display a room already joined message if opening failed", function() {
      activeRoomStore.setStoreState({
        failureReason: FAILURE_DETAILS.ROOM_ALREADY_OPEN,
        roomName: "fakeName"
      });

      view = mountTestComponent();
      var text = view.getDOMNode().querySelector(".failure");

      expect(text.textContent).eql("rooms_already_joined");
    });

    describe("Room name priority", function() {
      it("should use room name", function() {
        activeRoomStore.setStoreState({
          roomState: ROOM_STATES.JOINED,
          roomName: "fakeName"
        });

        view = mountTestComponent();
        var text = view.getDOMNode().querySelector(".roomName");

        expect(
          text.textContent)
        .eql("fakeName");
      });

      it("should use context title when there's no room title", function() {
        activeRoomStore.setStoreState({
          roomState: ROOM_STATES.JOINED,
          roomContextUrls: [
            {
              description: "Website title",
              location: "https://fakeurl.com"
            }
          ]
        });

        view = mountTestComponent();
        var text = view.getDOMNode().querySelector(".roomName");

        expect(
          text.textContent)
        .eql("Website title");
      });

      it("should use website url when there's no room title nor website", function() {
        activeRoomStore.setStoreState({
          roomState: ROOM_STATES.JOINED,
          roomContextUrls: [
            {
              location: "https://fakeurl.com"
            }
          ]
        });

        view = mountTestComponent();
        var text = view.getDOMNode().querySelector(".roomName");

        expect(
          text.textContent)
        .eql("https://fakeurl.com");
      });
    });
  });

  describe("StandaloneRoomFailureView", function() {
    function mountTestComponent(extraProps) {
      var props = _.extend({
        dispatcher: dispatcher
      }, extraProps);
      return TestUtils.renderIntoDocument(
        React.createElement(
          loop.standaloneRoomViews.StandaloneRoomFailureView, props));
    }

    beforeEach(function() {
      activeRoomStore.setStoreState({
        roomState: ROOM_STATES.FAILED,
        roomName: "fakeName"
      });
    });

    it("should display a status error message if not reason is supplied", function() {
      view = mountTestComponent();

      expect(view.getDOMNode().querySelector(".failed-room-message").textContent)
        .eql("status_error");
    });

    it("should display a denied message on MEDIA_DENIED", function() {
      view = mountTestComponent({ failureReason: FAILURE_DETAILS.MEDIA_DENIED });

      expect(view.getDOMNode().querySelector(".failed-room-message").textContent)
        .eql("rooms_media_denied_message");
    });

    it("should display a denied message on NO_MEDIA", function() {
      view = mountTestComponent({ failureReason: FAILURE_DETAILS.NO_MEDIA });

      expect(view.getDOMNode().querySelector(".failed-room-message").textContent)
        .eql("rooms_media_denied_message");
    });

    it("should display an unavailable message on EXPIRED_OR_INVALID", function() {
      view = mountTestComponent({ failureReason: FAILURE_DETAILS.EXPIRED_OR_INVALID });

      expect(view.getDOMNode().querySelector(".failed-room-message").textContent)
        .eql("rooms_unavailable_notification_message");
    });

    it("should display an tos failure message on TOS_FAILURE", function() {
      view = mountTestComponent({ failureReason: FAILURE_DETAILS.TOS_FAILURE });

      expect(view.getDOMNode().querySelector(".failed-room-message").textContent)
        .eql("tos_failure_message");
    });

    it("should display cannot connect to server on COULD_NOT_CONNECT", function() {
      view = mountTestComponent({ failureReason: FAILURE_DETAILS.COULD_NOT_CONNECT });

      expect(view.getDOMNode().querySelector(".failed-room-message").textContent)
        .eql("rooms_server_unavailable_message");
    });

    it("should display Something went wrong on UNKNOWN error", function() {
      view = mountTestComponent({ failureReason: FAILURE_DETAILS.UNKNOWN });

      expect(view.getDOMNode().querySelector(".failed-room-message").textContent)
        .eql("status_error");
    });

    it("should not display a retry button when the failure reason is expired or invalid", function() {
      view = mountTestComponent({ failureReason: FAILURE_DETAILS.EXPIRED_OR_INVALID });

      expect(view.getDOMNode().querySelector(".btn-info")).eql(null);
    });

    it("should not display a retry button when the failure reason is tos failure", function() {
      view = mountTestComponent({ failureReason: FAILURE_DETAILS.TOS_FAILURE });

      expect(view.getDOMNode().querySelector(".btn-info")).eql(null);
    });

    it("should display a retry button for any other reason", function() {
      view = mountTestComponent({ failureReason: FAILURE_DETAILS.NO_MEDIA });

      expect(view.getDOMNode().querySelector(".btn-info")).not.eql(null);
    });

    it("should dispatch a RetryAfterRoomFailure action when the retry button is pressed", function() {
      view = mountTestComponent({ failureReason: FAILURE_DETAILS.NO_MEDIA });

      var button = view.getDOMNode().querySelector(".btn-info");

      TestUtils.Simulate.click(button);

      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWithExactly(dispatcher.dispatch,
        new sharedActions.RetryAfterRoomFailure());
    });
  });

  describe("StandaloneInfoBar", function() {
    function mountTestComponent(extraProps) {
      var props = _.extend({
        audio: {
          enabled: true,
          visible: true
        },
        dispatcher: dispatcher,
        leaveRoom: function() {},
        room: {
          roomName: "fakeName",
          roomContextUrls: []
        },
        video: {
          enabled: true,
          visible: true
        }
      }, extraProps);
      return TestUtils.renderIntoDocument(
        React.createElement(loop.standaloneRoomViews.StandaloneInfoBar, props)
      );
    }

    beforeEach(function() {
      view = mountTestComponent();
    });

    it("should dispatch a RecordClick action when the support link is clicked", function() {
      view = mountTestComponent();

      TestUtils.Simulate.click(view.getDOMNode().querySelector("a"));

      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWithExactly(dispatcher.dispatch,
        new sharedActions.RecordClick({
          linkInfo: "Support link click"
        }));
    });

    it("should display the hello-logo element", function() {
      view = mountTestComponent();

      expect(view.getDOMNode().querySelector(".hello-logo"))
        .instanceOf(HTMLDivElement);
    });

    it("should display the support url button", function() {
      view = mountTestComponent();

      expect(view.getDOMNode().querySelector(".general-support-url"))
        .instanceOf(HTMLAnchorElement);
    });

    it("should display the media control buttons if the user has joined to the room", function() {
      view = mountTestComponent({
        room: {
          roomState: ROOM_STATES.JOINED
        }
      });

      expect(view.getDOMNode().querySelector(".btn-mute-audio"))
        .instanceOf(HTMLButtonElement);
      expect(view.getDOMNode().querySelector(".btn-mute-video"))
        .instanceOf(HTMLButtonElement);
    });

    it("should display the hangup button if the user has joined to the room", function() {
      view = mountTestComponent({
        room: {
          roomState: ROOM_STATES.JOINED
        }
      });

      expect(view.getDOMNode().querySelector(".btn-hangup"))
        .instanceOf(HTMLButtonElement);
    });

    describe("StandaloneInfoView", function() {
      it("should display ToS link", function() {
        view = mountTestComponent({
          room: {
            roomState: ROOM_STATES.READY
          }
        });

        expect(view.getDOMNode().querySelector(".terms-service"))
          .instanceOf(HTMLParagraphElement);
      });

      it("should display room welcome message", function() {
        view = mountTestComponent({
          room: {
            roomState: ROOM_STATES.JOINED,
            roomName: "FakeRoomName",
            roomContextUrls: [{
              location: "http://fakeurl.com",
              thumbnail: "fakeFavicon.ico"
            }]
          }
        });

        expect(view.getDOMNode().querySelector(".standalone-info-bar-context p").textContent)
          .eql("rooms_welcome_title");
      });

      it("should display room context info", function() {
        view = mountTestComponent({
          room: {
            roomState: ROOM_STATES.HAS_PARTICIPANTS,
            roomName: "FakeRoomName",
            roomContextUrls: [{
              location: "http://fakeurl.com",
              thumbnail: "fakeFavicon.ico"
            }]
          }
        });

        expect(view.getDOMNode().querySelector(".standalone-info-bar-context h2").textContent)
          .eql("FakeRoomName");
        expect(view.getDOMNode().querySelector(".standalone-info-bar-context img"))
          .not.eql("FakeRoomName");
      });

      it("should allow context link if context location is http", function() {
        view = mountTestComponent({
          room: {
            roomState: ROOM_STATES.HAS_PARTICIPANTS,
            roomName: "FakeRoomName",
            roomContextUrls: [{
              location: "http://fakeurl.com/",
              thumbnail: "fakeFavicon.ico"
            }]
          }
        });

        expect(view.getDOMNode().querySelector(".standalone-info-bar-context a").getAttribute("href"))
          .eql("http://fakeurl.com/");
      });

      it("should not allow context link if context location is about url", function() {
        view = mountTestComponent({
          room: {
            roomState: ROOM_STATES.HAS_PARTICIPANTS,
            roomName: "aboutConfig",
            roomContextUrls: [{
              location: "about:config",
              thumbnail: "fakeFavicon.ico"
            }]
          }
        });

        expect(view.getDOMNode().querySelector(".standalone-info-bar-context a").getAttribute("href"))
          .eql(null);
      });

      it("should not allow context link if the context location protocol is not whitelisted", function() {
        view = mountTestComponent({
          room: {
            roomState: ROOM_STATES.HAS_PARTICIPANTS,
            roomName: "nonWhitelistUrl",
            roomContextUrls: [{
              location: "somethingelse://somethingOtherThanWhitelist.com",
              thumbnail: "fakeFavicon.ico"
            }]
          }
        });

        expect(view.getDOMNode().querySelector(".standalone-info-bar-context a").getAttribute("href"))
          .eql(null);
      });
    });
  });

  describe("StandaloneRoomView", function() {
    function mountTestComponent(props) {
      props = _.extend({
        cursorStore: remoteCursorStore,
        dispatcher: dispatcher,
        introSeen: true,
        activeRoomStore: activeRoomStore,
        isFirefox: true
      }, props);

      // XXX akita-sidebar
      activeRoomStore.setStoreState({
        roomToken: "fakeToken"
      });

      return TestUtils.renderIntoDocument(
        React.createElement(
          loop.standaloneRoomViews.StandaloneRoomView, props
        )
      );
    }

    function expectActionDispatched() {
      sinon.assert.calledOnce(dispatch);
      sinon.assert.calledWithExactly(dispatch,
        sinon.match.instanceOf(sharedActions.SetupStreamElements));
    }

    describe("#introScreen", function() {
      function getOKButton(elem) {
        return elem.getDOMNode().querySelector(".button-got-it");
      }

      // XXX akita-sidebar
      it.skip("should show introduction screen if introSeen is set to false", function() {
        view = mountTestComponent({ introSeen: false });
        expect(getOKButton(view))
          .not.eql(null);
      });

      // XXX akita-sidebar
      it.skip("should not show introduction screen if introSeen is set to true", function() {
        view = mountTestComponent({ introSeen: true });
        expect(getOKButton(view))
          .eql(null);
      });
    });

    describe("#componentWillUpdate", function() {
      beforeEach(function() {
        activeRoomStore.setStoreState({ roomName: "fakeName" });
      });
      // XXX akita-sidebar
      it.skip("should set document.title to roomName and brand name when the READY state is dispatched", function() {
        activeRoomStore.setStoreState({ roomState: ROOM_STATES.INIT });
        view = mountTestComponent();
        activeRoomStore.setStoreState({ roomState: ROOM_STATES.READY });

        expect(fakeWindow.document.title).to.equal("fakeName — clientShortname2");
      });

      // XXX akita-sidebar
      it.skip("should set document.title to brand name when state is READY and roomName is undefined", function() {
        activeRoomStore.setStoreState({ roomState: ROOM_STATES.INIT });
        view = mountTestComponent();
        activeRoomStore.setStoreState({ roomName: undefined, roomState: ROOM_STATES.READY });

        expect(fakeWindow.document.title).to.equal("clientShortname2");
      });

      // XXX akita-sidebar
      it.skip("should set document.title to roomContectUrls[0] and brand name when state is READY and roomContextUrls is present", function() {
        activeRoomStore.setStoreState({ roomState: ROOM_STATES.INIT });
        view = mountTestComponent();
        activeRoomStore.setStoreState({
          roomName: undefined,
          roomContextUrls: [{
            description: "fakeStartPage",
            location: null
          }],
          roomState: ROOM_STATES.READY
        });

        expect(fakeWindow.document.title).to.equal("fakeStartPage — clientShortname2");
      });

      // XXX akita-sidebar
      it.skip("should dispatch a `SetupStreamElements` action when the MEDIA_WAIT state " +
        "is entered", function() {
          activeRoomStore.setStoreState({ roomState: ROOM_STATES.READY });
          view = mountTestComponent();

          activeRoomStore.setStoreState({ roomState: ROOM_STATES.MEDIA_WAIT });

          expectActionDispatched(view);
        });

      // XXX akita-sidebar
      it.skip("should dispatch a `SetupStreamElements` action on MEDIA_WAIT state is " +
        "re-entered", function() {
          activeRoomStore.setStoreState({ roomState: ROOM_STATES.ENDED });
          view = mountTestComponent();

          activeRoomStore.setStoreState({ roomState: ROOM_STATES.MEDIA_WAIT });

          expectActionDispatched(view);
        });
    });

    describe("#componentDidUpdate", function() {
      beforeEach(function() {
        view = mountTestComponent();
        activeRoomStore.setStoreState({
          roomContextUrls: [{
            description: "fakeStartPage",
            location: null
          }]
        });
        activeRoomStore.setStoreState({ roomState: ROOM_STATES.JOINING });
        activeRoomStore.setStoreState({ roomState: ROOM_STATES.JOINED });
      });

      // XXX akita-sidebar
      it.skip("should not dispatch a `TileShown` action immediately in the JOINED state",
        function() {
          sinon.assert.notCalled(dispatch);
        });

      // XXX akita-sidebar
      it.skip("should dispatch a `TileShown` action after a wait when in the JOINED state",
        function() {
          clock.tick(loop.standaloneRoomViews.StandaloneRoomInfoArea.RENDER_WAITING_DELAY);

          sinon.assert.calledOnce(dispatch);
          sinon.assert.calledWithExactly(dispatch, new sharedActions.TileShown());
        });

      // XXX akita-sidebar
      it.skip("should dispatch a single `TileShown` action after a wait when going through multiple waiting states",
        function() {
          activeRoomStore.setStoreState({ roomState: ROOM_STATES.SESSION_CONNECTED });
          clock.tick(loop.standaloneRoomViews.StandaloneRoomInfoArea.RENDER_WAITING_DELAY);

          sinon.assert.calledOnce(dispatch);
          sinon.assert.calledWithExactly(dispatch, new sharedActions.TileShown());
        });

      // XXX akita-sidebar
      it.skip("should not dispatch a `TileShown` action after a wait when in the HAS_PARTICIPANTS state",
        function() {
          activeRoomStore.setStoreState({ roomState: ROOM_STATES.HAS_PARTICIPANTS });
          clock.tick(loop.standaloneRoomViews.StandaloneRoomInfoArea.RENDER_WAITING_DELAY);

          sinon.assert.notCalled(dispatch);
        });

      // XXX akita-sidebar
      it.skip("should dispatch a `TileShown` action after a wait when a participant leaves",
        function() {
          activeRoomStore.setStoreState({ roomState: ROOM_STATES.HAS_PARTICIPANTS });
          clock.tick(loop.standaloneRoomViews.StandaloneRoomInfoArea.RENDER_WAITING_DELAY);
          activeRoomStore.remotePeerDisconnected();
          clock.tick(loop.standaloneRoomViews.StandaloneRoomInfoArea.RENDER_WAITING_DELAY);

          sinon.assert.calledOnce(dispatch);
          sinon.assert.calledWithExactly(dispatch, new sharedActions.TileShown());
        });
    });

    describe("#componentWillReceiveProps", function() {
      beforeEach(function() {
        view = mountTestComponent();

        // Pretend the user waited a little bit
        activeRoomStore.setStoreState({
          roomState: ROOM_STATES.JOINING,
          roomName: "fakeName",
          roomContextUrls: [{
            description: "fakeStartPage",
            location: null
          }]
        });
        clock.tick(loop.standaloneRoomViews.StandaloneRoomInfoArea.RENDER_WAITING_DELAY - 1);
      });

      describe("Support multiple joins", function() {
        // XXX akita-sidebar
        it.skip("should send the first `TileShown` after waiting in JOINING state",
          function() {
            clock.tick(1);

            sinon.assert.calledOnce(dispatch);
            sinon.assert.calledWithExactly(dispatch, new sharedActions.TileShown());
          });

        // XXX akita-sidebar
        it.skip("should send the second `TileShown` after ending and rejoining",
          function() {
            // Trigger the first message then rejoin and wait
            clock.tick(1);
            activeRoomStore.setStoreState({ roomState: ROOM_STATES.ENDED });
            activeRoomStore.setStoreState({ roomState: ROOM_STATES.JOINING });
            clock.tick(loop.standaloneRoomViews.StandaloneRoomInfoArea.RENDER_WAITING_DELAY);

            sinon.assert.calledTwice(dispatch);
            sinon.assert.calledWithExactly(dispatch, new sharedActions.TileShown());
          });
      });

      describe("Handle leaving quickly", function() {
        beforeEach(function() {
          // The user left and rejoined
          activeRoomStore.setStoreState({ roomState: ROOM_STATES.ENDED });
          activeRoomStore.setStoreState({ roomState: ROOM_STATES.JOINING });
        });

        // XXX akita-sidebar
        it.skip("should not dispatch an old `TileShown` action after leaving and rejoining",
          function() {
            clock.tick(1);

            sinon.assert.notCalled(dispatch);
          });

        // XXX akita-sidebar
        it.skip("should dispatch a new `TileShown` action after leaving and rejoining and waiting",
          function() {
            clock.tick(loop.standaloneRoomViews.StandaloneRoomInfoArea.RENDER_WAITING_DELAY);

            sinon.assert.calledOnce(dispatch);
            sinon.assert.calledWithExactly(dispatch, new sharedActions.TileShown());
          });
      });
    });

    describe("#publishStream", function() {
      beforeEach(function() {
        activeRoomStore.setStoreState({ roomState: ROOM_STATES.JOINED });
        view = mountTestComponent();
        view.setState({
          audioMuted: true,
          localAudioEnabled: true,
          localVideoEnabled: true,
          videoMuted: true
        });
      });

      // XXX akita-sidebar
      it.skip("should mute local audio stream", function() {
        TestUtils.Simulate.click(
          view.getDOMNode().querySelector(".btn-mute-audio"));

        sinon.assert.calledOnce(dispatch);
        sinon.assert.calledWithExactly(dispatch, new sharedActions.SetMute({
          type: "audio",
          enabled: true
        }));
      });

      // XXX akita-sidebar
      it.skip("should mute local video stream", function() {
        TestUtils.Simulate.click(
          view.getDOMNode().querySelector(".btn-mute-video"));

        sinon.assert.calledOnce(dispatch);
        sinon.assert.calledWithExactly(dispatch, new sharedActions.SetMute({
          type: "video",
          enabled: true
        }));
      });

      // XXX akita-sidebar
      it.skip("should mute local video stream", function() {
        TestUtils.Simulate.click(
          view.getDOMNode().querySelector(".btn-mute-video"));

        sinon.assert.calledOnce(dispatch);
        sinon.assert.calledWithExactly(dispatch, new sharedActions.SetMute({
          type: "video",
          enabled: true
        }));
      });

      describe("disabled states", function() {
        beforeEach(function() {
          view = mountTestComponent();
          view.setState({
            localAudioEnabled: false,
            localVideoEnabled: false
          });
        });

        // XXX akita-sidebar
        it.skip("should not mute local video stream if camera is not available", function() {
          TestUtils.Simulate.click(
            view.getDOMNode().querySelector(".btn-mute-video"));

          sinon.assert.notCalled(dispatch);
        });

        // XXX akita-sidebar
        it.skip("should not mute local audio stream if mic is not available", function() {
          TestUtils.Simulate.click(
            view.getDOMNode().querySelector(".btn-mute-video"));

          sinon.assert.notCalled(dispatch);
        });
      });
    });

    describe("#render", function() {
      beforeEach(function() {
        view = mountTestComponent();
        activeRoomStore.setStoreState({
          roomState: ROOM_STATES.JOINING,
          roomName: "fakeName",
          roomContextUrls: [{
            description: "fakeStartPage",
            location: "http://fakeurl.com"
          }]
        });
      });

      describe("Empty room message", function() {
        // XXX akita-sidebar
        it.skip("should not display an message immediately in the JOINED state",
          function() {
            activeRoomStore.setStoreState({ roomState: ROOM_STATES.JOINED });

            expect(view.getDOMNode().querySelector(".room-notification-header h2"))
              .eql(null);
          });

        // XXX akita-sidebar
        it.skip("should display an empty room message after a wait when in the JOINED state",
          function() {
            activeRoomStore.setStoreState({ roomState: ROOM_STATES.JOINED });
            clock.tick(loop.standaloneRoomViews.StandaloneRoomInfoArea.RENDER_WAITING_DELAY);

            expect(view.getDOMNode().querySelector(".room-notification-header h2"))
              .not.eql(null);
            expect(view.getDOMNode().querySelector(".room-notification-header h2").textContent)
              .eql("rooms_only_occupant_label2");
          });

          // XXX akita-sidebar
          it.skip("should display a standalone-info-bar-context area after a wait when in the " +
            "JOINED state and roomContextUrls is null",
            function() {
              activeRoomStore.setStoreState({
                 roomState: ROOM_STATES.JOINED,
                 roomName: "Monkeys",
                 roomContextUrls: null
               });

              clock.tick(loop.standaloneRoomViews.StandaloneRoomInfoArea.RENDER_WAITING_DELAY);

              expect(view.getDOMNode().querySelector(".standalone-info-bar-context"))
                .not.eql(null);
            });

            // XXX akita-sidebar
            it.skip("should display a standalone-info-bar-context area after a wait when in the " +
              "JOINED state and roomName is null",
              function() {
                activeRoomStore.setStoreState({
                   roomState: ROOM_STATES.JOINED,
                   roomName: null,
                   roomContextUrls: { location: "http://example.com/" }
                 });

                clock.tick(loop.standaloneRoomViews.StandaloneRoomInfoArea.RENDER_WAITING_DELAY);

                expect(view.getDOMNode().querySelector(".standalone-info-bar-context"))
                  .not.eql(null);
              });

              // XXX akita-sidebar
              it.skip("should display a standalone-info-bar-context area after a wait when in the " +
                "JOINED state and roomName and roomContextUrls are null",
                function() {
                  activeRoomStore.setStoreState({
                     roomState: ROOM_STATES.JOINED,
                     roomName: null,
                     roomContextUrls: null
                   });

                  clock.tick(loop.standaloneRoomViews.StandaloneRoomInfoArea.RENDER_WAITING_DELAY);

                  expect(view.getDOMNode().querySelector(".standalone-info-bar-context"))
                    .not.eql(null);
                });

        // XXX akita-sidebar
        it.skip("should enable clicking of context link when url checks against url protocol whitelist",
          function() {
            activeRoomStore.setStoreState({
              roomState: ROOM_STATES.JOINED,
              roomName: "WhitelistTestRoom",
              roomContextUrls: [{
                description: "http",
                location: "http://fakeurl.com/"
              }]
            });

            clock.tick(loop.standaloneRoomViews.StandaloneRoomInfoArea.RENDER_WAITING_DELAY);

            expect(view.getDOMNode().querySelector(".room-notification-context a").getAttribute("href"))
              .eql("http://fakeurl.com/");
          });

        // XXX akita-sidebar
        it.skip("should not enable clicking of context link when url fails against url protocol whitelist",
          function() {
            activeRoomStore.setStoreState({
              roomState: ROOM_STATES.JOINED,
              roomName: "WhitelistTestRoom",
              roomContextUrls: [{
                description: "nonhttp",
                location: "somethingelse://fakeurl.com"
              }]
            });

            clock.tick(loop.standaloneRoomViews.StandaloneRoomInfoArea.RENDER_WAITING_DELAY);

            expect(view.getDOMNode().querySelector(".room-notification-context a").getAttribute("href"))
              .eql(null);
          });

        // XXX akita-sidebar
        it.skip("should not display an message immediately in the SESSION_CONNECTED state",
          function() {
            activeRoomStore.setStoreState({ roomState: ROOM_STATES.SESSION_CONNECTED });

            expect(view.getDOMNode().querySelector(".room-notification-header h2"))
              .eql(null);
          });

        // XXX akita-sidebar
        it.skip("should display an empty room message after a wait when in the SESSION_CONNECTED state",
          function() {
            activeRoomStore.setStoreState({ roomState: ROOM_STATES.SESSION_CONNECTED });
            clock.tick(loop.standaloneRoomViews.StandaloneRoomInfoArea.RENDER_WAITING_DELAY);

            expect(view.getDOMNode().querySelector(".room-notification-header h2"))
              .not.eql(null);
            expect(view.getDOMNode().querySelector(".room-notification-header h2").textContent)
              .eql("rooms_only_occupant_label2");
          });

        // XXX akita-sidebar
        it.skip("should not display an message immediately in the HAS_PARTICIPANTS state",
          function() {
            activeRoomStore.setStoreState({ roomState: ROOM_STATES.HAS_PARTICIPANTS });

            expect(view.getDOMNode().querySelector(".room-notification-header h2"))
              .eql(null);
          });

        // XXX akita-sidebar
        it.skip("should not display an empty room message even after a wait when in the HAS_PARTICIPANTS state",
          function() {
            activeRoomStore.setStoreState({ roomState: ROOM_STATES.HAS_PARTICIPANTS });
            clock.tick(loop.standaloneRoomViews.StandaloneRoomInfoArea.RENDER_WAITING_DELAY);

            expect(view.getDOMNode().querySelector(".room-notification-header h2"))
              .eql(null);
          });

        // XXX akita-sidebar
        it.skip("should display an empty room message when the room owner left the room ",
          function() {
            activeRoomStore.setStoreState({
              roomState: ROOM_STATES.SESSION_CONNECTED,
              remotePeerDisconnected: true
            });
            clock.tick(loop.standaloneRoomViews.StandaloneRoomInfoArea.RENDER_WAITING_DELAY);

            expect(view.getDOMNode().querySelector(".room-notification-header h2").textContent)
              .eql("room_owner_left_label");
          });
      });

      describe("Prompt media message", function() {
        // XXX akita-sidebar
        it.skip("should display a prompt for user media on MEDIA_WAIT",
          function() {
            activeRoomStore.setStoreState({ roomState: ROOM_STATES.MEDIA_WAIT });

            expect(view.getDOMNode().querySelector(".prompt-media-message"))
              .not.eql(null);
          });
      });

      describe("Full room message", function() {
        // XXX akita-sidebar
        it.skip("should display a full room message on FULL",
          function() {
            activeRoomStore.setStoreState({ roomState: ROOM_STATES.FULL });

            expect(view.getDOMNode().querySelector(".full-room-message"))
              .not.eql(null);
          });
      });

      describe("Failed room message", function() {
        // XXX akita-sidebar
        it.skip("should display the StandaloneRoomFailureView", function() {
          activeRoomStore.setStoreState({ roomState: ROOM_STATES.FAILED });

          TestUtils.findRenderedComponentWithType(view,
            loop.standaloneRoomViews.StandaloneRoomFailureView);
        });

        // XXX akita-sidebar
        it.skip("should display ICE failure message", function() {
          activeRoomStore.setStoreState({
            roomState: ROOM_STATES.FAILED,
            failureReason: FAILURE_DETAILS.ICE_FAILED
          });

          var ice_failed_message = view.getDOMNode().querySelector(".failed-room-message").textContent;
          expect(ice_failed_message).eql("rooms_ice_failure_message");
          expect(view.getDOMNode().querySelector(".btn-info")).not.eql(null);
        });
      });

      describe("Ended session message", function() {
        // XXX akita-sidebar
        it.skip("should display an ended session message and a rejoin button", function() {
          activeRoomStore.setStoreState({ roomState: ROOM_STATES.ENDED });

          expect(view.getDOMNode().querySelector(".room-notification-header h2"))
            .not.eql(null);
          expect(view.getDOMNode().querySelector(".room-notification-header h2").textContent)
            .eql("room_user_left_label");
          expect(view.getDOMNode().querySelector(".btn-join"))
            .not.eql(null);
        });

        // XXX akita-sidebar
        it.skip("should display a promote firefox message", function() {
          view = mountTestComponent({
            isFirefox: false
          });

          activeRoomStore.setStoreState({ roomState: ROOM_STATES.ENDED });

          expect(view.getDOMNode().querySelector(".promote-firefox"))
            .not.eql(null);
        });
      });

      describe("Join button", function() {
        function getJoinButton(elem) {
          return elem.getDOMNode().querySelector(".btn-join");
        }

        // XXX akita-sidebar
        it.skip("should render the Join button when room isn't active", function() {
          activeRoomStore.setStoreState({ roomState: ROOM_STATES.READY });

          expect(getJoinButton(view)).not.eql(null);
        });

        // XXX akita-sidebar
        it.skip("should not render the Join button when room is active",
          function() {
            activeRoomStore.setStoreState({ roomState: ROOM_STATES.SESSION_CONNECTED });

            expect(getJoinButton(view)).eql(null);
          });

        // XXX akita-sidebar
        it.skip("should join the room when clicking the Join button", function() {
          activeRoomStore.setStoreState({ roomState: ROOM_STATES.READY });

          TestUtils.Simulate.click(getJoinButton(view));

          sinon.assert.calledOnce(dispatch);
          sinon.assert.calledWithExactly(dispatch, new sharedActions.JoinRoom());
        });
      });

      describe("Screen sharing paused", function() {
        // XXX akita-sidebar
        it.skip("should display paused view if the screen share has been stopped", function() {
          activeRoomStore.setStoreState({
            roomState: ROOM_STATES.HAS_PARTICIPANTS,
            streamPaused: true
          });

          var element = view.getDOMNode().querySelector(".remote-stream-paused h1");
          expect(element).not.eql(null);
          expect(element.textContent).eql("rooms_screen_share_paused");
        });
      });

      describe("screenShare", function() {
        // XXX akita-sidebar
        it.skip("should show a loading screen if receivingScreenShare is true " +
           "but no screenShareMediaElement is present", function() {
          view.setState({
            "receivingScreenShare": true,
            "screenShareMediaElement": null
          });

          expect(view.getDOMNode().querySelector(".screen .loading-stream"))
              .not.eql(null);
        });

        // XXX akita-sidebar
        it.skip("should not show loading screen if receivingScreenShare is false " +
           "and screenShareMediaElement is null", function() {
             view.setState({
               "receivingScreenShare": false,
               "screenShareMediaElement": null
             });

             expect(view.getDOMNode().querySelector(".screen .loading-stream"))
                 .eql(null);
        });

        // XXX akita-sidebar
        it.skip("should not show a loading screen if screenShareMediaElement is set",
           function() {
             var videoElement = document.createElement("video");

             view.setState({
               "receivingScreenShare": true,
               "screenShareMediaElement": videoElement
             });

             expect(view.getDOMNode().querySelector(".screen .loading-stream"))
                 .eql(null);
        });

        // XXX akita-sidebar
        it.skip("should not show a loading screen if receivingScreenShare is true" +
           "and streamPaused is true", function() {
             view.setState({
               "receivingScreenShare": true,
               "streamPaused": true
             });

             expect(view.getDOMNode().querySelector(".screen .loading-stream"))
                 .eql(null);
        });
      });

      describe("Participants", function() {
        var videoElement;

        beforeEach(function() {
          videoElement = document.createElement("video");
        });

        // XXX akita-sidebar
        it.skip("should render local video when video_muted is false", function() {
          activeRoomStore.setStoreState({
            roomState: ROOM_STATES.HAS_PARTICIPANTS,
            localSrcMediaElement: videoElement,
            localVideoEnabled: true,
            videoMuted: false
          });

          expect(view.getDOMNode().querySelector(".local video")).not.eql(null);
        });

        // XXX akita-sidebar
        it.skip("should not render a local avatar when video_muted is false", function() {
          activeRoomStore.setStoreState({
            localVideoEnabled: true,
            roomState: ROOM_STATES.HAS_PARTICIPANTS,
            videoMuted: false
          });

          expect(view.getDOMNode().querySelector(".local .avatar")).eql(null);
        });

        // XXX akita-sidebar
        it.skip("should render a local avatar when local video is not enabled", function() {
          activeRoomStore.setStoreState({
            localVideoEnabled: false,
            roomState: ROOM_STATES.HAS_PARTICIPANTS,
            videoMuted: false
          });

          expect(view.getDOMNode().querySelector(".local .avatar")).not.eql(null);
        });

        // XXX akita-sidebar
        it.skip("should render local loading screen when no srcMediaElement",
           function() {
             activeRoomStore.setStoreState({
               localVideoEnabled: true,
               roomState: ROOM_STATES.MEDIA_WAIT,
               remoteSrcMediaElement: null
             });

             expect(view.getDOMNode().querySelector(".local .loading-stream"))
                  .not.eql(null);
        });

        // XXX akita-sidebar
        it.skip("should not render local loading screen when srcMediaElement is set",
           function() {
             activeRoomStore.setStoreState({
               roomState: ROOM_STATES.MEDIA_WAIT,
               localSrcMediaElement: videoElement
             });

             expect(view.getDOMNode().querySelector(".local .loading-stream"))
                  .eql(null);
        });

        // XXX akita-sidebar
        it.skip("should not render remote loading screen when srcMediaElement is set",
           function() {
             activeRoomStore.setStoreState({
               roomState: ROOM_STATES.HAS_PARTICIPANTS,
               remoteSrcMediaElement: videoElement
             });

             expect(view.getDOMNode().querySelector(".remote .loading-stream"))
                  .eql(null);
        });

        // XXX akita-sidebar
        it.skip("should render remote video when the room HAS_PARTICIPANTS and" +
          " remoteVideoEnabled is true", function() {
          activeRoomStore.setStoreState({
            roomState: ROOM_STATES.HAS_PARTICIPANTS,
            remoteSrcMediaElement: videoElement,
            remoteVideoEnabled: true
          });

          expect(view.getDOMNode().querySelector(".remote video")).not.eql(null);
        });

        // XXX akita-sidebar
        it.skip("should render remote video when the room HAS_PARTICIPANTS and" +
          " remoteVideoEnabled is true", function() {
          activeRoomStore.setStoreState({
            roomState: ROOM_STATES.HAS_PARTICIPANTS,
            remoteSrcMediaElement: videoElement,
            remoteVideoEnabled: true
          });

          expect(view.getDOMNode().querySelector(".remote video")).not.eql(null);
        });

        // XXX akita-sidebar
        it.skip("should not render remote video when the room HAS_PARTICIPANTS," +
          " remoteVideoEnabled is false, and mediaConnected is true", function() {
          activeRoomStore.setStoreState({
            roomState: ROOM_STATES.HAS_PARTICIPANTS,
            remoteSrcMediaElement: videoElement,
            mediaConnected: true,
            remoteVideoEnabled: false
          });

          expect(view.getDOMNode().querySelector(".remote video")).eql(null);
        });

        // XXX akita-sidebar
        it.skip("should render remote video when the room HAS_PARTICIPANTS," +
          " and both remoteVideoEnabled and mediaConnected are false", function() {
          activeRoomStore.setStoreState({
            roomState: ROOM_STATES.HAS_PARTICIPANTS,
            remoteSrcMediaElement: videoElement,
            mediaConnected: false,
            remoteVideoEnabled: false
          });

          expect(view.getDOMNode().querySelector(".remote video")).not.eql(null);
        });

        // XXX akita-sidebar
        it.skip("should not render a remote avatar when the room is in MEDIA_WAIT", function() {
          activeRoomStore.setStoreState({
            roomState: ROOM_STATES.MEDIA_WAIT,
            remoteSrcMediaElement: videoElement,
            remoteVideoEnabled: false
          });

          expect(view.getDOMNode().querySelector(".remote .avatar")).eql(null);
        });

        // XXX akita-sidebar
        it.skip("should not render a remote avatar when the room is CLOSING and" +
          " remoteVideoEnabled is false", function() {
          activeRoomStore.setStoreState({
            roomState: ROOM_STATES.CLOSING,
            remoteSrcMediaElement: videoElement,
            remoteVideoEnabled: false
          });

          expect(view.getDOMNode().querySelector(".remote .avatar")).eql(null);
        });

        // XXX akita-sidebar
        it.skip("should render a remote avatar when the room HAS_PARTICIPANTS, " +
          "remoteVideoEnabled is false, and mediaConnected is true", function() {
          activeRoomStore.setStoreState({
            roomState: ROOM_STATES.HAS_PARTICIPANTS,
            remoteSrcMediaElement: videoElement,
            remoteVideoEnabled: false,
            mediaConnected: true
          });

          expect(view.getDOMNode().querySelector(".remote .avatar")).not.eql(null);
        });

        // XXX akita-sidebar
        it.skip("should render a remote avatar when the room HAS_PARTICIPANTS, " +
          "remoteSrcMediaElement is false, mediaConnected is true", function() {
          activeRoomStore.setStoreState({
            roomState: ROOM_STATES.HAS_PARTICIPANTS,
            remoteSrcMediaElement: null,
            remoteVideoEnabled: false,
            mediaConnected: true
          });

          expect(view.getDOMNode().querySelector(".remote .avatar")).not.eql(null);
        });
      });

      describe("Leave button", function() {
        function getLeaveButton(elem) {
          return elem.getDOMNode().querySelector(".btn-hangup");
        }

        // XXX akita-sidebar
        it.skip("should remove the Leave button when the room state is READY",
          function() {
            activeRoomStore.setStoreState({ roomState: ROOM_STATES.READY });

            expect(getLeaveButton(view)).eql(null);
          });

        // XXX akita-sidebar
        it.skip("should remove the Leave button when the room state is FAILED",
          function() {
            activeRoomStore.setStoreState({ roomState: ROOM_STATES.FAILED });

            expect(getLeaveButton(view)).eql(null);
          });

        // XXX akita-sidebar
        it.skip("should remove the Leave button when the room state is FULL",
          function() {
            activeRoomStore.setStoreState({ roomState: ROOM_STATES.FULL });

            expect(getLeaveButton(view)).eql(null);
          });

        // XXX akita-sidebar
        it.skip("should display the Leave button when the room state is SESSION_CONNECTED",
          function() {
            activeRoomStore.setStoreState({ roomState: ROOM_STATES.SESSION_CONNECTED });

            expect(getLeaveButton(view)).not.eql(null);
          });

        // XXX akita-sidebar
        it.skip("should display the Leave button when the room state is JOINED",
          function() {
            activeRoomStore.setStoreState({ roomState: ROOM_STATES.JOINED });

            expect(getLeaveButton(view)).not.eql(null);
          });

        // XXX akita-sidebar
        it.skip("should display the Leave button when the room state is HAS_PARTICIPANTS",
          function() {
            activeRoomStore.setStoreState({ roomState: ROOM_STATES.HAS_PARTICIPANTS });

            expect(getLeaveButton(view)).not.eql(null);
          });

        // XXX akita-sidebar
        it.skip("should leave the room when clicking the Leave button", function() {
          activeRoomStore.setStoreState({ roomState: ROOM_STATES.HAS_PARTICIPANTS });

          TestUtils.Simulate.click(getLeaveButton(view));

          sinon.assert.calledOnce(dispatch);
          sinon.assert.calledWithExactly(dispatch, new sharedActions.LeaveRoom());
        });
      });

      describe("Mute", function() {
        // XXX akita-sidebar
        it.skip("should render a local avatar if video is muted",
          function() {
            activeRoomStore.setStoreState({
              roomState: ROOM_STATES.SESSION_CONNECTED,
              videoMuted: true
            });

            expect(view.getDOMNode().querySelector(".local .avatar"))
              .not.eql(null);
          });

        // XXX akita-sidebar
        it.skip("should render a local avatar if the room HAS_PARTICIPANTS and" +
          " .videoMuted is true",
          function() {
            activeRoomStore.setStoreState({
              roomState: ROOM_STATES.HAS_PARTICIPANTS,
              videoMuted: true
            });

            expect(view.getDOMNode().querySelector(".local .avatar")).not.eql(
              null);
          });
      });
    });
  });

  describe("StandaloneRoomControllerView", function() {
    function mountTestComponent() {
      return TestUtils.renderIntoDocument(
        React.createElement(
          loop.standaloneRoomViews.StandaloneRoomControllerView, {
            cursorStore: remoteCursorStore,
            dispatcher: dispatcher,
            isFirefox: true
          }
        )
      );
    }

    beforeEach(function() {
      activeRoomStore.setStoreState({ roomName: "fakeName", roomToken: "fakeToken" });
    });

    // XXX akita-sidebar
    it.skip("should not display anything if it is not known if Firefox can handle the room", function() {
      activeRoomStore.setStoreState({
        userAgentHandlesRoom: undefined
      });

      view = mountTestComponent();

      expect(view.getDOMNode()).eql(null);
    });

    // XXX akita-sidebar
    it.skip("should render StandaloneHandleUserAgentView if Firefox can handle the room", function() {
      activeRoomStore.setStoreState({
        userAgentHandlesRoom: true
      });

      view = mountTestComponent();

      TestUtils.findRenderedComponentWithType(view,
        loop.standaloneRoomViews.StandaloneHandleUserAgentView);
    });

    // XXX akita-sidebar
    it.skip("should render StandaloneRoomView if Firefox cannot handle the room", function() {
      activeRoomStore.setStoreState({
        userAgentHandlesRoom: false
      });

      view = mountTestComponent();

      TestUtils.findRenderedComponentWithType(view,
        loop.standaloneRoomViews.StandaloneRoomView);
    });
  });
});
