/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

describe("loop.TableOfContents", () => {
  "use strict";

  let { expect } = chai;
  let { TestUtils } = React.addons;
  let sharedActions = loop.shared.actions;

  let sandbox;
  let dispatcher, activeRoomStore, fakeDataDriver, participantStore, textChatStore, now;

  beforeEach(() => {
    sandbox = LoopMochaUtils.createSandbox();

    dispatcher = new loop.Dispatcher();
    sandbox.stub(dispatcher, "dispatch");
    // stubs for loop.subscribe events
    window.addMessageListener = sandbox.stub();

    fakeDataDriver = {
      updateCurrentParticipant: sinon.stub(),
      updateCurrentPresence: sinon.stub()
    };

    participantStore = new loop.store.ParticipantStore(dispatcher, {
      dataDriver: fakeDataDriver
    });

    activeRoomStore = new loop.store.ActiveRoomStore(dispatcher, {
      sdkDriver: {}
    });

    textChatStore = new loop.store.TextChatStore(dispatcher, {
      dataDriver: fakeDataDriver,
      sdkDriver: {}
    });

    loop.store.StoreMixin.register({
      textChatStore
    });

    now = Date.now();
    sandbox.stub(Date, "now", () => now);

    sandbox.stub(document.mozL10n ? document.mozL10n : navigator.mozL10n, "get", function(x) {
      return x;
    });
  });

  afterEach(() => {
    sandbox.restore();
    LoopMochaUtils.restore();
  });

  describe("ToC.RoomPresenceView", () => {
    let view, participant;

    function mountTestComponent() {
      participantStore.updatedParticipant({
        userId: "fakeID",
        participantName: participant.participantName
      });

      participantStore.updatedPresence({
        userId: "fakeID",
        pingedAgo: participant.pingedAgo,
        isHere: participant.isHere
      });

      view = TestUtils.renderIntoDocument(
        React.createElement(loop.shared.toc.RoomPresenceView, {
          participantStore: participantStore
        }));
    }

    beforeEach(function() {
      participant = {
        participantName: "fakeName",
        pingedAgo: 1000,
        isHere: true
      };
    });

    it("should render the participant bubble", () => {
      mountTestComponent();
      let activeParticipants = ReactDOM.findDOMNode(view).querySelectorAll(".room-user");
      expect(activeParticipants.length).eql(1);

      let participantName = activeParticipants[0].querySelector("span");
      expect(participantName.textContent).eql("F");
    });

    it("should no render bubbles if there is no online users", () => {
      participant.isHere = false;
      mountTestComponent();
      let activeParticipants = ReactDOM.findDOMNode(view).querySelectorAll(".room-user");
      expect(activeParticipants.length).eql(0);
    });

    it("should update on participant store change", () => {
      mountTestComponent();
      participantStore.updatedPresence({
        userId: "fakeID",
        pingedAgo: 0,
        isHere: false
      });

      let activeParticipants = ReactDOM.findDOMNode(view).querySelectorAll(".room-user");
      expect(activeParticipants.length).eql(0);
    });
  });

  describe("ToC.AddUrlPanelView", () => {
    let view, addURLStub;

    function mountTestComponent() {
      return TestUtils.renderIntoDocument(
        React.createElement(loop.shared.toc.AddUrlPanelView, {
          dispatcher: dispatcher,
          handleAddUrlClick: addURLStub
        }));
    }

    beforeEach(() => {
      addURLStub = sandbox.stub();
      sandbox.stub(loop.shared.utils, "getPageMetadata", args => {
        if (args === "http://fakeurl.com") {
          return Promise.resolve();
        }

        return {
          then: function() {
            return {
              catch: function(cb) {
                cb();
              }
            };
          }
        };
      });
      view = mountTestComponent();
    });

    it("should do nothing when the input is empty", () => {
      var button = ReactDOM.findDOMNode(view).querySelector("button");
      TestUtils.Simulate.click(button);

      sinon.assert.notCalled(dispatcher.dispatch);
    });

    it("should dispatch a `showSnackbar` action if url isn't valid", () => {
      var input = view.refs.siteUrl;
      input.value = "invalidurl";
      TestUtils.Simulate.change(input);
      var button = ReactDOM.findDOMNode(view).querySelector("button");
      TestUtils.Simulate.click(button);

      sinon.assert.called(dispatcher.dispatch);
      sinon.assert.calledWithExactly(dispatcher.dispatch,
        new sharedActions.ShowSnackbar({
          label: "snackbar_page_not_added"
        }));
    });

    it("should reset button and input field if url isn't valid", () => {
      var input = view.refs.siteUrl;
      input.value = "invalidurl";
      TestUtils.Simulate.change(input);
      var button = ReactDOM.findDOMNode(view).querySelector("button");
      TestUtils.Simulate.click(button);

      expect(button.textContent).to.eql("Add site");
      expect(button.disabled).to.eql(false);
    });
  });

  describe("ToC.PageView", () => {
    let view;

    function mountTestComponent() {
      return TestUtils.renderIntoDocument(
        React.createElement(loop.shared.toc.PageView, {
          dispatcher: dispatcher,
          page: {
            id: "fakeId",
            title: "fakeTitle",
            thumbnail_img: "fakeImg",
            url: "http://www.invalidurl.com",
            userName: "Cool name"
          }
        }));
    }

    beforeEach(() => {
      view = mountTestComponent();
    });

    it("should dispatch a `DeletePage` action when clicking the delete button", () => {
      var button = ReactDOM.findDOMNode(view).querySelector("button.tile-delete-btn");
      TestUtils.Simulate.click(button);

      sinon.assert.called(dispatcher.dispatch);
      sinon.assert.calledWithExactly(dispatcher.dispatch,
        new sharedActions.DeletePage({
          pageId: "fakeId"
        }));
    });
  });

  describe("ToC.SidebarView", () => {
    let view, hasParticipants, clock;

    function mountTestComponent() {
      return TestUtils.renderIntoDocument(
        React.createElement(loop.shared.toc.SidebarView, {
          activeRoomStore: activeRoomStore,
          audio: { enabled: true, visible: true },
          dispatcher: dispatcher,
          isFirefox: true,
          leaveRoom: sandbox.stub(),
          participantStore: participantStore,
          video: { enabled: true, visible: true }
        }));
    }

    beforeEach(() => {
      sandbox.stub(loop.shared.mixins.AudioMixin, "play");
      clock = sandbox.useFakeTimers();
      view = mountTestComponent();
      hasParticipants = false;
      participantStore.updatedParticipant({
        userId: "fakeID",
        participantName: "Cool Name"
      });
      sandbox.stub(participantStore, "_hasOnlineParticipants", () => hasParticipants);
    });

    afterEach(() => {
      clock.restore();
    });

    it("should only render the text chat when room has no participants", () => {
      view = mountTestComponent();
      expect(ReactDOM.findDOMNode(view).querySelector(".room-controls-wrapper")).eql(null);
      expect(ReactDOM.findDOMNode(view).querySelector(".text-chat-view")).not.eql(null);
    });

    it("should slide down room controls when someone joins the room", () => {
      hasParticipants = true;
      participantStore.updatedPresence({
        userId: "fakeID",
        pingedAgo: 1000,
        isHere: true
      });

      clock.tick(200);

      let controls = ReactDOM.findDOMNode(view).querySelector(".room-controls-wrapper");
      expect(controls.classList.contains("rooms-controls-open")).eql(true);
    });

    it("should slide up room controls when guest leaves the room", () => {
      hasParticipants = false;
      participantStore.updatedPresence({
        userId: "fakeID",
        pingedAgo: 15000,
        isHere: false
      });
      clock.tick(350);

      let controls = ReactDOM.findDOMNode(view).querySelector(".room-controls-wrapper");
      expect(controls).eql(null);
    });
  });

  describe("ToC.RoomControlsView", () => {
    let view;

    function mountTestComponent(extraProps) {
      return TestUtils.renderIntoDocument(
        React.createElement(loop.shared.toc.RoomControlsView, _.extend({
          audio: { enabled: true, visible: true },
          dispatcher: dispatcher,
          hasParticipants: false,
          participantStore: participantStore,
          screen: { enabled: true },
          video: { enabled: true, visible: true }
        }, extraProps)));
    }

    afterEach(() => {
      participantStore.setStoreState(participantStore.getInitialStoreState());
    });

    it("should not render the room controls if room hasn't participants", () => {
      view = mountTestComponent();
      expect(ReactDOM.findDOMNode(view)).eql(null);
    });

    it("should render the room controls if room has participants", () => {
      view = mountTestComponent({ hasParticipants: true });
      expect(ReactDOM.findDOMNode(view)).not.eql(null);
    });
  });
});
