/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

describe("loop.store.PageStore", () => {
  "use strict";

  let { expect } = chai;
  let { actions } = loop.shared;
  let dispatcher, fakeDataDriver, sandbox, store;

  beforeEach(() => {
    sandbox = LoopMochaUtils.createSandbox();

    dispatcher = new loop.Dispatcher();
    sandbox.stub(dispatcher, "dispatch");

    fakeDataDriver = {
      addPage: sinon.stub(),
      deletePage: sinon.stub()
    };

    store = new loop.store.PageStore(dispatcher, {
      dataDriver: fakeDataDriver
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
    });

    it("should include the user name in page data", () => {
      let metadata = {
        title: "fakeTitle",
        thumbnail_img: "fakeThumbnail",
        url: "fakeUrl"
      };
      let action = new actions.AddPage(metadata);
      store.addPage(action);

      sinon.assert.calledOnce(fakeDataDriver.addPage);
      sinon.assert.calledWithExactly(fakeDataDriver.addPage, Object.assign(
        { userName: "user name" }, metadata));
    });
  });

  describe("AddedPage", () => {
    it("should add a page to the store", () => {
      let action = new actions.AddedPage({
        pageId: "fakeId",
        title: "fakeTitle",
        thumbnail_img: "fakeThumbnail",
        url: "fakeUrl",
        userName: "fake user"
      });
      store.addedPage(action);

      expect(store.getStoreState("pages")).to.have.lengthOf(1);
    });
  });

  describe("DeletePage", () => {
    it("should get the page deleted", () => {
      let action = new actions.DeletePage({
        pageId: "fakeId"
      });
      store.deletePage(action);

      sinon.assert.calledOnce(fakeDataDriver.deletePage);
      sinon.assert.calledWithExactly(fakeDataDriver.deletePage, "fakeId");
    });
  });

  describe("DeletedPage", () => {
    beforeEach(() => {
      let pages = store.getStoreState("pages");
      pages.push({
        id: "fakeId",
        title: "fakeTitle",
        thumbnail_img: "fakeThumbnail",
        url: "fakeUrl",
        userName: "fake user"
      });
      store.setStoreState({ pages });
    });

    it("should remove a page from the store", () => {
      let action = new actions.DeletedPage({
        deletedTime: Date.now(),
        pageId: "fakeId"
      });

      expect(store.getStoreState("pages")).to.have.lengthOf(1);
      store.deletedPage(action);

      expect(store.getStoreState("pages")).to.have.lengthOf(0);
    });
  });
});
