const debugLogger = require('debug');
const chalk = require('chalk');
const isWin = process.platform === 'win32';

/**
 *
 * @typedef {{(...args: any[]): void}} LoggerFunction
 * @typedef {{
 * 	log: LoggerFunction,
 * 	warning: LoggerFunction,
 * 	error: LoggerFunction,
 * 	success: LoggerFunction,
 * 	info: LoggerFunction,
 * 	debug: LoggerFunction,
 * 	Highlight: LoggerFunction,
 * 	CheckMark: string,
 * 	XMark: string,
 * 	InfoMark: string}} Logger
 */

/**
 *
 * @param {string} name
 * @returns {Logger}
 */
function createLogger(name) {
	const CheckMark = isWin ? '' : chalk.green('√ ');
	const XMark = isWin ? '' : chalk.red('✗ ');
	const InfoMark = isWin ? '' : chalk.blueBright('🛈 ');
	const Highlight = (...args) => chalk.underline.italic(...args);

	const log = (...args) => console.log(chalk.whiteBright(...args));
	const warning = (...args) => console.log(`${XMark}${chalk.yellow(...args)}`);
	const error = (...args) => console.log(`${XMark}${chalk.red(...args)}`);
	const success = (...args) => log(`${CheckMark}${args}`);
	const info = (...args) => log(`${InfoMark}${args}`);
	const debug = debugLogger(name);

	return {
		log,
		warning,
		error,
		success,
		info,
		debug,
		Highlight,
		CheckMark,
		XMark,
		InfoMark,
	};
}

module.exports = createLogger('stacker');
