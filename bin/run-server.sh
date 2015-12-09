#!/bin/bash

# Script forked from a pageshot run-server script (Also MPL).
#

set -e
bin="$(dirname $BASH_SOURCE)"
cd $bin/..
export NODE_ENV=dev
PATH="node_modules/.bin:$PATH"

if [[ ! -e "node_modules/.bin/nodemon" ]] ; then
  echo "Installing node packages..."
  npm install
fi

run () {
  time make build # used to speed up  the build
  node $bin/server.js
}

help () {
  echo "Usage: $(basename $0) [--forever|-f]"
  echo "  Run the server"
  echo "    --no-auto"
  echo "      Do not look for changes to the server and rebuild/restart"
}
no_auto=
restart=

while [ -n "$1" ] ; do
  case "$1" in
    help|-h|--help)
      help
      exit
      ;;
    --no-auto)
      no_auto=1
      shift
      ;;
    --restart)
      # Hidden option for use by nodemon
      restart=1
      no_auto=1
      shift
      ;;
    *)
      help
      exit 2
      ;;
  esac
done

if [[ -z "$no_auto" ]] ; then
  nodemon \
    -w add-on -w shared -w standalone -w ui \
    -w Makefile \
    -w bin \
    -e .js,.jsx,.css,.png,.svg,.sh \
    --exec bash $0 -- --restart
else
  run
fi
