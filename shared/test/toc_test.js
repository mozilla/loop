/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

describe("loop.TableOfContents", () => {
  "use strict";

  let { expect } = chai;
  let { TestUtils } = React.addons;

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
});
