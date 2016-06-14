/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

describe("loop.TableOfContents", () => {
  "use strict";

  let { expect } = chai;
  let { TestUtils } = React.addons;
  let sharedActions = loop.shared.actions;

  let sandbox;
  let dispatcher, fakeDataDriver, participantStore, now;

  beforeEach(() => {
    sandbox = LoopMochaUtils.createSandbox();

    dispatcher = new loop.Dispatcher();
    sandbox.stub(dispatcher, "dispatch");

    fakeDataDriver = {
      updateCurrentParticipant: sinon.stub(),
      updateCurrentPresence: sinon.stub()
    };

    participantStore = new loop.store.ParticipantStore(dispatcher, {
      dataDriver: fakeDataDriver
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

    it("should dispatch a `showSnackbar` action if url is valid", () => {
      var input = view.refs.siteUrl;
      input.value = "http://fakeurl.com";
      TestUtils.Simulate.change(input);
      var button = ReactDOM.findDOMNode(view).querySelector("button");
      TestUtils.Simulate.click(button);

      sinon.assert.called(dispatcher.dispatch);
      sinon.assert.calledWithExactly(dispatcher.dispatch,
        new sharedActions.ShowSnackbar({
          label: "snackbar_page_added"
        }));
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
});
