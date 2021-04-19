#!/usr/bin/env node
const arg = require('arg');
const { newStack } = require('../src/commands/new');
const { add } = require('../src/commands/add');
const { go } = require('../src/commands/go');
const { setup } = require('../src/utils/setup');
const { isLoggedIn } = require('../src/utils/git');
try {
	const args = arg({
		'--usage': Boolean,
		'--version': Boolean,
		'--new': Boolean,
		'--add': Boolean,
		'--go': String,
		// '--list': Boolean,
	});

	(async () => {
		setup();

		if ((await isLoggedIn()) === false) {
			console.log('In order to use Stacker, please login to Github by running "gh auth login"');
			process.exit(0);
		}
		if (args['--usage']) {
			usage();
		} else if (args['--version']) {
			const pkg = require('../package.json');
			console.log(`Stacker v${pkg.version}`);
		} else if (args['--new']) {
			newStack();
		} else if (args['--add']) {
			add();
		} else if (args['--go']) {
			go(args['--go']);
		} else if (args['--list']) {
			console.log('Not implemented');
		}
	})();
} catch (e) {
	console.log('Unknown command.');
	usage();
}

function usage() {
	console.log(
		`
  --version
  --new\t\tcreate a new PR Stack
  --add\t\tcreate a new PR Stack Item
  --go [NUMBER|main]\tjump to an item number branch or the main branch
  `
	);
}
