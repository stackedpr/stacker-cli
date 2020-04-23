#!/usr/bin/env node
const arg = require('arg');
const { start } = require('../src/commands/start');
const { next } = require('../src/commands/next');
const { go } = require('../src/commands/go');
const { setup } = require('../src/utils/setup');
const args = arg({
  '--start': Boolean,
  '--next': Boolean,
  '--go': String,
  '--list': Boolean,
});

setup();

if (args['--start']) {
  start();
} else if (args['--next']) {
  next();
} else if (args['--go']) {
  go(args['--go']);
} else if (args['--list']) {
  console.log('Not implemented');
}
