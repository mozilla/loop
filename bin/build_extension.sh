#!/bin/sh

set -v

echo $1

cd $2
if [ -f $1 ]; then
  rm $1
fi

cd $3
zip -r ../$1 .
