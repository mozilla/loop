/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var loop = loop || {};
loop.store = loop.store || {};

loop.store.SnackbarStore = function() {
  "use strict";

  var SnackbarStore = loop.store.createStore({
    actions: [
      "showSnackbar"
    ],

    getInitialStoreState: function() {
      return {
        label: ""
      };
    },

    showSnackbar: function(actionData) {
      this.setStoreState({
        label: actionData.label
      });
    }
  });

  return SnackbarStore;
}();
