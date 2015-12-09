/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

/* eslint-env node */

module.exports = function(config) {
  "use strict";

  var baseConfig = require("./karma.conf.base.js")(config);

  // List of files / patterns to load in the browser.
  // We have to list these manually to ensure dependencies are correct.
  baseConfig.files = baseConfig.files.concat([
    "built/add-on/chrome/content/shared/vendor/react-0.13.3.js",
    "built/add-on/chrome/content/shared/vendor/classnames-2.2.0.js",
    "built/add-on/chrome/content/shared/vendor/lodash-3.9.3.js",
    "built/add-on/chrome/content/shared/vendor/backbone-1.2.1.js",
    "shared/test/vendor/*.js",
    "shared/test/loop_mocha_utils.js",
    "test/karma/head.js", // Stub out DOM event listener due to races.
    "built/add-on/chrome/content/panels/vendor/l10n.js",
    "built/add-on/chrome/content/shared/js/loopapi-client.js",
    "built/add-on/chrome/content/shared/js/utils.js",
    "built/add-on/chrome/content/shared/js/models.js",
    "built/add-on/chrome/content/shared/js/mixins.js",
    "built/add-on/chrome/content/shared/js/actions.js",
    "built/add-on/chrome/content/shared/js/otSdkDriver.js",
    "built/add-on/chrome/content/shared/js/validate.js",
    "built/add-on/chrome/content/shared/js/dispatcher.js",
    "built/add-on/chrome/content/shared/js/store.js",
    "built/add-on/chrome/content/shared/js/activeRoomStore.js",
    "built/add-on/chrome/content/shared/js/views.js",
    "built/add-on/chrome/content/shared/js/textChatStore.js",
    "built/add-on/chrome/content/shared/js/textChatView.js",
    "built/add-on/chrome/content/panels/js/feedbackViews.js",
    "built/add-on/chrome/content/panels/js/conversationAppStore.js",
    "built/add-on/chrome/content/panels/js/roomStore.js",
    "built/add-on/chrome/content/panels/js/roomViews.js",
    "built/add-on/chrome/content/panels/js/conversation.js",
    "add-on/panels/test/*.js"
  ]);

  // List of files to exclude.
  baseConfig.exclude = baseConfig.exclude.concat([
    "add-on/panels/test/panel_test.js"
  ]);

  // Preprocess matching files before serving them to the browser.
  // Available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor .
  baseConfig.preprocessors = {
    "built/add-on/chrome/content/panels/js/*.js": ["coverage"]
  };

  baseConfig.coverageReporter.dir = "built/coverage/desktop";

  config.set(baseConfig);
};
