/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

describe("loop.sidebar", function() {
  "use strict";

  var expect = chai.expect;
  var TestUtils = React.addons.TestUtils;
  var fakeWindow, sandbox, setLoopPrefStub, dispatcher, requestStubs,
    activeRoomStore, textChatStore;
  var ROOM_STATES = loop.store.ROOM_STATES;

  beforeEach(function() {
    sandbox = LoopMochaUtils.createSandbox();
    setLoopPrefStub = sandbox.stub();

    LoopMochaUtils.stubLoopRequest(requestStubs = {
      GetDoNotDisturb: function() { return true; },
      GetAllStrings: function() {
        return JSON.stringify({ textContent: "fakeText" });
      },
      GetLocale: function() {
        return "en-US";
      },
      SetLoopPref: setLoopPrefStub,
      GetLoopPref: function(prefName) {
        switch (prefName) {
          case "debug.sdk":
          case "debug.dispatcher":
            return false;
          default:
            return "http://fake";
        }
      },
      GetAllConstants: function() {
        return {
          LOOP_SESSION_TYPE: {
            GUEST: 1,
            FXA: 2
          },
          LOOP_MAU_TYPE: {
            OPEN_PANEL: 0,
            OPEN_CONVERSATION: 1,
            ROOM_OPEN: 2,
            ROOM_SHARE: 3,
            ROOM_DELETE: 4
          }
        };
      },
      EnsureRegistered: sinon.stub(),
      GetAppVersionInfo: function() {
        return {
          version: "42",
          channel: "test",
          platform: "test"
        };
      },
      GetAudioBlob: sinon.spy(function() {
        return new Blob([new ArrayBuffer(10)], { type: "audio/ogg" });
      }),
      GetSelectedTabMetadata: function() {
        return {};
      },
      TelemetryAddValue: sinon.stub()
    });

    fakeWindow = {
      close: sinon.stub(),
      document: {},
      addEventListener: function() {},
      removeEventListener: function() {}
    };
    loop.shared.mixins.setRootObject(fakeWindow);

    // XXX These stubs should be hoisted in a common file
    // Bug 1040968
    sandbox.stub(document.mozL10n, "get", function(x) {
      return x;
    });
    document.mozL10n.initialize({
      getStrings: function() { return JSON.stringify({ textContent: "fakeText" }); },
      locale: "en_US"
    });

    dispatcher = new loop.Dispatcher();
    sinon.stub(dispatcher, "dispatch");
  });

  afterEach(function() {
    loop.shared.mixins.setRootObject(window);
    loop.store.StoreMixin.clearRegisteredStores();
    sandbox.restore();
    LoopMochaUtils.restore();
  });

  describe("#init", function() {
    var OTRestore;
    beforeEach(function() {
      sandbox.stub(ReactDOM, "render");
      sandbox.stub(document.mozL10n, "initialize");

      sandbox.stub(loop.Dispatcher.prototype, "dispatch");

      sandbox.stub(loop.shared.utils,
        "locationData").returns({
          hash: "#42",
          pathname: "/"
        });

      OTRestore = window.OT;
      window.OT = {
        overrideGuidStorage: sinon.stub()
      };
    });

    afterEach(function() {
      window.OT = OTRestore;
    });

    it("should initialize L10n", function() {
      loop.sidebar.init();

      sinon.assert.calledOnce(document.mozL10n.initialize);
      sinon.assert.calledWith(document.mozL10n.initialize, sinon.match({ locale: "en-US" }));
    });

    it("should create the SidebarControllerView", function() {
      loop.sidebar.init();

      sinon.assert.calledOnce(ReactDOM.render);
      sinon.assert.calledWith(ReactDOM.render,
        sinon.match(function(value) {
          return TestUtils.isCompositeComponentElement(value,
            loop.sidebar.SidebarControllerView);
      }));
    });

    it("should trigger a setupWindowData action", function() {
      loop.sidebar.init();

      sinon.assert.calledWithExactly(loop.Dispatcher.prototype.dispatch,
        new loop.shared.actions.SetupWindowData({
          roomToken: "42"
        }));
    });

    it("should log a telemetry event when opening the sidebar", function() {
      var constants = requestStubs.GetAllConstants();
      loop.sidebar.init();

      sinon.assert.calledOnce(requestStubs["TelemetryAddValue"]);
      sinon.assert.calledWithExactly(requestStubs["TelemetryAddValue"],
        "LOOP_ACTIVITY_COUNTER", constants.LOOP_MAU_TYPE.OPEN_CONVERSATION);
    });
  });

  describe("SidebarControllerView", function() {
    var ccView;

    function mountTestComponent() {
      return TestUtils.renderIntoDocument(
        React.createElement(loop.sidebar.SidebarControllerView, {
          dispatcher: dispatcher
        }));
    }

    beforeEach(function() {
      activeRoomStore = new loop.store.ActiveRoomStore(dispatcher, {
        mozLoop: {},
        sdkDriver: {}
      });

      textChatStore = new loop.store.TextChatStore(dispatcher, {
        dataDriver: {}
      });

      loop.store.StoreMixin.register({
        activeRoomStore: activeRoomStore,
        textChatStore: textChatStore
      });
    });

    afterEach(function() {
      ccView = undefined;
    });

    it("should not render any view if room state is equals to GATHER", function() {
      activeRoomStore.setStoreState({ roomState: ROOM_STATES.GATHER });

      ccView = mountTestComponent();

      expect(ReactDOM.findDOMNode(ccView)).eql(null);
    });

    it("should display the DesktopSidebarView", function() {
      activeRoomStore.setStoreState({ roomState: ROOM_STATES.READY });

      ccView = mountTestComponent();

      var desktopSidebarView = TestUtils.findRenderedComponentWithType(ccView,
        loop.sidebar.DesktopSidebarView);

      expect(desktopSidebarView).to.not.eql(null);
    });
  });

  describe("DesktopSidebarView", function() {
    var ccView;

    function mountTestComponent() {
      return TestUtils.renderIntoDocument(
        React.createElement(loop.sidebar.DesktopSidebarView, {
          dispatcher: dispatcher
        }));
    }

    beforeEach(function() {
      activeRoomStore = new loop.store.ActiveRoomStore(dispatcher, {
        mozLoop: {},
        sdkDriver: {}
      });

      textChatStore = new loop.store.TextChatStore(dispatcher, {
        dataDriver: {}
      });

      loop.store.StoreMixin.register({
        activeRoomStore: activeRoomStore,
        textChatStore: textChatStore
      });

      activeRoomStore.setStoreState({ roomState: ROOM_STATES.READY });
    });

    it("should render the SidebarView", function() {
      ccView = mountTestComponent();

      var sidebarView = TestUtils.findRenderedComponentWithType(ccView,
        loop.shared.toc.SidebarView);

      expect(sidebarView).to.not.eql(null);
    });

    it("#leaveRoom", function() {
      ccView = mountTestComponent();
      ccView.leaveRoom();

      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWithExactly(dispatcher.dispatch,
        new loop.shared.actions.LeaveRoom());
    });
  });
});
