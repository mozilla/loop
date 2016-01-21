This is the development repository for Firefox Hello, codenamed Loop. For
background information on Loop, please see our
[wiki page](https://wiki.mozilla.org/Loop). Loop is developed in two parts:

1. As an add-on that is then incorporated and shipped as a built-in part of
Firefox desktop. This provides a toolbar button, a panel, and a conversation
window.
2. As a web page (aka standalone client or link-clicker), that runs on its own
web server.

Running
=======

First you must build the project.  Note currently the build process has only
been tested/maintained on Mac/Linux systems.  Assuming you have a compiler,
all the normal Unix command-line utilities, and have installed Node and npm,
you can run:

```shell
$ make build
```

If this succeeds you can start Firefox with the add-on installed, like:

```shell
$ ./bin/runfx.js -b nightly -p ./loop-dev/
```

**One time only**: This will use a new profile created in a `./loop-dev/`
directory.  When Firefox opens you must go to the URL `about:config` and
look for the setting `xpinstall.signatures.required`.  This must be set to
**false**.  Then go to
**Tools &gt; Add-ons** and find the Firefox Hello addon.  You must manually
re-enable the add-on.

Issues
======

Please file bugs in the "Hello (Loop)" product within
[Mozilla's bugzilla](https://bugzilla.mozilla.org). It is useful if you first
[search](https://bugzilla.mozilla.org/query.cgi?query_format=advanced&product=Hello%20%28Loop%29&resolution=---)
for an existing issue before filing [a new one](https://bugzilla.mozilla.org/enter_bug.cgi?form_name=enter_bug&product=Hello%20%28Loop%29).

Contributing
============

Please see the [Contributing](CONTRIBUTING.md) documentation before
submitting a pull request.

Other Documentation
===================

* [Release instructions](docs/Releases.md)
