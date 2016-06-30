#! /bin/bash -vex

# This file is based on
# https://dxr.mozilla.org/mozilla-central/source/taskcluster/scripts/tester/test-linux.sh
# We have our own version of it, as we don't need the mozharness setup.

set -x -e

# Inputs, with defaults

: NEED_XVFB            ${NEED_XVFB:=true}
: NEED_WINDOW_MANAGER  ${NEED_WINDOW_MANAGER:=false}
: START_VNC            ${START_VNC:=false}

# TODO: when bug 1093833 is solved and tasks can run as non-root, reduce this
# to a simple fail-if-root check
if [ $(id -u) = 0 ]; then
    chown -R worker:worker /home/worker
    # drop privileges by re-running this script
    exec sudo -E -u worker bash /home/worker/bin/setup.sh "${@}"
fi

fail() {
    echo # make sure error message is on a new line
    echo "[setup.sh:error]" "${@}"
    exit 1
}

####
# Now get the test-linux.sh script from the given Gecko tree and run it with
# the same arguments.
####

mkdir -p ~/artifacts/public

# run XVfb in the background, if necessary
if $NEED_XVFB; then
    Xvfb :0 -nolisten tcp -screen 0 1600x1200x24 \
       > ~/artifacts/public/xvfb.log 2>&1 &
    export DISPLAY=:0
    xvfb_pid=$!
    # Only error code 255 matters, because it signifies that no
    # display could be opened. As long as we can open the display
    # tests should work. We'll retry a few times with a sleep before
    # failing.
    retry_count=0
    max_retries=2
    xvfb_test=0
    until [ $retry_count -gt $max_retries ]; do
        xvinfo || xvfb_test=$?
        if [ $xvfb_test != 255 ]; then
            retry_count=$(($max_retries + 1))
        else
            retry_count=$(($retry_count + 1))
            echo "Failed to start Xvfb, retry: $retry_count"
            sleep 2
        fi
    done
    if [ $xvfb_test == 255 ]; then fail "xvfb did not start properly"; fi
fi

if $START_VNC; then
    x11vnc --usepw -forever > ~/artifacts/public/x11vnc.log 2>&1 &
fi

if $NEED_WINDOW_MANAGER; then
    # This is read by xsession to select the window manager
    echo DESKTOP_SESSION=ubuntu > /home/worker/.xsessionrc

    # note that doing anything with this display before running Xsession will cause sadness (like,
    # crashes in compiz). Make sure that X has enough time to start
    sleep 15
    # DISPLAY has already been set above
    # XXX: it would be ideal to add a semaphore logic to make sure that the
    # window manager is ready
    /etc/X11/Xsession 2>&1 &

    # Turn off the screen saver and screen locking
    gsettings set org.gnome.desktop.screensaver idle-activation-enabled false
    gsettings set org.gnome.desktop.screensaver lock-enabled false
    gsettings set org.gnome.desktop.screensaver lock-delay 3600
    # Disable the screen saver
    xset s off s reset
fi

[ -d $WORKSPACE ] || mkdir -p $WORKSPACE
cd $WORKSPACE

