/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/* global addMessageListener, content, sendAsyncMessage */

/**
 * This script runs in the content process and is used for hooking up messages
 * specifically for the sidebar process. It is loaded into the "loop" message
 * manager group.
 */

var { interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

// Listen to DOMContentLoaded so that we know when we've loaded.
var gDOMContentLoaded = false;
addEventListener("DOMContentLoaded", event => {
  if (event.target == content.document) {
    gDOMContentLoaded = true;
    sendAsyncMessage("DOMContentLoaded");
  }
});

const loopFrameListener = {
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIMessageListener,
                                         Ci.nsIWebProgressListener,
                                         Ci.nsISupportsWeakReference,
                                         Ci.nsISupports]),

  init() {
    addMessageListener("Loop:MonitorPeerConnectionLifecycle", this);
    addMessageListener("Loop:GetAllWebrtcStats", this);
    addMessageListener("WaitForDOMContentLoaded", this);
  },

  receiveMessage(message) {
    switch (message.name) {
      case "Loop:GetAllWebrtcStats": {
        content.WebrtcGlobalInformation.getAllStats(allStats => {
          content.WebrtcGlobalInformation.getLogging("", logs => {
            sendAsyncMessage("Loop:GetAllWebrtcStats", {
              allStats: allStats,
              logs: logs
            });
          });
        }, message.data.peerConnectionID);
        break;
      }
      case "Loop:MonitorPeerConnectionLifecycle": {
        let ourID = content.QueryInterface(Ci.nsIInterfaceRequestor)
          .getInterface(Ci.nsIDOMWindowUtils).currentInnerWindowID;

        let onPCLifecycleChange = (pc, winID, type) => {
          if (winID != ourID) {
            return;
          }

          sendAsyncMessage("Loop:PeerConnectionLifecycleChange", {
            iceConnectionState: pc.iceConnectionState,
            locationHash: content.location.hash,
            peerConnectionID: pc.id,
            type: type
          });
        };

        let pc_static = new content.RTCPeerConnectionStatic();
        pc_static.registerPeerConnectionLifecycleCallback(onPCLifecycleChange);
        break;
      }
      case "WaitForDOMContentLoaded":
        if (gDOMContentLoaded) {
          sendAsyncMessage("DOMContentLoaded");
        }
        break;
    }
  }
};

loopFrameListener.init();
