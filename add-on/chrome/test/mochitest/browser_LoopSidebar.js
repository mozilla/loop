/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

/*
 * This file contains tests for the LoopSidebar
 */
"use strict";

const { LoopSidebar } = Cu.import("chrome://loop/content/modules/LoopSidebar.jsm", {});

var win;

registerCleanupFunction(function* () {
  if (win) {
    yield BrowserTestUtils.closeWindow(win);
  }
});

function* closeWindow() {
  yield BrowserTestUtils.closeWindow(win);
  win = null;
}

function goOffline() {
  // Turn off the network for loop tests, so that we don't
  // try to access the remote servers. If we want to turn this
  // back on in future, be careful to check for intermittent
  // failures.
  Services.io.offline = true;

  registerCleanupFunction(function() {
    Services.io.offline = WAS_OFFLINE;
  });
}

add_task(function* test_LoopSidebar_noSidebar() {
  let sidebar = window.document.getElementById("loop-side-browser");
  Assert.ok(!sidebar, "there should be no sidebars yet");
});

add_task(function* test_LoopSidebar_createSidebar() {
  goOffline();
  win = yield BrowserTestUtils.openNewBrowserWindow();
  LoopSidebar.createSidebar(win, "faketoken");
  let sidebar = win.document.getElementById("loop-side-browser");
  Assert.ok(sidebar, "there should create a sidebar");
  Assert.strictEqual(sidebar.getAttribute("src"), "about:loopconversation#faketoken", "Url must be set properly");
  yield closeWindow();
});

add_task(function* test_LoopSidebar_checkPermissions() {
  goOffline();
  win = yield BrowserTestUtils.openNewBrowserWindow();
  LoopSidebar.createSidebar(win, "faketoken");
  let uri = Services.io.newURI("about:loopconversation#faketoken", null, null);
  Assert.equal(Services.perms.testPermission(uri, "camera"),
    Services.perms.ALLOW_ACTION, "Camera permissions should be granted");
  yield closeWindow();
});

