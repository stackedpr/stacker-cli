const execa = require('execa');
const logger = require('./logger');

async function run(cmd, cwd = process.cwd()) {
	const cmdToRun = cmd.replace(/@EMPTY@/g, '""');
	const { stdout } = await execa.command(cmdToRun, { cwd });
	logger.debug(`output:${stdout}`);
	return stdout;
}

function runSync(cmd, cwd = process.cwd()) {
	const { stdout } = execa.commandSync(cmd, { cwd });
	logger.debug(`output:${stdout}`);
	return stdout;
}

// function buildParams(cmd) {
// 	const params = [];
// 	let shouldConcat = false;
// 	for (let i = 0; i < cmd.length; i++) {
// 		const param = cmd[i];
// 		if (!shouldConcat) {
// 			params.push(param.replace(/"/g, ''));
// 		} else {
// 			params[params.length - 1] += ` ${param.replace(/"/g, '')}`;
// 		}
// 		if (param.indexOf('"') === 0) {
// 			shouldConcat = true;
// 		} else if (param.indexOf('"') === param.length - 1) {
// 			shouldConcat = false;
// 		}
// 	}
// 	return params.map((param) => param.replace(/@EMPTY@/g, ' '));
// }

module.exports = { run, runSync };
