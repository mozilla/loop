/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

let gConstants;
LoopAPI.inspect()[1].GetAllConstants({}, constants => gConstants = constants);

let { goDoCommand, gURLBar } = window;

registerCleanupFunction(() => {
  document.getElementById("loop-notification-panel").hidePopup();
  LoopUI.removeCopyPanel();
});

// Even with max threshold, no panel if already shown.
add_task(function* test_init_copy_panel_already_shown() {
  LoopUI.removeCopyPanel();
  Services.prefs.setIntPref("loop.copy.ticket", -1);
  Services.prefs.setBoolPref("loop.copy.shown", true);

  yield LoopUI.maybeAddCopyPanel();

  Assert.equal(document.getElementById("loop-copy-notification-panel"), null, "copy panel doesn't exist for already shown");
  Assert.equal(Services.prefs.getIntPref("loop.copy.ticket"), -1, "ticket should be unchanged");
});

// Even with max threshold, no panel if private browsing.
add_task(function* test_init_copy_panel_private() {
  LoopUI.removeCopyPanel();
  Services.prefs.setIntPref("loop.copy.ticket", -1);

  let win = OpenBrowserWindow({ private: true });
  yield new Promise(resolve => win.addEventListener("load", resolve));
  yield win.LoopUI.maybeAddCopyPanel();

  Assert.equal(win.document.getElementById("loop-copy-notification-panel"), null, "copy panel doesn't exist for private browsing");
  Assert.equal(Services.prefs.getIntPref("loop.copy.ticket"), -1, "ticket should be unchanged");

  win.close();
});

/**
 * Helper function for testing clicks on the copy panel.
 * @param {String} domain Text to put in the urlbar to assist in debugging.
 * @param {Function} onIframe Callback to interact with iframe contents.
 */
function testClick(domain, onIframe) {
  let histogram = Services.telemetry.getHistogramById("LOOP_COPY_PANEL_ACTIONS");
  histogram.clear();
  LoopUI.removeCopyPanel();
  gURLBar.value = "http://" + domain + "/";

  LoopUI.addCopyPanel();
  gURLBar.focus();
  gURLBar.select();
  goDoCommand("cmd_copy");

  let iframe = document.getElementById("loop-copy-panel-iframe");
  return new Promise(resolve => {
    iframe.addEventListener("DOMContentLoaded", () => {
      iframe.parentNode.addEventListener("popuphidden", () => resolve(histogram));
      // Allow synchronous on-load code to run before we continue.
      setTimeout(() => onIframe(iframe));
    });
  });
}

// Show the copy panel on location bar copy.
add_task(function* test_copy_panel_shown() {
  let histogram = yield testClick("some.site", iframe => {
    iframe.parentNode.hidePopup();
  });

  Assert.notEqual(document.getElementById("loop-copy-notification-panel"), null, "copy panel exists on copy");
  Assert.strictEqual(histogram.snapshot().counts[gConstants.COPY_PANEL.SHOWN], 1, "triggered telemetry count for showing");
});

// Click the accept button without checkbox.
add_task(function* test_click_yes_again() {
  let histogram = yield testClick("yes.again", iframe => {
    iframe.contentDocument.querySelector(".copy-button:last-child").click();
  });

  Assert.notEqual(document.getElementById("loop-copy-notification-panel"), null, "copy panel still exists");
  Assert.strictEqual(histogram.snapshot().counts[gConstants.COPY_PANEL.YES_AGAIN], 1, "triggered telemetry count for yes again");
});

// Click the accept button with checkbox.
add_task(function* test_click_yes_never() {
  let histogram = yield testClick("yes.never", iframe => {
    iframe.contentDocument.querySelector(".copy-toggle-label").click();
    iframe.contentDocument.querySelector(".copy-button:last-child").click();
  });

  Assert.equal(document.getElementById("loop-copy-notification-panel"), null, "copy panel removed");
  Assert.strictEqual(histogram.snapshot().counts[gConstants.COPY_PANEL.YES_NEVER], 1, "triggered telemetry count for yes never");
});

// Click the cancel button without checkbox.
add_task(function* test_click_no_again() {
  let histogram = yield testClick("no.again", iframe => {
    iframe.contentDocument.querySelector(".copy-button").click();
  });

  Assert.notEqual(document.getElementById("loop-copy-notification-panel"), null, "copy panel still exists");
  Assert.strictEqual(histogram.snapshot().counts[gConstants.COPY_PANEL.NO_AGAIN], 1, "triggered telemetry count for no again");
});

// Click the cancel button with checkbox.
add_task(function* test_click_no_never() {
  let histogram = yield testClick("no.never", iframe => {
    iframe.contentDocument.querySelector(".copy-toggle-label").click();
    iframe.contentDocument.querySelector(".copy-button").click();
  });

  Assert.equal(document.getElementById("loop-copy-notification-panel"), null, "copy panel removed");
  Assert.strictEqual(histogram.snapshot().counts[gConstants.COPY_PANEL.NO_NEVER], 1, "triggered telemetry count for no never");
});

// Try to trigger copy panel after saying no.
add_task(function* test_click_no_never_retry() {
  yield testClick("no.never", iframe => {
    iframe.contentDocument.querySelector(".copy-toggle-label").click();
    iframe.contentDocument.querySelector(".copy-button").click();
  });
  yield LoopUI.maybeAddCopyPanel();

  Assert.equal(document.getElementById("loop-copy-notification-panel"), null, "copy panel stays removed");
});
