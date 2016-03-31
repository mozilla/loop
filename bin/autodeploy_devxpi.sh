#!/bin/bash

if [ "$#" -ne 1 ]; then
  cat <<USAGE_END
  Usage: autodeploy_devxpi.sh <BASEDIR>

  A script to automatically build, and upload to AMO the latest version of the
  loop add-on xpi, including the latest localisations from loop-client-l10n.

  This is designed to be run from a crontab somewhere.

  WARNING: Running this script will undo any uncommitted changes in the loop
  repository.

  It will leave also leave uncommitted updates to the locale files in your
  loop repository. These can be undone with "git reset --hard HEAD" if necessary.

  The script expectes the following repository setup:
    <BASEDIR>/loop - A clone of https://github.com/mozilla/loop
    <BASEDIR>/loop-client-l10n - A clone of https://github.com/mozilla/loop-client-l10n

  This script expects JPM_API_KEY and JPM_API_SECRET to be present in the
  environment. See the upload_xpi command in the Makefile.

USAGE_END
  exit 1;
fi

# Causes script to abort immediately if error code is not checked.
set -e

BASEDIR=$1

env

cd ${BASEDIR}/loop-client-l10n
git pull origin master

cd ${BASEDIR}/loop
# Reset the repo (due to previous round of l10n imports and any other accidental
# mess).
git reset --hard HEAD

# Now pull latest.
git pull origin master

# Clean and install.
make distclean
# This needs quotes for some reason to apparently keep bash happy.
make "install"

# Import the locales.
make update_locale

DEV_XPI=1 make build
DEV_XPI=1 make dist_xpi

# Now upload it.

echo "Uploading. This command will fail with:"
echo "Your add-on has been submitted for review. It passed validation but..."
echo "That error is expected and awaiting a switch to the sign-addon npm module"

make upload_xpi
