Installation
============

You'll need normal unix command-line utilities. Currently the build process has
only been tested/maintained on Mac/Linux systems.

If you want to try it on Windows, then installing [MozillaBuild](https://wiki.mozilla.org/MozillaBuild)
will provide some tools for the command line.

Assuming you have the basic utilities, then you also need:

* [node.js](https://nodejs.org/). Version 0.10 is currently required.
* [Python](https://www.python.org/). Version 2.7 is currently used.
  * [pip](https://pip.pypa.io/en/stable/)
  * [virtualenv](https://pypi.python.org/pypi/virtualenv), installed globally via pip.
* For testing and developing the add-on:
  * Any Firefox build later than 45.0a1, although
    [nightly](https://nightly.mozilla.org/) is typically used by Loop's developers.
* For running tests:
  * [Firefox Release build](https://www.mozilla.org/firefox/all/).
  * [Google Chrome](https://www.google.com/chrome/).

Building
========

You can simply run:

```shell
$ make build
```

You can also automatically rebuild whenever a file is changed. To do this you
can use the command to run the standalone server:

```shell
$ make runserver
```

Running
=======

You may wish to create a fresh profile in which to test and develop the add-on.
To do this use the following command:

```shell
$ /path/to/firefox -createProfile <profilename>
```

(Replace <profilename> with the name of the profile to create).

On Mac you need to reference the firefox executable within the application, e.g.

```shell
$ /Applications/FirefoxNightly.app/Contents/MacOS/firefox -createProfile <profilename>
```

You can then run the add-on with:

```shell
$ ./bin/runfx.js -b nightly -p <profilename>
```

**One time only**: When Firefox opens you must go to the URL `about:config` and
look for the setting `xpinstall.signatures.required`.  This must be set to
**false**.  Then go to
**Tools &gt; Add-ons** and find the Firefox Hello addon.  You must manually
re-enable the add-on.

Testing
=======

To run all tests for the repository, you can use the command:

```shell
$ make test
```

Eslint
------

We use [eslint](http://eslint.org/) to parse the Loop files and check them for
correctness before landing. Eslint can be
[integrated into various editors](http://eslint.org/docs/user-guide/integrations)
to run the checks whilst making changes to the files.

You can run just eslint with

```shell
$ make eslint
```

Unit tests
----------

Our unit tests aim to test each unit of code individually. The tests are written
as HTML pages using [mocha](http://mochajs.org/), [chai](http://chaijs.com/) and
[sinon](http://sinonjs.org/).

The tests are run in the [Karma](http://karma-runner.github.io) harness which
also measures code coverage. We aim for 100% test coverage on new code.

The add-on/panels tests are by default run in Firefox release only. The shared
and standalone tests are run in Firefox and Chrome.

You can run just the karma tests with:

```shell
$ make karma
```

For developing and debugging, the tests can be loaded in a normal web browser.
First make sure you have the standalone server running:

```shell
$ make runserver
```

Then load `http://localhost:3000/test/` in your browser. This will give you links
to the individual test suites.

UI Showcase
-----------

This is a very helpful development tool. It includes views of almost all the
different possible layouts visible in the Loop code, in the desktop and standalone.

This means you can easily develop the layout of the views in a web context, before
trying them within the panel and conversation window of the browser itself.

To view the ui-showcase, you can either visit the link from `http://localhost:3000/test/`
or visit `http://localhost:3000/ui/` direct.

xpcshell and mochitest
----------------------
These are tests for the [chrome](https://developer.mozilla.org/docs/Glossary/Chrome)
modules and files.

**Test Export to Mozilla Central**

The mozilla-central repo is cloned locally and is used as the xpcshell and
mochitest test build. See [the simple Firefox build instructions]
(https://developer.mozilla.org/docs/Mozilla/Developer_guide/Build_Instructions/Simple_Firefox_build)
for setting up a repository for a Firefox build. There is also a
[git-cinnibar](https://github.com/glandium/git-cinnabar) wrapper to allow using git for the repository.

Note: different integration branches may be used, e.g. most of the team develops against `fx-team`

**Resetting mozilla-central repo for pull and export**

If mozilla-central has already been cloned and was used for a previous export and build,
you can reset the repo:
```shell
mozilla-central$ git checkout fx-team
mozilla-central$ git reset --hard HEAD
mozilla-central$ git clean -f
mozilla-central$ git status
```

```shell
mozilla-central$ hg pull
mozilla-central$ hg purge .
mozilla-central$ hg update -r default
```

Once reset, you should not see mozilla-central/browser/extensions/loop/ directory or files.
You can now pull fx-team latest.
```shell
mozilla-central$ git pull
```

```shell
mozilla-central$ hg pull
```

**Git export from loop repo**

You can export from any branch of the repository, but it is generally advised
for it to be based on latest master for running tests.

You can set your default export_mc location by setting the environment variable
EXPORT_MC_LOCATION to the location of your repository. If you do not set the environment variable
it defaults to `../gecko-dev`

```shell
loop$ make export_mc
```

Run status to show the add-on extension directory and files now appear in the mozilla-central repo.

**Building mozilla-central**

It will take some time to build.
```shell
mozilla-central$ ./mach build
```

**Running Tests**

To run all the tests for both XPCShell and Mochitest
```shell
mozilla-central$ ./mach test browser/extensions/loop/chrome/test
```
You can run all tests for XPCShell, Mochitest and specific tests.
```shell
mozilla-central$ ./mach test browser/extensions/loop/chrome/test/xpcshell/
mozilla-central$ ./mach test browser/extensions/loop/chrome/test/xpcshell/loopservice_locales.js
mozilla-central$ ./mach test browser/extensions/loop/chrome/test/mochitest/
mozilla-central$ ./mach test browser/extensions/loop/chrome/test/mochitest/browser_toolbarbutton.js
```

**Updating mozilla-central on code changes**

To update mozilla-central tests from loop you must export_mc again after changes have been made.
```shell
loop$ make export_mc
```
If browser.ini for mochitest changes you must run this in mozilla-central then you can run tests:
```shell
mozilla-central$ ./mach build browser/extensions/loop
```

**Run all tests relevant to Loop**

If you are doing big changes, you might want to run all tests that are known
that could be broken by Loop. To do that, run this command:

```shell
mozilla-central$ sh ./browser/extensions/loop/run-all-loop-tests.sh
```

Testing mochitests on the try server is necessary as some tests may fail on other platforms.
Please see [Push-To-Try.md](docs/Push-To-Try.md) for how to setup and push to Try server.

Functional Tests
----------------

These are tests that verify Loop at a higher level. The basic test is to set up
a room, connect a remote standalone user to it, and check there is two-way video.

The functional tests by default will communicate with a development loop server.

To run the functional tests you can do:

```shell
$ make functional
```

By default the tests run against the dev server (hosted online), using Firefox
Nightly build.

There are various options you can specify as environment variables, e.g.

```shell
$ TEST_BROWSER=aurora make functional
```

The options are:

* `TEST_BROWSER`
  * A branch reference for the type of Firefox to run, e.g. `nightly`, `aurora`,
    `beta` or `firefox`
  * The path to the browser you wish to run the tests against.
* `TEST_SERVER`
  * A reference to the loop-server to use for testing:
    * `local` - use a locally set-up loop-server. Use `LOOP_SERVER` to set the
      file location, it defaults to `../loop-server`.
    * `dev` - use the dev server.
    * `stage` - use the staging server.
    * `prod` - use the production server. Please only use this setting for testing
      releases.
* `USE_LOCAL_STANDALONE`
  * This is by default set to `1` and will use the files from the local repo for
    the standalone part of Loop.
  * If set to `0` this will cause the remote pages associated with the server to
    be tested, e.g. using `stage` with `0` will use the staging loop-server and
    the staging standalone pages.

Standalone UI
=============

The standalone part of Loop (also known as the link-clicker UI) can be viewed in
any web browser, and is hosted on a server. You can hook the development server
up to talk to one of the servers to be able to test changes to the standalone UI.

To do this, setup the standalone server as described above, then rather than a
simple `make runserver`, do:

```shell
$ LOOP_SERVER_URL=https://path/to/server make runserver
```

Replace the server path with one of:

* Development server: https://loop.dev.mozaws.net
* Production server: https://loop.services.mozilla.com

(Generally its better to use the development server than the production one to
avoid affecting the stats of production usage).

For the desktop side (also known as the link-generator) to use the development
server:

* You may wish to create a new profile for testing against different servers
(since changing the pref below will loose your previously created conversations).
See the [Running](#running) section above for how to create a profile and use it.
* Visit about:config, change the loop.server preference to be
https://loop.dev.mozaws.net/v0
* Restart Firefox after changing the pref
* From the Hello panel, select "Browse this page with a friend"
* Copy the url, and paste it into a browser window, but change the url
** https://hello.firefox.com/1234567890a#dfkjekrltykyleoefirek would become
http://localhost:3000//1234567890ab#dfkjekrltykyleoefirek

You should now be able to join the room with that instance.
