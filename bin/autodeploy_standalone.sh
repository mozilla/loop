#!/bin/bash

if [ "$#" -ne 2 ]; then
  cat <<USAGE_END
  Usage: autodeploy_standalone.sh <BASEDIR> <BRANCH>

  A script to automatically deploy the latest version of the loop standalone
  server, with latest localisations from loop-client-l10n.

  This is designed to be run from a crontab somewhere.

  WARNING: Running this script will undo any uncommitted changes in the loop
  repository, and remove any uncommitted files.

  It will leave also leave uncommitted updates to the locale files in your
  loop repository. These can be undone with "git reset --hard HEAD" if necessary.

  The script expectes the following repository setup:
    <BASEDIR>/loop - A clone of https://github.com/mozilla/loop
    <BASEDIR>/loop-client-l10n - A clone of https://github.com/mozilla/loop-client-l10n

  It also expects:
    <BASEDIR>/loop-config.js - The config file to publish for the standalone.

  It will produce a complete standalone into:
    <BASEDIR>/loop-standalone

USAGE_END
  exit 1;
fi

# Causes script to abort immediately if error code is not checked.
set -e

BASEDIR=$1
BRANCH=$2

env

cd ${BASEDIR}/loop-client-l10n
git pull origin master

cd ${BASEDIR}/loop
# Reset the repo (due to previous round of l10n imports).
git reset --hard HEAD
git clean -f

# Now pull latest...
git pull origin $BRANCH

make install

# ...merge L10n...
make update_locale

# ...and build it.
make dist_standalone

echo Copying...

cp ${BASEDIR}/loop-config.js ${BASEDIR}/loop/dist/standalone/config.js
/usr/bin/rsync --archive ${BASEDIR}/loop/dist/standalone/ ${BASEDIR}/loop-standalone/

echo Done
