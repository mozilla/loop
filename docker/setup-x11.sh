#!/bin/bash -e

Xvfb :0 -nolisten tcp -screen 0 1600x1200x24 \
  > ~/artifacts/public/xvfb.log 2>&1 &

sleep 3

export DISPLAY=:0
#xvfb_pid=$!
# Only error code 255 matters, because it signifies that no
# display could be opened. As long as we can open the display
# tests should work. We'll retry a few times with a sleep before
# failing.
#retry_count=0
#max_retries=2
#xvfb_test=0
#until [ $retry_count -gt $max_retries ]; do
#    xvinfo || xvfb_test=$?
#    if [ $xvfb_test != 255 ]; then
#        retry_count=$(($max_retries + 1))
#    else
#        retry_count=$(($retry_count + 1))
#        echo "Failed to start Xvfb, retry: $retry_count"
#        sleep 2
#    fi
#done
#if [ $xvfb_test == 255 ]; then fail "xvfb did not start properly"; fi

x11vnc > ~/artifacts/public/x11vnc.log 2>&1 &
