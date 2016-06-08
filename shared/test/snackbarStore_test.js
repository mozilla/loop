/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

describe("loop.store.SnackbarStore", () => {
  "use strict";

  let { expect } = chai;
  let { actions } = loop.shared;
  let sandbox, dispatcher, store;

  beforeEach(() => {
    sandbox = LoopMochaUtils.createSandbox();

    dispatcher = new loop.Dispatcher();
    sandbox.stub(dispatcher, "dispatch");

    store = new loop.store.SnackbarStore(dispatcher);
  });

  afterEach(() => {
    sandbox.restore();
    LoopMochaUtils.restore();
  });

  describe("#getInitialStoreState", () => {
    it("should return an object with a property called label", () => {
      let initialState = store.getInitialStoreState();

      expect(initialState.label).eql("");
    });
  });

  describe("showSnackbar", () => {
    it("should update the label for the snackbar", () => {
      let action = new actions.ShowSnackbar({
        label: "fakeLabel"
      });

      store.showSnackbar(action);

      expect(store.getStoreState("label")).eql("fakeLabel");
    });
  });
});
