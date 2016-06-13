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
// Due to bug 1051238 frame scripts are cached forever, so we can't update them
// as a restartless add-on. The Math.random() is the work around for this.
const LOOP_FRAME_SCRIPT = "chrome://loop/content/modules/loopFrameContent.js?" + Math.random();

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/osfile.jsm", this);

XPCOMUtils.defineLazyModuleGetter(this, "LoopAPI",
  "chrome://loop/content/modules/MozLoopAPI.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "convertToRTCStatsReport",
  "resource://gre/modules/media/RTCStatsReport.jsm");
XPCOMUtils.defineLazyServiceGetter(this, "uuidgen",
                                   "@mozilla.org/uuid-generator;1",
                                   "nsIUUIDGenerator");

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

class LoopSidebarInternalClass {
  constructor() {
    this.conversationContexts = new Map();
  }

  /**
   * Creates a sidebar in the given browser window and loads the content based
   * on the room token. It will ensure that the sidebar is only opened once.
   *
   * @param {Object}  window  Browser window where the sidebar will be created
   *
   * @param {String}  token   The room token that is opened in the browser window
   */
  createSidebar(window, token) {
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

    this.loadFrameScripts(sidebarBrowser);
    this.injectFrameScriptHandlers(sidebarBrowser);

    let url = "about:loopconversation#" + token;

    // Ensure camera access is allowed for the url.
    Services.perms.add(Services.io.newURI(url, null, null), "camera",
                     Services.perms.ALLOW_ACTION, Services.perms.EXPIRE_SESSION);

    sidebarBrowser.setAttribute("src", url);

    this._unloadListener = this.unload.bind(this, token);
    window.addEventListener("unload", this._unloadListener);
  }

  /**
   * Loads a frame script in the Loop group message manager.
   *
   * @param {Object}  sidebarBrowser  The browser for the sidebar where the frame
   *                                  script should be loaded.
   */
  loadFrameScripts(browser) {
    // As we're only worried about the sidebar here, we can load the scripts
    // directly into that element.
    let mm = browser.messageManager;
    mm.loadFrameScript(BROWSER_FRAME_SCRIPT, false);
    mm.loadFrameScript(LOOP_FRAME_SCRIPT, false);
  }

  /**
   * Injects handlers to interact with the frame scripts.
   *
   * @param {Object}  sidebarBrowser  The browser for the sidebar where the listeners
   *                                  should be loaded.
   */
  injectFrameScriptHandlers(browser) {
    let mm = browser.messageManager;

    let loaded = () => {
      mm.removeMessageListener("DOMContentLoaded", loaded);

      let listeners = {};

      mm.sendAsyncMessage("Loop:MonitorPeerConnectionLifecycle");
      var messageName = "Loop:PeerConnectionLifecycleChange";
      mm.addMessageListener(messageName, listeners[messageName] = message => {
        // Chat Window Id, this is different that the internal winId
        let chatWindowId = message.data.locationHash.slice(1);
        var context = this.conversationContexts.get(chatWindowId);
        var peerConnectionID = message.data.peerConnectionID;
        var exists = peerConnectionID.match(/session=(\S+)/);
        if (context && !exists) {
          // Not ideal but insert our data amidst existing data like this:
          // - 000 (id=00 url=http)
          // + 000 (session=000 id=00 url=http)
          var pair = peerConnectionID.split("(");
          if (pair.length == 2) {
            peerConnectionID = pair[0] + "(session=" + context.sessionId +
              " " + pair[1];
          }
        }

        if (message.data.type == "iceconnectionstatechange") {
          switch (message.data.iceConnectionState) {
            case "failed":
            case "disconnected":
              if (Services.telemetry.canRecordExtended) {
                this.stageForTelemetryUpload(mm, message.data);
              }
              break;
          }
        }
      });
    };

    mm.sendAsyncMessage("WaitForDOMContentLoaded");
    mm.addMessageListener("DOMContentLoaded", loaded);
  }

  /**
   * Saves loop logs to the saved-telemetry-pings folder.
   *
   * @param {nsIDOMWindow} window The window object which can be communicated with
   * @param {Object}        The peerConnection in question.
   */
  stageForTelemetryUpload(mm, details) {
    mm.addMessageListener("Loop:GetAllWebrtcStats", function getAllStats(message) {
      mm.removeMessageListener("Loop:GetAllWebrtcStats", getAllStats);

      let { allStats, logs } = message.data;
      let internalFormat = allStats.reports[0]; // filtered on peerConnectionID

      let report = convertToRTCStatsReport(internalFormat);
        let logStr = "";
        logs.forEach(s => {
          logStr += s + "\n";
        });

        // We have stats and logs.

        // Create worker job. ping = saved telemetry ping file header + payload
        //
        // Prepare payload according to https://wiki.mozilla.org/Loop/Telemetry

        let ai = Services.appinfo;
        let uuid = uuidgen.generateUUID().toString();
        uuid = uuid.substr(1, uuid.length - 2); // remove uuid curly braces

        let directory = OS.Path.join(OS.Constants.Path.profileDir,
                                     "saved-telemetry-pings");
        let job = {
          directory: directory,
          filename: uuid + ".json",
          ping: {
            reason: "loop",
            slug: uuid,
            payload: {
              ver: 1,
              info: {
                appUpdateChannel: ai.defaultUpdateChannel,
                appBuildID: ai.appBuildID,
                appName: ai.name,
                appVersion: ai.version,
                reason: "loop",
                OS: ai.OS,
                version: Services.sysinfo.getProperty("version")
              },
              report: "ice failure",
              connectionstate: details.iceConnectionState,
              stats: report,
              localSdp: internalFormat.localSdp,
              remoteSdp: internalFormat.remoteSdp,
              log: logStr
            }
          }
        };

        // Send job to worker to do log sanitation, transcoding and saving to
        // disk for pickup by telemetry on next startup, which then uploads it.

        let worker = new ChromeWorker("MozLoopWorker.js");
        worker.onmessage = function(e) {
          log.info(e.data.ok ?
            "Successfully staged loop report for telemetry upload." :
            ("Failed to stage loop report. Error: " + e.data.fail));
        };
        worker.postMessage(job);
    });

    mm.sendAsyncMessage("Loop:GetAllWebrtcStats", {
      peerConnectionID: details.peerConnectionID
    });
  }

  unload(token, event) {
    event.target.removeEventListener("unload", this._unloadListener);

    LoopAPI.sendMessageToHandler({
      name: "HangupNow",
      data: [token]
    });
  }
}

let LoopSidebarInternal = new LoopSidebarInternalClass();

this.LoopSidebar = Object.freeze({
  createSidebar: function(window, token) {
    LoopSidebarInternal.createSidebar(window, token);
  },

  tearDown: function() {
    // XXX akita - Bug 1280627 close the sidebar?
  },

  getConversationContext: function(winId) {
    return LoopSidebarInternal.conversationContexts.get(winId);
  },

  addConversationContext: function(windowId, context) {
    LoopSidebarInternal.conversationContexts.set(windowId, context);
  }
});

this.EXPORTED_SYMBOLS = ["LoopSidebar"];
