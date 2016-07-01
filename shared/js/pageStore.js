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
      "setOwnDisplayName",
      "updateRoomInfo"
    ],

    /**
     * Handle SetOwnDisplayName action by saving the current user's name.
     */
    setOwnDisplayName({ displayName }) {
      this._currentUserName = displayName;
    },

    /**
     * Handle AddPage action by saving the specific page.
     *
     * @note If actionData.url already exists in the store, it will not
     * be added a second time.
     */
     // XXX akita: Update data saved into Firebase according to the action `AddPage`
    addPage(actionData) {

      // This prevents a race if the link-clicker is opened very
      // quickly, particularly since the page currently isn't added until
      // after the metadata fetch completes.  There will still be some kind of
      // race here even after bug 1281066 lands, but we'l be much less likely to
      // hit it with any frequency.
      if (this._hasPageForUrl(actionData.url)) {
        return;
      }

      this._dataDriver.addPage({
        title: actionData.title,
        thumbnail_img: actionData.thumbnail_img,
        url: actionData.url,
        userName: this._currentUserName,
        timestamp: (new Date()).toISOString()
      });
    },

    /**
     * Handle AddedPage action by updating the store state.
     *
     * @note If actionData.url already exists in the store, it will not
     * be added a second time.
     */
    addedPage(actionData) {
      if (this._hasPageForUrl(actionData.url)) {
        return;
      }

      let page = {
        id: actionData.pageId,
        title: actionData.title,
        thumbnail_img: actionData.thumbnail_img,
        url: actionData.url,
        userName: actionData.userName,
        timestamp: actionData.timestamp
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
    },

    /**
     * Check whether this store already contains this URL.  Note that
     * we currently use an exact string compare for this.
     *
     * XXX akita we might want to consider switching to something less strict
     * if it makes sense from a product standpoint.
     *
     * @param {String} url - the thing we're looking for
     * @return {Boolean}
     */
    _hasPageForUrl(url) {
      let pages = this._storeState.pages;
      pages = pages.filter(page =>
        page.url === url
      );

      if (pages.length === 1) {
        return true;
      }

      // the store is corrupt
      if (pages.length > 1) {
        throw new Error("Page store contains mutiple pages with the same URL");
      }

      return false;
    },

    /**
     * Handle updateRoomInfo action.  Used to add the first URL to the
     * PageStore.
     */
    updateRoomInfo(actionData) {
      if (!("roomContextUrls" in actionData)) {
        console.warn("this room doesn't have a context url!");
        return;
      }

      // XXX do we really care about multiple context urls?  I suspect
      // we don't.
      let firstContextUrl = actionData.roomContextUrls[0];

      if (this._hasPageForUrl(firstContextUrl.location)) {
        return;
      }

      let thumbnail_img;
      loop.shared.utils.getPageMetadata(firstContextUrl.location).then(result => {
        thumbnail_img = result.thumbnail_img;
      }).catch(() => {
        // fall back to the thing in firstContextUrl
        thumbnail_img = firstContextUrl.thumbnail;
      }).then(() => {
        // XXX akita (bug 1281066) we should not do this in the then,
        // but instead should immediately both dispatch an AddPage to add the
        // page quickly, and then start a getPageMetadata(), which, upon
        // resolution, will call a (to-be-written) dataDriver.updatePage.
        // As part of that bug, we need to also test that this dispatchAction
        // actually fires; there's an it.skip in UpdateRoomInfo for this test.
        this.dispatchAction(new sharedActions.AddPage({
              title: firstContextUrl.description,
              thumbnail_img: thumbnail_img,
              url: firstContextUrl.location
            }));
      });
    }
  });

  return PageStore;
}(navigator.mozL10n || document.mozL10n);
