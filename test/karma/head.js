/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

document.body.appendChild(document.createElement("div")).id = "fixtures";
console.log("[head.js] div#fixtures added to attach DOM elements");

// Trap any errors and warnings that are raised in preperation
// for a later call to addErrorCheckingTests in tail.js.
LoopMochaUtils.trapErrors();
