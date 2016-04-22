/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

/* Basic code borrowed and adapted from PocketAbout stuff in mozilla-central
 */

const { interfaces: Ci, results: Cr, manager: Cm, utils: Cu } = Components;

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


function AboutPage(chromeURL, aboutHost, classID, description, uriFlags) {
this.chromeURL = chromeURL;
  this.aboutHost = aboutHost;
  this.classID = Components.ID(classID);
  this.description = description;
  this.uriFlags = uriFlags;
}

AboutPage.prototype = {
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIAboutModule]),
  getURIFlags: function(aURI) { // eslint-disable-line no-unused-vars
    return this.uriFlags;
  },

  newChannel: function(aURI, aLoadInfo) {
    let newURI = Services.io.newURI(this.chromeURL, null, null);
    let channel = Services.io.newChannelFromURIWithLoadInfo(newURI,
                                                            aLoadInfo);
    channel.originalURI = aURI;

    if (this.uriFlags & Ci.nsIAboutModule.URI_SAFE_FOR_UNTRUSTED_CONTENT) {
      let principal = Services.scriptSecurityManager.getNoAppCodebasePrincipal(aURI);
      channel.owner = principal;
    }
    return channel;
  },

  createInstance: function(outer, iid) {
    if (outer != null) {
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    return this.QueryInterface(iid);
  },

  register: function() {
    Cm.QueryInterface(Ci.nsIComponentRegistrar).registerFactory(
      this.classID, this.description,
      "@mozilla.org/network/protocol/about;1?what=" + this.aboutHost, this);
  },

  unregister: function() {
    Cm.QueryInterface(Ci.nsIComponentRegistrar).unregisterFactory(
      this.classID, this);
  }
};

/* exported AboutLoop */
var AboutLoop = {};

// Note that about:loopconversation and about:looppanel are used in some
// checks in mozilla-central (eg getUserMedia-related), so if we want to
// make changes to the URL names themselves, we'll need to change them
// there too...
XPCOMUtils.defineLazyGetter(AboutLoop, "conversation", () => {
  return new AboutPage("chrome://loop/content/panels/conversation.html",
                       "loopconversation",
                       "E79DB45D-2D6D-48BE-B179-6A16C95E97BA",
                       "About Loop Conversation",
                       Ci.nsIAboutModule.ALLOW_SCRIPT |
                        Ci.nsIAboutModule.HIDE_FROM_ABOUTABOUT |
                        Ci.nsIAboutModule.MAKE_UNLINKABLE |
                        Ci.nsIAboutModule.URI_SAFE_FOR_UNTRUSTED_CONTENT |
                        Ci.nsIAboutModule.URI_MUST_LOAD_IN_CHILD);
});

XPCOMUtils.defineLazyGetter(AboutLoop, "panel", () => {
  return new AboutPage("chrome://loop/content/panels/panel.html",
                       "looppanel",
                       "A5DE152B-DE58-42BC-A68C-33E00B17EC2C",
                       "About Loop Panel",
                       Ci.nsIAboutModule.ALLOW_SCRIPT |
                        Ci.nsIAboutModule.HIDE_FROM_ABOUTABOUT |
                        Ci.nsIAboutModule.MAKE_UNLINKABLE |
                        Ci.nsIAboutModule.URI_SAFE_FOR_UNTRUSTED_CONTENT);
});

XPCOMUtils.defineLazyGetter(AboutLoop, "toc", () => {
  return new AboutPage("chrome://loop/content/panels/toc.html",
                       "looptoc",
                       "A1220CE0-E5D1-45B6-BEBA-3706166A2AA4",
                       "About Loop ToC",
                       Ci.nsIAboutModule.ALLOW_SCRIPT |
                        Ci.nsIAboutModule.HIDE_FROM_ABOUTABOUT |
                        Ci.nsIAboutModule.URI_SAFE_FOR_UNTRUSTED_CONTENT |
                        Ci.nsIAboutModule.MAKE_UNLINKABLE); // XXX akita-sidebar load in child?
});

this.EXPORTED_SYMBOLS = ["AboutLoop"];
