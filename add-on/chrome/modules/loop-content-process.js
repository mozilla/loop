/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

// This file is loaded as a process script, it will be loaded in the parent
// process as well as all content processes.

const { utils: Cu } = Components;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("chrome://loop/content/modules/AboutLoop.jsm");

function AboutLoopChildListener() {
}
AboutLoopChildListener.prototype = {
  onStartup: function onStartup() {

    // Only do this in content processes since, as the broadcaster of this
    // message, the parent process doesn't also receive it.  We handlers
    // the shutting down separately.
    if (Services.appinfo.processType ==
        Services.appinfo.PROCESS_TYPE_CONTENT) {

      Services.cpmm.addMessageListener("LoopShuttingDown", this, true);
    }

    AboutLoop.conversation.register();
    AboutLoop.panel.register();
    AboutLoop.toc.register();
  },

  /**
   * Shutdown handler for the child process only.  We handle unregistering
   * the chrome equivalent of this in bootstrap.js.  Some of this could be
   * pushed down into AboutLoop itself in order to DRY the code up and
   * make the API less error-prone.
   */
  onShutdown: function onShutdown() {
    AboutLoop.panel.unregister();
    AboutLoop.conversation.unregister();
    AboutLoop.toc.unregister();

    Services.cpmm.removeMessageListener("LoopShuttingDown", this);
    Cu.unload("chrome://loop/content/modules/AboutLoop.jsm");
  },

  receiveMessage: function receiveMessage(message) {
    switch (message.name) {

      case "LoopShuttingDown":
        this.onShutdown();
        break;

      default:
        break;
    }

    return;
  }
};

const listener = new AboutLoopChildListener();
listener.onStartup(); // This will run in both chrome and content processes
