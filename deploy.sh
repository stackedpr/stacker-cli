#!/bin/sh
set -eo pipefail

npm version patch
VERSION=`cat package.json | jq -r .version`
npm run build
cp builds/stacker-macos ../homebrew-stacker/stacker
rm -rf builds
cd ../homebrew-stacker
tar -czvf stacker-v$VERSION.tar.gz stacker
rm stacker
SHA=`shasum -a 256 stacker-v$VERSION.tar.gz`
now
rm stacker-v$VERSION.tar.gz
echo "Replace Values in Formula:"
echo "$SHA"