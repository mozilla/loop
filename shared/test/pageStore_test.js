/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

describe("loop.store.PageStore", () => {
  "use strict";

  let { expect } = chai;
  let { actions } = loop.shared;
  let dispatcher,
      fakeDataDriver,
      fakePageMetadata,
      fakeStoredPage,
      sandbox,
      clock,
      store;

  beforeEach(() => {
    sandbox = LoopMochaUtils.createSandbox();
    clock = sandbox.useFakeTimers();

    dispatcher = new loop.Dispatcher();
    sandbox.stub(dispatcher, "dispatch");

    fakeDataDriver = {
      addPage: sinon.stub(),
      deletePage: sinon.stub()
    };

    fakePageMetadata = {
      title: "fakeTitle",
      thumbnail_img: "fakeThumbnail",
      url: "someFakeUrl"
    };

    fakeStoredPage =
      Object.assign({ id: "fakeId", username: "fakeUserName" },
                    fakePageMetadata);

    store = new loop.store.PageStore(dispatcher, {
      dataDriver: fakeDataDriver
    });

    sandbox.stub(document.mozL10n ? document.mozL10n : navigator.mozL10n, "get", function(x) {
      return x;
    });
  });

  afterEach(() => {
    sandbox.restore();
    LoopMochaUtils.restore();
  });

  describe("#getInitialStoreState", () => {
    it("should return an object with a property called pages", () => {
      let initialState = store.getInitialStoreState();

      expect(initialState.pages).not.eql(null);
      expect(initialState.pages).to.have.lengthOf(0);
    });
  });

  describe("setOwnDisplayName", () => {
    it("should update user name", () => {
      let action = new actions.SetOwnDisplayName({
        displayName: "user name"
      });
      store.setOwnDisplayName(action);

      expect(store._currentUserName).eql("user name");
    });
  });

  describe("AddPage", () => {
    beforeEach(() => {
      store._currentUserName = "user name";
      clock.tick(362790000000);
    });

    afterEach(function() {
      clock.restore();
    });

    it("should include the user name in page data", () => {
      let pageObject = {
        metadata: {
          title: fakePageMetadata.title,
          thumbnail_img: fakePageMetadata.thumbnail_img,
          url: fakePageMetadata.url
        },
        added_by: store._currentUserName,
        added_time: Date.now()
      };

      store.addPage(new actions.AddPage(fakePageMetadata));

      sinon.assert.calledOnce(fakeDataDriver.addPage);
      sinon.assert.calledWithExactly(fakeDataDriver.addPage, pageObject);
    });

    it("should not call dataDriver.addPage if URL is already added", () => {
      let pages = store.getStoreState("pages");
      pages.push(fakeStoredPage);
      store.setStoreState({ pages });

      store.addPage(new actions.AddPage(fakePageMetadata));

      sinon.assert.notCalled(fakeDataDriver.addPage);
    });
  });

  describe("AddedPage", () => {
    let action;

    beforeEach(() => {
      action = new actions.AddedPage({
        pageId: "fakeId",
        added_time: 1401318000000,
        metadata: {
          title: "fakeTitle",
          thumbnail_img: "fakeThumbnail",
          url: "fakeUrl"
        },
        added_by: "fake user"
      });

      sandbox.stub(store, "fetchPageMetadata");
    });

    it("should add a page to the store", () => {
      store.addedPage(action);

      expect(store.getStoreState("pages")).to.have.lengthOf(1);
    });

    it("should call fetchPageMetadata with the correct args", () => {
      store.addedPage(action);

      sinon.assert.calledOnce(store.fetchPageMetadata);
      sinon.assert.calledWithExactly(store.fetchPageMetadata, action);
    });

    it("should not add a second copy of a URL to the page store", () => {
      let action2 = new actions.AddedPage({
        pageId: "fakeId2",
        added_time: 1401319000000,
        metadata: {
          title: "fakeTitle2",
          thumbnail_img: "fakeThumbnail2",
          url: "fakeUrl"
        },
        added_by: "fake user2"
      });

      store.addedPage(action);
      store.addedPage(action2);

      expect(store.getStoreState("pages")).to.have.lengthOf(1);
    });
  });

  describe("UpdatePage", () => {
    beforeEach(() => {
      let pages = [{ id: "fakeId" }];
      sandbox.stub(store, "getStoreState").withArgs("pages").returns(pages);
      sandbox.stub(store, "setStoreState");
    });

    it("should correctly update page matching the id", () => {
      let updatedPage = {
        pageId: "fakeId",
        thumbnail_img: "fakeThumb",
        title: "fakeTitle"
      };

      store.updatePage(new actions.UpdatePage(updatedPage));

      let newPages = store.getStoreState("pages");
      expect(newPages).to.be.a("array");
      expect(newPages.length).to.eql(1);
      // Can't compare objects. Object method "id/pageId" is different.
      expect(newPages[0].thumbnail_img).to.eql(updatedPage.thumbnail_img);
      expect(newPages[0].title).to.eql(updatedPage.title);
    });
  });

  describe("DeletePage", () => {
    beforeEach(function() {
      store._currentUserName = "user name";
    });

    it("should get the page deleted", () => {
      let action = new actions.DeletePage({
        pageId: "fakeId"
      });
      store.deletePage(action);

      sinon.assert.calledOnce(fakeDataDriver.deletePage);
      sinon.assert.calledWithExactly(fakeDataDriver.deletePage, "fakeId",
                                                                "user name");
    });
  });

  describe("DeletedPage", () => {
    let action;

    beforeEach(() => {
      let pages = store.getStoreState("pages");
      pages.push(fakeStoredPage);
      store.setStoreState({ pages });

      action = new actions.DeletedPage({
        added_by: "the user",
        added_time: Date.now(),
        pageId: "fakeId",
        metadata: {},
        deleted: {}
      });
    });

    it("should remove a page from the store", () => {

      expect(store.getStoreState("pages")).to.have.lengthOf(1);
      store.deletedPage(action);

      expect(store.getStoreState("pages")).to.have.lengthOf(0);
    });

    it("should dispatch a `ShowSnackbar` action", () => {

      store.deletedPage(action);

      sinon.assert.called(dispatcher.dispatch);
      sinon.assert.calledWithExactly(dispatcher.dispatch,
        new actions.ShowSnackbar({
          label: "snackbar_page_deleted"
        }));
    });

    it("should not dispatch a `ShowSnackbar` action if no page was deleted", () => {
      action.pageId = "ID_NotInStore";

      store.deletedPage(action);

      sinon.assert.notCalled(dispatcher.dispatch);
    });
  });

  describe("fetchPageMetadata", () => {
    let actionData;
    let response;

    beforeEach(() => {
      actionData = {
        pageId: "fakeId",
        metadata: {
          url: "http://fakeurl.com",
          title: "faketitle",
          thumbnail_img: "fakethumb"
        }
      };

      response = {
        title: "fake title",
        thumbnail_img: "fake thumb"
      };

      sandbox.stub(loop.shared.utils, "getPageMetadata", url => {
        if (url === actionData.metadata.url) {
          return Promise.resolve(response);
        }

        return {
          then: function() {
            return {
              catch: function(cb) {
                cb();
              }
            };
          }
        };
      });
    });

    it("should dispatch UpdatePage with results", () => {
      store.fetchPageMetadata(actionData);

      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWithExactly(dispatcher.dispatch,
        new actions.UpdatePage({
          pageId: actionData.pageId,
          thumbnail_img: response.thumbnail_img,
          title: response.title
        }));
    });

    it("should dispatch UpdatePage with fallback", () => {
      var fakeActionData = _.cloneDeep(actionData);
      fakeActionData.metadata.url = "http://differentFakeURL.com";
      store.fetchPageMetadata(fakeActionData);

      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWithExactly(dispatcher.dispatch,
        new actions.UpdatePage({
          pageId: actionData.pageId,
          thumbnail_img: actionData.metadata.thumbnail_img,
          title: actionData.metadata.title
        }));
    });
  });

  describe("UpdateRoomInfo", () => {
    let contextUrl;
    let actionData;

    beforeEach(() => {
      contextUrl = {
        pageId: "fakeId2",
        title: "fakeTitle2",
        thumbnail: "fakeThumbnail2",
        url: "fakeUrl",
        description: "fake description",
        location: "fake location"
      };
      actionData = {
        roomContextUrls: [contextUrl]
      };
    });

    it("should dispatch AddPage with correct args", () => {
      store.updateRoomInfo(actionData);

      sinon.assert.calledOnce(dispatcher.dispatch);
      sinon.assert.calledWithExactly(dispatcher.dispatch,
        new actions.AddPage({
          title: contextUrl.description,
          thumbnail_img: contextUrl.thumbnail,
          url: contextUrl.location
        }));
    });
  });
});
