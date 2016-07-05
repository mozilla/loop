/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

describe("loop.webapp", function() {
  "use strict";

  var expect = chai.expect;
  var TestUtils = React.addons.TestUtils;
  var sharedActions = loop.shared.actions;
  var sharedUtils = loop.shared.utils,
      sandbox,
      dispatcher,
      mozL10nGet,
      remoteCursorStore,
      requestStubs;

  beforeEach(function() {
    function fakeGetPref(prefName) {
        console.error("in fakeGetPref");
        switch (prefName) {
          case "debug.sdk":
          case "debug.dispatcher":
            return false;
          case "username":
            return "Fake Username";
          default:
            return "http://fake";
        }
    }

    sandbox = LoopMochaUtils.createSandbox();
    LoopMochaUtils.stubLoopRequest(requestStubs = {
      GetLoopPref: sinon.spy(fakeGetPref),
      SetLoopPref: sinon.stub()
    });

    sandbox.stub(localStorage, "getItem", fakeGetPref);
    sandbox.stub(loop.shared.utils, "isDesktop").returns(false);

    dispatcher = new loop.Dispatcher();

    mozL10nGet = sandbox.stub(navigator.mozL10n, "get", function(x) {
      return "translated:" + x;
    });

    remoteCursorStore = new loop.store.RemoteCursorStore(dispatcher, {
      sdkDriver: {}
    });

    loop.store.StoreMixin.register({ remoteCursorStore: remoteCursorStore });
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe("#init", function() {
    var loopConfigRestore;

    beforeEach(function() {
      sandbox.stub(ReactDOM, "render");
      loopConfigRestore = loop.config;
      loop.config = {
        serverUrl: "http://fake.invalid"
      };
      sandbox.stub(loop.Dispatcher.prototype, "dispatch");
    });

    afterEach(function() {
      loop.config = loopConfigRestore;
    });

    it("should create the WebappRootView", function() {
      loop.webapp.init();

      sinon.assert.calledOnce(ReactDOM.render);
      sinon.assert.calledWith(ReactDOM.render,
        sinon.match(function(value) {
          return TestUtils.isCompositeComponentElement(value,
            loop.webapp.WebappRootView);
      }));
    });

    it("should dispatch a ExtractTokenInfo action with the path and hash",
      function() {
        sandbox.stub(sharedUtils, "locationData").returns({
          hash: "#fakeKey",
          pathname: "/c/faketoken"
        });

      loop.webapp.init();

      sinon.assert.calledWithExactly(loop.Dispatcher.prototype.dispatch,
        new sharedActions.ExtractTokenInfo({
          windowPath: "/c/faketoken",
          windowHash: "#fakeKey"
        }));
    });

    it.skip("should call SetOwnDisplayName with the username returned by GetLoopPref if set",
      function() {
        loop.webapp.init();

        // XXX akita for some reason the stub isn't being called at all.  It
        // kinda looks like SyncThenable isn't being (properly?) installed
        // over the global Promise object, or else it has some internal bug.
        sinon.assert.calledOnce(requestStubs.GetLoopPref);
        sinon.assert.calledWithExactly(requestStubs.GetLoopPref, "username");
        sinon.assert.calledWithExactly(loop.Dispatcher.prototype.dispatch,
          new loop.shared.actions.SetOwnDisplayName(
            { displayName: "Fake Username" }));
    });
  });

  describe("WebappRootView", function() {
    var sdk,
        standaloneAppStore,
        activeRoomStore,
        pageStore,
        participantStore,
        snackbarStore;

    function mountTestComponent() {
      return TestUtils.renderIntoDocument(
        React.createElement(
          loop.webapp.WebappRootView, {
            activeRoomStore: activeRoomStore,
            cursorStore: remoteCursorStore,
            dispatcher: dispatcher,
            pageStore,
            participantStore: participantStore,
            snackbarStore: snackbarStore,
            standaloneAppStore: standaloneAppStore
          }));
    }

    beforeEach(function() {
      sdk = {
        checkSystemRequirements: function() { return true; }
      };
      activeRoomStore = new loop.store.ActiveRoomStore(dispatcher, {
        mozLoop: {},
        sdkDriver: {}
      });
      standaloneAppStore = new loop.store.StandaloneAppStore(dispatcher, {
        sdk: sdk
      });
      remoteCursorStore = new loop.store.RemoteCursorStore(dispatcher, {
        sdkDriver: sdk
      });
      pageStore = new loop.store.PageStore(dispatcher, {
        dataDriver: {}
      });
      participantStore = new loop.store.ParticipantStore(dispatcher, {
        dataDriver: {}
      });
      snackbarStore = new loop.store.SnackbarStore(dispatcher, {
        dataDriver: {}
      });
    });

    it("should display the UnsupportedDeviceView for `unsupportedDevice` window type",
      function() {
        standaloneAppStore.setStoreState({ windowType: "unsupportedDevice", unsupportedPlatform: "ios" });
        var webappRootView = mountTestComponent();

        TestUtils.findRenderedComponentWithType(webappRootView,
          loop.webapp.UnsupportedDeviceView);
      });

    it("should display the UnsupportedBrowserView for `unsupportedBrowser` window type",
      function() {
        standaloneAppStore.setStoreState({ windowType: "unsupportedBrowser", isFirefox: false });

        var webappRootView = mountTestComponent();

        TestUtils.findRenderedComponentWithType(webappRootView,
          loop.webapp.UnsupportedBrowserView);
      });

    // XXX akita-sidebar
    it.skip("should display the StandaloneRoomControllerView for `room` window type",
      function() {
        standaloneAppStore.setStoreState({ windowType: "room", isFirefox: true });

        var webappRootView = mountTestComponent();

        TestUtils.findRenderedComponentWithType(webappRootView,
          loop.standaloneRoomViews.StandaloneRoomControllerView);
      });

    it("should display the HomeView for `home` window type", function() {
        standaloneAppStore.setStoreState({ windowType: "home", isFirefox: true });

        var webappRootView = mountTestComponent();

        TestUtils.findRenderedComponentWithType(webappRootView,
          loop.webapp.HomeView);
    });
  });

  describe("HomeView", function() {
    it("should display a welcome", function() {
      var homeView = TestUtils.renderIntoDocument(
        React.createElement(loop.webapp.HomeView));

      expect(ReactDOM.findDOMNode(homeView).textContent.includes("welcome")).eql(true);
    });
  });

  describe("PromoteFirefoxView", function() {
    describe("#render", function() {
      it("should not render when using Firefox", function() {
        var comp = TestUtils.renderIntoDocument(
          React.createElement(loop.webapp.PromoteFirefoxView, {
            isFirefox: true
        }));

        expect(ReactDOM.findDOMNode(comp)).eql(null);
      });

      it("should render when not using Firefox", function() {
        TestUtils.renderIntoDocument(
          React.createElement(loop.webapp.PromoteFirefoxView, {
              isFirefox: false
        }));

        sinon.assert.calledWith(mozL10nGet, "promote_firefox_hello_heading2");
        sinon.assert.calledWith(mozL10nGet, "get_firefox_button2");
      });
    });
  });
});
