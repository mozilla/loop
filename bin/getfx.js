#!/usr/bin/env node
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

/**
 * A small helper script to find the binary executable based on a short version
 * of the binary name, e.g. "nightly", "aurora", "beta", "firefox".
 */
var Commander = require("commander");
var FxRunnerUtils = require("fx-runner/lib/utils");
var Version = require("../package.json").version;
var Fs = require("fs-promise");

Commander
  .version(Version)
  .option("-b, --binary <path>", "Path of Firefox binary to use or one to find\n" +
    "e.g. nightly, aurora, beta, firefox")
  .parse(process.argv);

FxRunnerUtils.normalizeBinary(Commander.binary).then(function(binary) {
  Fs.stat(binary).then(function() {
    console.log(binary);
  }).catch(function(ex) {
    if (ex.code === "ENOENT") {
      console.error("Could not find " + binary);
    } else {
      console.error(ex);
    }
    process.exit(1);
  });
});
