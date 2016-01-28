/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var loop = loop || {};
loop.store = loop.store || {};

loop.store.RemoteCursorStore = (function() {
  "use strict";

  var CURSOR_MESSAGE_TYPES = loop.shared.utils.CURSOR_MESSAGE_TYPES;

  /**
   * A store to handle remote cursors events.
   */
  var RemoteCursorStore = loop.store.createStore({
    actions: [],

    /**
     * Initializes the store.
     *
     * @param  {Object} options An object containing options for this store.
     *                          It should consist of:
     *                          - sdkDriver: The sdkDriver to use for sending
     *                                       the cursor events.
     */
    initialize: function(options) {
      options = options || {};

      if (!options.sdkDriver) {
        throw new Error("Missing option sdkDriver");
      }

      this._sdkDriver = options.sdkDriver;
      loop.subscribe("CursorPositionChange", this._cursorPositionChangeListener.bind(this));
    },

    /**
     * Returns initial state data for this active room.
     */
    getInitialStoreState: function() {
      return {
        remoteCursorPosition: null
      };
    },

    /**
     * Sends cursor position through the sdk.
     *
     * @param {Object} event An object containing the cursor position and stream dimensions
     *                       It should contains:
     *                       - ratioX: Left position. Number between 0 and 1.
     *                       - ratioY: Top position. Number between 0 and 1.
     */
    _cursorPositionChangeListener: function(event) {
      this._sdkDriver.sendCursorMessage({
        ratioX: event.ratioX,
        ratioY: event.ratioY,
        type: CURSOR_MESSAGE_TYPES.POSITION
      });
    }
  });

  return RemoteCursorStore;
})();
