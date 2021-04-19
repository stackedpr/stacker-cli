#!/bin/sh
set -eo pipefail

npm version patch
VERSION=`cat package.json | jq -r .version`
npm run build || { echo "Build Failed!" && exit; }
cp builds/stacker-macos ../homebrew-stacker/stacker
rm -rf builds
cd ../homebrew-stacker
tar -czvf stacker-v$VERSION.tar.gz stacker
rm stacker
SHA=`shasum -a 256 stacker-v$VERSION.tar.gz`
vc
rm stacker-v$VERSION.tar.gz
echo "Replace Values in Formula:"
echo "$SHA"
