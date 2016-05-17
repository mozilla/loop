These instructions are based on working in a git clone of mozilla-central or fx-team.

If using a mercurial clone, or git cinnibar, then these instructions may need to
be adapted appropraitely.

Prerequisites
=============

* [gecko-dev](https://github.com/mozilla/gecko-dev) is checkout out and
  updated
* Ensure EXPORT_MC_LOCATION in your loop/makefile is set to gecko-dev
* [mozilla-central mercurial repo](http://hg.mozilla.org/mozilla-central/) is
  checked out and setup
* [moz-git-tools](https://github.com/mozilla/moz-git-tools/) is checked out and
  installed on your system
* Make sure .hg/hgrc file in mozilla-central on your local has this addition
  under the "default=":
    * Add (without quotes) "try = ssh://hg.mozilla.org/try”
* At least
  [Level 1 commit access](https://www.mozilla.org/en-US/about/governance/policies/commit/)

Push To Try
============

Commit your local changes

On Local Loop Branch:
```shell
loop$ git commit -m “Bug 123456789 - whatever message you want” .
```

Ensure your gecko-dev branch is updated to the latest. You may wish to create
a new branch for testing these changes.

On gecko-dev/fx-team:
```shell
loop$ cd ../gecko-dev
gecko-dev$ git pull
gecko-dev$ git branch -D testBranch
gecko-dev$ git checkout -b testBranch
```

Build on local and export changes to gecko-dev testBranch

On Local Loop Branch:
```shell
gecko-dev$ cd ../loop
loop$ make build
loop$ make git-export
```

It is advisiable to at least test the changes in the gecko-dev repository before
pushing to try, to avoid wasting builder time on simple issues.

```shell
gecko-dev$ ./mach build
gecko-dev$ # Then test or run, e.g.
gecko-dev$ # ./browser/extensions/loop/run-all-loop-tests.sh
gecko-dev$ # ./mach run ...
```

Update mozilla-central to latest

On mozilla-central:
```shell
loop$ cd ../mozilla-central
mozilla-central$ hg pull
mozilla-central$ hg update -r default
```

Determine which commands to use for try server push and then execute try server push:

* Use http://trychooser.pub.build.mozilla.org/ to get command line for try server push

On gecko-dev/testBranch:
```shell
mozilla-central$ cd ../gecko-dev
gecko-dev$ git commit -m “Test changes for Try server” .
gecko-dev$ git-push-to-try -t -r HEAD ../mozilla-central "-b do -p linux64 -u mochitest-bc,mochitest-e10s-bc -t none"
```
