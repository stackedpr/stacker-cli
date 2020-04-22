#!/usr/bin/env node
const arg = require('arg');
const { start } = require('../src/commands/start');
const { next } = require('../src/commands/next');
const { setup } = require('../src/utils/setup');
const args = arg({
  '--start': Boolean,
  '--next': Boolean,
});

setup();

if (args['--start']) {
  start();
} else if (args['--next']) {
  next();
}
