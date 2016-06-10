/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var loop = loop || {};
loop.store = loop.store || {};

loop.store.PageStore = function(mozL10n) {
  "use strict";

  var sharedActions = loop.shared.actions;

  /**
   * Page store.
   *
   * @param {loop.Dispatcher} dispatcher  The dispatcher for dispatching actions
   *                                      and registering to consume actions.
   * @param {Object}          options     Options object:
   * - {DataDriver} dataDriver The driver to use for adding or removing the pages.
   */
  var PageStore = loop.store.createStore({
    initialize(options = {}) {
      if (!options.dataDriver) {
        throw new Error("Missing option dataDriver");
      }

      this._dataDriver = options.dataDriver;
    },

    getInitialStoreState() {
      return {
        pages: []
      };
    },

    actions: [
      "addPage",
      "addedPage",
      "deletePage",
      "deletedPage",
      "setOwnDisplayName"
    ],

    /**
     * Handle SetOwnDisplayName action by saving the current user's name.
     */
    setOwnDisplayName({ displayName }) {
      this._currentUserName = displayName;
    },

    /**
     * Handle AddPage action by saving the specific page.
     */
     // XXX akita: Update data saved into Firebase according to the action `AddPage`
    addPage(actionData) {
      this._dataDriver.addPage({
        title: actionData.title,
        thumbnail_img: actionData.thumbnail_img,
        url: actionData.url,
        userName: this._currentUserName
      });
    },

    /**
     * Handle AddedPage action by updating the store state.
     */
    addedPage(actionData) {
      let page = {
        id: actionData.pageId,
        title: actionData.title,
        thumbnail_img: actionData.thumbnail_img,
        url: actionData.url,
        userName: actionData.userName
      };

      this._storeState.pages.push(page);
      this.setStoreState({
        pages: this._storeState.pages
      });
    },

    /**
     * Handle DeletePage action by deleting the specific page.
     */
    deletePage(actionData) {
      this._dataDriver.deletePage(actionData.pageId);
    },

    /**
     * Handle DeletedPage action by updating the store state.
     */
    deletedPage(actionData) {
      let pages = this._storeState.pages;
      let pagesLength = pages.length;
      pages = pages.filter(page => page.id !== actionData.pageId);
      this.setStoreState({ pages });

      if (pagesLength !== pages.length) {
        this.dispatchAction(new sharedActions.ShowSnackbar({
          label: mozL10n.get("snackbar_page_deleted")
        }));
      }
    }
  });

  return PageStore;
}(navigator.mozL10n || document.mozL10n);
