#!/usr/bin/env node
const arg = require('arg');
const { start } = require('../src/commands/start');
const { next } = require('../src/commands/next');
const { go } = require('../src/commands/go');
const { setup } = require('../src/utils/setup');
try {
  const args = arg({
    '--usage': Boolean,
    '--version': Boolean,
    '--start': Boolean,
    '--next': Boolean,
    '--go': String,
    '--list': Boolean,
  });

  setup();
  if (args['--usage']) {
    usage();
  } else if (args['--version']) {
    const pkg = require('../package.json');
    console.log(`Stacker v${pkg.version}`);
  } else if (args['--start']) {
    start();
  } else if (args['--next']) {
    next();
  } else if (args['--go']) {
    go(args['--go']);
  } else if (args['--list']) {
    console.log('Not implemented');
  }
} catch (e) {
  console.log('Unknown command.');
  usage();
}

function usage() {
  console.log(
    `
  --version
  --start\t\tcreate a new PR Stack
  --next\t\tcreate a new PR Stack Item
  --go [NUMBER|main]\tjump to an item number branch or the main branch
  `
  );
}
