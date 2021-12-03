#!/usr/bin/env node
const arg = require('arg');
const { newStack } = require('../src/commands/new');
const { add } = require('../src/commands/add');
const { go } = require('../src/commands/go');
const { setup } = require('../src/utils/setup');
const { isLoggedIn } = require('../src/utils/git');
const logger = require('../src/utils/logger');

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
			logger.warning(
				`In order to use Stacker, please login to Github by running ${logger.Highlight(
					'gh auth login'
				)}`
			);
			process.exit(0);
		}
		if (args['--usage']) {
			usage();
		} else if (args['--version']) {
			const pkg = require('../package.json');
			logger.info(`Stacker v${pkg.version}`);
		} else if (args['--new']) {
			newStack();
		} else if (args['--add']) {
			add();
		} else if (args['--go']) {
			go(args['--go']);
		} else if (args['--list']) {
			logger.warning('Not implemented');
		}
	})();
} catch (e) {
	logger.warning('Unknown command.');
	usage();
}

function usage() {
	logger.log(
		`
  --version
  --new\t\tcreate a new PR Stack
  --add\t\tcreate a new PR Stack Item
  --go [NUMBER|main]\tjump to an item number branch or the main branch
  `
	);
}
