/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

/* Basic code borrowed and adapted from PocketAbout stuff in mozilla-central
 */

const { utils: Cu } = Components;
const kNSXUL = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
const SIDEBAR_WIDTH = 250;
// This is part of the browser, so we don't need the random element.
const BROWSER_FRAME_SCRIPT = "chrome://browser/content/content.js";

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

// See LOG_LEVELS in Console.jsm. Common examples: "All", "Info", "Warn", & "Error".
const PREF_LOG_LEVEL = "loop.debug.loglevel";

XPCOMUtils.defineLazyGetter(this, "log", () => {
  let ConsoleAPI = Cu.import("resource://gre/modules/Console.jsm", {}).ConsoleAPI;
  let consoleOptions = {
    maxLogLevelPref: PREF_LOG_LEVEL,
    prefix: "Loop"
  };
  return new ConsoleAPI(consoleOptions);
});

var LoopSidebarInternal = {
  /**
   * Creates a sidebar in the given browser window and loads the content based
   * on the room token. It will ensure that the sidebar is only opened once.
   *
   * @param {Object}  window  Browser window where the sidebar will be created
   *
   * @param {String}  token   The room token that is opened in the browser window
   */
  createSidebar: function(window, token) {
    let ownerDocument = window.gBrowser.ownerDocument;

    if (ownerDocument.getElementById("loop-side-browser")) {
      return;
    }

    var browser = ownerDocument.getElementById("browser");

    let sidebarBrowser = ownerDocument.createElementNS(kNSXUL, "browser");
    sidebarBrowser.setAttribute("id", "loop-side-browser");
    sidebarBrowser.setAttribute("disablehistory", "true");
    sidebarBrowser.setAttribute("disableglobalhistory", "true");
    sidebarBrowser.setAttribute("frameType", "loop");
    sidebarBrowser.setAttribute("messagemanagergroup", "loop");
    sidebarBrowser.setAttribute("message", "true");
    // Ensure the sidebar only runs in the remote process if e10s is turned on.
    sidebarBrowser.setAttribute("remote", window.gMultiProcessBrowser ? "true" : "false");
    sidebarBrowser.setAttribute("tooltip", "aHTMLTooltip");
    sidebarBrowser.setAttribute("type", "content");

    sidebarBrowser.width = SIDEBAR_WIDTH;

    browser.appendChild(sidebarBrowser);

    this.loadFrameScript(window);

    log.info("createSidebar called:", token, sidebarBrowser);
    let url = "about:loopconversation#" + token;

    // Ensure camera access is allowed for the url.
    Services.perms.add(Services.io.newURI(url, null, null), "camera",
                     Services.perms.ALLOW_ACTION, Services.perms.EXPIRE_SESSION);

    sidebarBrowser.setAttribute("src", url);
  },

  /**
   * Loads a frame script in the Loop group message manager
   *
   * @param {Object}  window  Browser window where the sidebar is created and
   *                          the frame script must be loaded.
   */
  loadFrameScript: function(window) {
    // This loads the generic browser content script into our special "loop"
    // message manager for the sidebar.
    let loopMessageManager = window.getGroupMessageManager("loop");
    loopMessageManager.loadFrameScript(BROWSER_FRAME_SCRIPT, true);
  }
};

this.LoopSidebar = Object.freeze({
  createSidebar: function(window, token) {
    LoopSidebarInternal.createSidebar(window, token);
  },

  tearDown: function(window) {
    let loopMessageManager = window.getGroupMessageManager("loop");
    loopMessageManager.removeDelayedFrameScript(BROWSER_FRAME_SCRIPT);
  }
});

this.EXPORTED_SYMBOLS = ["LoopSidebar"];
