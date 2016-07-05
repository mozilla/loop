/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var loop = loop || {};
loop.webapp = (function(_, OT, mozL10n) {
  "use strict";

  loop.config = loop.config || {};
  loop.config.serverUrl = loop.config.serverUrl || "http://localhost:5000";

  var sharedActions = loop.shared.actions;
  var sharedMixins = loop.shared.mixins;
  var sharedUtils = loop.shared.utils;

  /**
   * Homepage view.
   */
  var HomeView = React.createClass({
    render: function() {
      return (
        <p>{mozL10n.get("welcome", { clientShortname: mozL10n.get("clientShortname2") })}</p>
      );
    }
  });

  /**
   * Unsupported Browsers view.
   */
  var UnsupportedBrowserView = React.createClass({
    propTypes: {
      isFirefox: React.PropTypes.bool.isRequired
    },

    render: function() {
      return (
        <div className="issue-box issue-unsupported-browser">
          <div className="issue-box-content">
            <div className="info-panel">
              <h1>{mozL10n.get("incompatible_browser_heading2")}</h1>
              <PromoteFirefoxView isFirefox={this.props.isFirefox} />
              <div className="hello-logo" />
            </div>
            <div className="hello-supported-browser" />
          </div>
        </div>
      );
    }
  });

  /**
   * Unsupported Device view.
   */
  var UnsupportedDeviceView = React.createClass({
    propTypes: {
      platform: React.PropTypes.string.isRequired
    },

    render: function() {
      return (
        <div className="issue-box issue-unsupported-platform">
          <div className="issue-box-content">
            <div className="info-panel">
              <h1>{mozL10n.get("unsupported_platform_message2")}</h1>
            </div>
          </div>
        </div>
      );
    }
  });

  /**
   * Firefox promotion interstitial. Will display only to non-Firefox users.
   */
  var PromoteFirefoxView = React.createClass({
    propTypes: {
      isFirefox: React.PropTypes.bool.isRequired
    },

    render: function() {
      if (this.props.isFirefox) {
        return null;
      }

      return (
        <div className="promote-firefox">
          <p>
            {mozL10n.get("promote_firefox_hello_heading2", { brandShortname: mozL10n.get("brandShortname") })}
            {' '}
            <a className="promote-firefox-link" href={loop.config.learnMoreUrl}>{mozL10n.get("promote_firefox_hello_link_text")}</a>
          </p>
          <div className="get-firefox">
            <a className="btn"
               href={loop.config.downloadFirefoxUrl}>
              {mozL10n.get("get_firefox_button2", {
                brandShortname: mozL10n.get("brandShortname")
              })}
            </a>
          </div>
        </div>
      );
    }
  });

  /**
   * Webapp Root View. This is the main, single, view that controls the display
   * of the webapp page.
   */
  var WebappRootView = React.createClass({

    mixins: [sharedMixins.UrlHashChangeMixin,
             sharedMixins.DocumentLocationMixin,
             Backbone.Events],

    propTypes: {
      activeRoomStore: React.PropTypes.instanceOf(loop.store.ActiveRoomStore).isRequired,
      cursorStore: React.PropTypes.instanceOf(loop.store.RemoteCursorStore).isRequired,
      dispatcher: React.PropTypes.instanceOf(loop.Dispatcher).isRequired,
      pageStore: React.PropTypes.instanceOf(loop.store.PageStore).isRequired,
      participantStore: React.PropTypes.instanceOf(loop.store.ParticipantStore).isRequired,
      snackbarStore: React.PropTypes.instanceOf(loop.store.SnackbarStore).isRequired,
      standaloneAppStore: React.PropTypes.instanceOf(
        loop.store.StandaloneAppStore).isRequired
    },

    getInitialState: function() {
      return this.props.standaloneAppStore.getStoreState();
    },

    componentWillMount: function() {
      this.listenTo(this.props.standaloneAppStore, "change", function() {
        this.setState(this.props.standaloneAppStore.getStoreState());
      }, this);
    },

    componentWillUnmount: function() {
      this.stopListening(this.props.standaloneAppStore);
    },

    onUrlHashChange: function() {
      this.locationReload();
    },

    render: function() {
      switch (this.state.windowType) {
        case "unsupportedDevice": {
          return <UnsupportedDeviceView platform={this.state.unsupportedPlatform} />;
        }
        case "unsupportedBrowser": {
          return <UnsupportedBrowserView isFirefox={this.state.isFirefox} />;
        }
        case "room": {
          return (
            <loop.standaloneRoomViews.StandaloneRoomControllerView
              activeRoomStore={this.props.activeRoomStore}
              cursorStore={this.props.cursorStore}
              dispatcher={this.props.dispatcher}
              isFirefox={this.state.isFirefox}
              pageStore={this.props.pageStore}
              participantStore={this.props.participantStore}
              snackbarStore={this.props.snackbarStore} />
          );
        }
        case "home": {
          return <HomeView />;
        }
        default: {
          // The state hasn't been initialised yet, so don't display
          // anything to avoid flicker.
          return null;
        }
      }
    }
  });

  /**
   * App initialization.
   */
  function init() {
    loop.StandaloneMozLoop({
      baseServerUrl: loop.config.serverUrl
    });

    var dispatcher = new loop.Dispatcher();
    var sdkDriver = new loop.OTSdkDriver({
      // For the standalone, always request data channels. If they aren't
      // implemented on the client, there won't be a similar message to us, and
      // we won't display the UI.
      constants: {},
      useDataChannels: true,
      dispatcher: dispatcher,
      sdk: OT
    });
    let dataDriver = new loop.DataDriver({ dispatcher });

    var activeRoomStore = new loop.store.ActiveRoomStore(dispatcher, {
      sdkDriver: sdkDriver
    });

    // Stores
    var standaloneAppStore = new loop.store.StandaloneAppStore(dispatcher, {
      sdk: OT
    });
    var standaloneMetricsStore = new loop.store.StandaloneMetricsStore(dispatcher, {
      activeRoomStore: activeRoomStore
    });
    var textChatStore = new loop.store.TextChatStore(dispatcher, {
      dataDriver: dataDriver
    });
    var remoteCursorStore = new loop.store.RemoteCursorStore(dispatcher, {
      sdkDriver: sdkDriver
    });
    let participantStore = new loop.store.ParticipantStore(dispatcher, {
      dataDriver,
      updateParticipant: true
    });
    var serverConnectionStore = new loop.store.ServerConnectionStore(dispatcher, {});
    let snackbarStore = new loop.store.SnackbarStore(dispatcher);
    let pageStore = new loop.store.PageStore(dispatcher, { dataDriver });

    // Load the username from storage, or use random guest name
    loop.request("GetLoopPref", "username")
      .then(storedName => {
        let username = storedName ||
                       "Guest " + Math.random().toFixed(1).slice(-1);
        // save it for future (so it's not random anymore)
        loop.request("SetLoopPref", "username", username);

        // from now on, use this name (till changed by user / session)
        dispatcher.dispatch(
          new sharedActions.SetOwnDisplayName({
            displayName: username
          }));
      });

    loop.store.StoreMixin.register({
      activeRoomStore,
      participantStore,
      remoteCursorStore,
      serverConnectionStore,
      // This isn't used in any views, but is saved here to ensure it
      // is kept alive.
      standaloneMetricsStore,
      textChatStore
    });

    window.addEventListener("unload", function() {
      dispatcher.dispatch(new sharedActions.WindowUnload());
    });

    ReactDOM.render(<WebappRootView
      activeRoomStore={activeRoomStore}
      cursorStore={remoteCursorStore}
      dispatcher={dispatcher}
      pageStore={pageStore}
      participantStore={participantStore}
      snackbarStore={snackbarStore}
      standaloneAppStore={standaloneAppStore} />, document.querySelector("#main"));

    // Set the 'lang' and 'dir' attributes to <html> when the page is translated
    document.documentElement.lang = mozL10n.language.code;
    document.documentElement.dir = mozL10n.language.direction;
    document.title = mozL10n.get("clientShortname2");

    var locationData = sharedUtils.locationData();

    dispatcher.dispatch(new sharedActions.ExtractTokenInfo({
      windowPath: locationData.pathname,
      windowHash: locationData.hash
    }));
  }

  return {
    HomeView: HomeView,
    UnsupportedBrowserView: UnsupportedBrowserView,
    UnsupportedDeviceView: UnsupportedDeviceView,
    init: init,
    PromoteFirefoxView: PromoteFirefoxView,
    WebappRootView: WebappRootView
  };
})(_, window.OT, navigator.mozL10n);

// This should only be available when this file is loaded into index.html,
// where it's used to actually start the app.
/* global initIfReady */
if (typeof initIfReady === "function") {
  initIfReady();
}
