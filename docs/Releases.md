# Releases

This is a description of how we create the various releases for Loop. You only
need to read it if you're doing a release, although it might be of interest for
others.

## TODO

This document is still largely a WIP. Some parts have only been tested once,
some parts will move to automation.

Things still to be documented:

* Beta -> full Release details.
* Setting up a Beta release.
* Releasing to users.

## There are three different kinds of releases

* Real - intended for landing in mozilla-central as system add-on and updating standalone production server
* Beta - intended for regular users of AMO to get semi-stable releases of the add-on, while pointing to the production (stable) standalone server.
* Dev - intended for localizers, developers, and early-adopters who want to live on the bleeding edge.  Add-on intended to be automatically deployed to AMO dev channel once a week-ish (currently a manual process)
  * For developer deployments, see [Automatic Dev Deploys](AutomaticDevDeploys.md).

## Creating a Release

There are various parts to creating a release:

* [Ensure repositories are setup](#repository-setup)
* [Merge latest l10n code](#merge-latest-l10n-code)
* [Merge required changes](#merge-to-release) to the release branch
* [Test it](#testing-before-release)
* [Tag the release](#tagging-a-release)
* Ship to one or all of:
  * [Standalone](#shipping-standalone-web-pages-andor-mozilla-central)
  * [mozilla-central](#shipping-standalone-web-pages-andor-mozilla-central)
  * [AMO](#shipping-to-amo)
* [Update version number of master](#bumping-version-number-of-master)

### Repository setup

The processes below assume that the main repositories are all in one directory,
as listed below:

* loop
  * This repository.
  * Remote: `origin` a user's fork of the repo
  * Remote: `upstream` to the master repo, https://github.com/mozilla/loop
* loop-client-l10n
  * The l10n repository
  * Remote: `origin` to the master repo, https://github.com/mozilla/loop-client-l10n
* gecko-dev
  * The [github mirror of mozilla-central](https://github.com/mozilla/gecko-dev).
  Only needed for export to mozilla-central.
* fx-team
  * The [mercurial integration branch for mozilla-central](https://hg.mozilla.org/integration/fx-team/).
  Only needed for export to mozilla-central.

### Merge latest L10n code

```shell
$ git checkout master
$ git pull upstream master
$ # Pull in latest locale code.
$ make update_locale
$ # Check the diffs.
$ git diff
$ # Add any new locales/remove old ones...
$ git status
$ # ...and relevant commands.
$ # Run tests just in case...
$ make test
$ # Now commit the result with the commit message suggested at the
$ # end of make update_locale
$ git commit -m "<suggest commit message>" -a
$ git push upstream master
```

### Merge to release

Generally for releases, we like to cut them from the latest version of master,
without any changes. However, sometimes this isn't possible, and in that case,
we generally apply these rules:

* If only one or two changes are required, cherry-pick them from master.
* If most is required, but something needs backing out, merge to the release branch
and then do explicit backouts.

To merge the latest to release:

```shell
$ git checkout master
$ git pull upstream master
$ git checkout release
$ git pull upstream release
$ # Now do the merge
$ git merge master
$ #
$ # If there are conflicts, fix the diffs, then run tests and commit.
$ #
$ make test
$ git commit -m "Merge branch 'master' into release" -a
$ # Don't push at this stage, until you're sure you are ready to tag.
```

### Testing before release

* First run automated tests:

```shell
$ make distclean
$ make build
$ make test
```

* Now run some manual tests:
  * Use the standalone server: `make distserver`
  * Run the add-on from the repo using `make runfx`
  * Check the add-on works in the browser.
  * Check a link can be generated and passed to another client.
  * Check two Firefox clients can connect.
  * Check a link-clicker in Google Chrome can connect.
  * Check text chat/pointer sharing work correctly.
* The add-on should be tested at a minimum in the release version of
Firefox, as well as the nightly version. Ideally, versions in-between as well.

### Tagging a release

Decide on the type of version bump, e.g. major or minor, then use npm to bump
the versions (automated scripts are setup for npm)

```shell
$ npm version minor
$ git push upstream release
$ # Push the tag, if the version is 0.3.0, then the tag will be v0.3.0
$ git push upstream <tag>
```

### Shipping standalone web pages and/or mozilla-central

Both the standalone web pages, and shipping to mozilla-central may be done via
one script.

Prerequisites:
* The version to release has been tagged, and the tags pushed to the main loop repo.
  * The tag is assumed to be in the format `v1.1.1` as created by `npm version`
* A bugzilla account and API key
* A git repo for fx-team
  * git-cinnibar is recommended, especially for using the faster artifact builds.

Running the script:

This will run it against the development bugzilla instance. To run against production
add the argument `--prod`.

```shell
$ ./bin/create_releases.py --username <bugzilla username> --apikey <bugzilla api key> \
    --rel-version <release version> --mozilla-central-repo ../fx-team-git \
    --irc-nick coolperson
```

The script will check the tag and your login for bugzilla, and then it will prompt
for what to release.

#### Shipping standalone

When asked for the previous release version, this should be the previous release
to *standalone*, not necessarily the previous tag.

```shell
Release standalone?
(y/n): y
Creating a bug for standalone
Please enter the previous release version:
1.2.5
Please enter required timescales, e.g.:
We'd like this to be deployed to production this week please, assuming no issues found.
--> No particular requirement, as soon as reasonably possible.
```

Once entered, the script will create a bug, the id and url will be output.

You will then need to co-ordinate with QA and Cloud Services ops to get them to
do the release to staging, then to production. It is advisable to cc them on the
bug.

#### Shipping mozilla-central.

Note: as part of its work, the script will do a build, followed by a test run
to ensure there are no obvious errors with the release.

```shell
Release to mozilla-central
(y/n): y
Exporting to m-c
Push result to try (assumes git-cinnibar)?
(y/n): n
Checking out default
Creating new branch for version 1.3.2
Doing a git export...
```

Follow by lots of build and test output.

If the tests fail, you will need to reset the git repo, and delete the temporary
branch:

```shell
fx-team-git$ git reset --hard HEAD
fx-team-git$ git clean -f browser/extensions/loop
fx-team-git$ git checkout master
fx-team-git$ git branch -D <version number>
```

If asked about what files to attach, just exit the editor.

When successful the script ends with:

```shell
Filing bug...
Bug id is: 1154362
Attaching patch to bug
runProcess  ['git-bz', 'attach', '-n', 'bugzilla-dev.allizom.org:1154362', 'HEAD']
Attached Bug-1154362---Land-version-132-of-the-Loop-system-.patch
Done, please:
- Check the diffs in the bug
- Add r+ as the review flag
- Merge branch 1.3.2 and push to fx-team
```

Do what the script says to get the patch pushed to fx-team. If it then lands
successfully, sheriffs will typically merge it to mozilla-central within about
24 hours.

### Shipping to AMO

Note: This only works for versions being released as "full" versions on AMO.
Uploading to the developer channel doesn't currently work.

Note: Obviously, this will only work for owners of the add-on.

```shell
$ make distclean
$ make dist
$ # At this point, its a good idea to re-verify the dist xpi, then:
$ make upload_xpi
```

Output will be similar to:

```
JPM [info] Signing XPI: ./dist/loop@mozilla.org.xpi
Validating add-on [......................................................................................................................]
JPM [info] Validation results: <url>
JPM [info] Your add-on has been submitted for review. It passed validation but could not be automatically signed because this is a listed add-on.
JPM [info] FAIL
```

Then:

* In AMO, copy the notes for reviewers for the new version from the previous version.
* Add any release notes wanted.
* Next, send an email to the special address to get it approved.

### Bumping Version Number of `master`

Whenever a release is made, we bump the version number of master. The version of
master should always finish with `-alpha`.

To bump the version number:

```shell
$ # Checkout and update master according to your standard practice.
$ # Then run this command, which will run tests and bump the version numbers:
$ npm --no-git-tag-version version <version>-alpha
$ # If successful, commit the result
$ git commit -m "chore(package): Update master version following <version> release." -a
$ # Then push the result to the repo
```

Where `<version>` is the version of the add-on just released.

Note: We don't tag alpha versions on `master`, hence the `--no-git-tag-version`
