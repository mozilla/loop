/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

/* eslint-env node */

module.exports = function(config) {
  "use strict";

  var baseConfig = require("./karma.conf.base.js")(config);

  // List of files / patterns to load in the browser.
  baseConfig.files = baseConfig.files.concat([
    "built/standalone/content/shared/vendor/lodash.js",
    "shared/test/loop_mocha_utils.js",
    "test/karma/head.js",
    "built/standalone/content/vendor/l10n-gaia-02ca67948fe8.js",
    "built/standalone/content/shared/vendor/backbone.js",
    "built/standalone/content/shared/vendor/react.js",
    "built/standalone/content/shared/vendor/react-dom.js",
    "built/standalone/content/shared/vendor/classnames.js",
    "built/standalone/content/shared/vendor/sdk.js",
    "built/test/vendor/chai.js",
    "built/test/vendor/chai-as-promised.js",
    "built/test/vendor/mocha.js",
    "built/test/vendor/sinon.js",
    "built/test/vendor/react-dom-server.js",
    "built/standalone/content/shared/js/loopapi-client.js",
    "built/standalone/content/shared/js/utils.js",
    "built/standalone/content/shared/js/store.js",
    "built/standalone/content/shared/js/mixins.js",
    "built/standalone/content/shared/js/crypto.js",
    "built/standalone/content/shared/js/validate.js",
    "built/standalone/content/shared/js/actions.js",
    "built/standalone/content/shared/js/dispatcher.js",
    "built/standalone/content/shared/js/otSdkDriver.js",
    "built/standalone/content/shared/js/activeRoomStore.js",
    "built/standalone/content/shared/js/remoteCursorStore.js",
    "built/standalone/content/shared/js/views.js",
    "built/standalone/content/shared/js/textChatStore.js",
    "built/standalone/content/shared/js/textChatView.js",
    "built/standalone/content/shared/js/urlRegExps.js",
    "built/standalone/content/shared/js/linkifiedTextView.js",
    "built/standalone/content/js/standaloneAppStore.js",
    "built/standalone/content/js/standaloneMozLoop.js",
    "built/standalone/content/js/standaloneRoomViews.js",
    "built/standalone/content/js/standaloneMetricsStore.js",
    "built/standalone/content/js/webapp.js",
    "shared/test/*.js",
    "standalone/test/*.js",
    "test/karma/tail.js"
  ]);

  // Preprocess matching files before serving them to the browser.
  // Available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor .
  baseConfig.preprocessors = {
    "built/standalone/content/shared/js/*.js": ["coverage"],
    "built/standalone/content/js/*.js": ["coverage"]
  };

  // For the standalone/shared unit tests, we run in Firefox and Chrome.
  if (process.env.TRAVIS) {
    baseConfig.browsers = ["Firefox", "Chrome_travis_ci"];
  } else {
    baseConfig.browsers = ["Firefox", "Chrome"];
  }

  baseConfig.coverageReporter.dir = "built/coverage/shared_standalone";

  config.set(baseConfig);
};
