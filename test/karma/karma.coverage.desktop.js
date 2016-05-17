/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

/* eslint-env node */

module.exports = function(config) {
  "use strict";

  var baseConfig = require("./karma.conf.base.js")(config);

  // List of files / patterns to load in the browser.
  // We have to list these manually to ensure dependencies are correct.
  baseConfig.files = baseConfig.files.concat([
    "built/add-on/chrome/content/shared/vendor/lodash.js",
    "shared/test/loop_mocha_utils.js",
    "test/karma/head.js",
    "built/add-on/chrome/content/shared/vendor/react.js",
    "built/add-on/chrome/content/shared/vendor/react-dom.js",
    "built/add-on/chrome/content/shared/vendor/classnames.js",
    "built/add-on/chrome/content/shared/vendor/backbone.js",
    "built/add-on/chrome/content/panels/vendor/simpleSlideshow.js",
    "built/test/vendor/chai.js",
    "built/test/vendor/chai-as-promised.js",
    "built/test/vendor/mocha.js",
    "built/test/vendor/sinon.js",
    "built/add-on/chrome/content/panels/vendor/l10n.js",
    "built/add-on/chrome/content/shared/js/loopapi-client.js",
    "built/add-on/chrome/content/shared/js/utils.js",
    "built/add-on/chrome/content/panels/js/models.js",
    "built/add-on/chrome/content/shared/js/mixins.js",
    "built/add-on/chrome/content/shared/js/actions.js",
    "built/add-on/chrome/content/shared/js/otSdkDriver.js",
    "built/add-on/chrome/content/shared/js/validate.js",
    "built/add-on/chrome/content/shared/js/dispatcher.js",
    "built/add-on/chrome/content/panels/test/fake-components.js",
    "built/add-on/chrome/content/shared/js/store.js",
    "built/add-on/chrome/content/shared/js/activeRoomStore.js",
    "built/add-on/chrome/content/shared/js/remoteCursorStore.js",
    "built/add-on/chrome/content/shared/js/views.js",
    "built/add-on/chrome/content/panels/js/desktopViews.js",
    "built/add-on/chrome/content/shared/js/textChatStore.js",
    "built/add-on/chrome/content/shared/js/textChatView.js",
    "built/add-on/chrome/content/panels/js/feedbackViews.js",
    "built/add-on/chrome/content/panels/js/conversationAppStore.js",
    "built/add-on/chrome/content/panels/js/roomStore.js",
    "built/add-on/chrome/content/panels/js/roomViews.js",
    "built/add-on/chrome/content/panels/js/conversation.js",
    "built/add-on/chrome/content/panels/js/copy.js",
    "built/add-on/chrome/content/panels/js/panel.js",
    "built/add-on/chrome/content/panels/js/slideshow.js",
    "add-on/panels/test/*.js",
    "test/karma/tail.js"
  ]);

  // Preprocess matching files before serving them to the browser.
  // Available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor .
  baseConfig.preprocessors = {
    "built/add-on/chrome/content/panels/js/*.js": ["coverage"],
    "built/add-on/chrome/content/panels/vendor/l10n.js": ["coverage"]
  };

  baseConfig.coverageReporter.dir = "built/coverage/desktop";

  config.set(baseConfig);
};
