/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

// Stop the default init functions running to avoid conflicts in tests.
// The listeners are injected in the global scope as we can't call them direct
// (something's got to kick everything off). Therefore using dependency
// injection for tests is difficult.
if (loop) {
  if (loop.panel) {
    document.removeEventListener("DOMContentLoaded", loop.panel.init);
  }
  if (loop.conversation) {
    document.removeEventListener("DOMContentLoaded", loop.conversation.init);
  }
  if (loop.copy) {
    document.removeEventListener("DOMContentLoaded", loop.copy.init);
  }
  if (loop.slideshow) {
    document.removeEventListener("DOMContentLoaded", loop.slideshow.init);
  }
}

// Test for any errors and warnings that are raised.
LoopMochaUtils.addErrorCheckingTests();
