#!/bin/sh

set -v

echo $1

cd built/
if [ -f $1 ]; then
  rm $1
fi

cd $2
zip -r ../$1 .
