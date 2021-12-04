const { run, runSync } = require('./cmd');
const logger = require('./logger');

const gh = process.env.GH_CLI || 'gh';

/**
 *
 * @returns {string | undefined}
 */
function getRepoName() {
	const regex = /(\w+).git\s+/;
	logger.debug(`getting repo name`);
	const stdout = runSync('git remote -v');
	logger.debug(`output:${stdout}`);
	const match = stdout.match(regex);
	if (match) {
		logger.debug(`repo name is: ${match[1]}`);
		return match[1];
	}
	logger.debug(`${logger.XMark} Couldnt find feature name by branch`);
	return;
}

/**
 *
 * @returns {Promise<string>}
 */
async function getBranchName() {
	logger.debug(`getting branch name`);
	return run('git rev-parse --abbrev-ref HEAD');
}

/**
 *
 * @param {string} branch
 * @returns {Promise<string>}
 */
async function getFeatureByBranch(branch) {
	const regex = /\[(.*?)(?: - Part_\d+)?\]/;
	logger.debug(`getting feature by branch name`);
	logger.debug(`regex: ${regex.toString()}`);
	const stdout = await run(`${gh} pr list --json title,headRefName --search head:${branch}`);
	logger.debug(`output:${stdout}`);
	const pr = JSON.parse(stdout).find((pr) => pr.headRefName === branch);
	if (!pr) {
		// warn?
		logger.debug(`no pr found`);
		return '';
	}
	const title = pr.title;
	const match = title.match(regex);
	logger.debug(match);
	if (match) {
		logger.debug(`feature name is: ${match[1]}`);
		return match[1];
	}
	logger.debug(`couldnt find feature name by branch`);
	return '';
}

/**
 *
 * @param {string} base
 * @returns {Promise<Branch>} branch
 */
async function createBranchBasedOn(base) {
	const match = base.match(/(.*)\-(\d+)/);
	let name;
	let number;
	logger.debug(match);
	if (match) {
		const [, featureBranch, index] = match;
		logger.debug(`featureBranch`, featureBranch);
		logger.debug(`index`, index);
		const newBranchNumber = parseInt(index, 10) + 1;
		name = featureBranch;
		number = newBranchNumber;
	} else {
		name = base;
		number = 1;
	}
	const branch = `${name}-${number}`;

	logger.debug(`creating branch ${branch}`);
	await run(`git checkout -b ${branch} ${base}`);
	return { branch, name, number };
}

/**
 *
 * @param {string} msg
 * @returns {Promise<string>}
 */
async function initialCommit(msg) {
	logger.debug(`creating initial commit`);
	return run(`git commit --allow-empty -m ${escapeSpace(msg)}`);
}

/**
 *
 * @param {string} branchName
 * @returns {Promise<string>}
 */
async function pushOrigin(branchName) {
	logger.debug(`pushing origin upstream`);
	return run(`git push --set-upstream origin ${branchName}`);
}

/**
 *
 * @param {string} branch
 * @returns {Promise<boolean>}
 */
async function checkBranchExistence(branch) {
	try {
		logger.debug(`checking branch existence:${branch}`);
		await run(`git rev-parse --verify --quiet ${branch}`);
		logger.debug(`branch exists`);
		return true;
	} catch (e) {
		logger.debug(`branch doesnt exist`);
		return false;
	}
}

/**
 *
 * @param {string} branch
 * @param {string} part
 * @returns {Promise<string>}
 * @throws {Error}
 */
async function checkoutPart(branch, part) {
	const match = branch.match(/(.*)\-(\d+)/);
	const base = match ? match[1] : branch;
	const partBranch = part === 'main' ? base : `${base}-${part}`;
	const doesBranchExist = await checkBranchExistence(partBranch);
	if (doesBranchExist) {
		return run(`git checkout ${partBranch}`);
	} else {
		logger.debug(`branch does not exist`);
		throw new Error('NO_BRANCH');
	}
}

/**
 *
 * @param {PR} pr
 * @returns {Promise<string>}
 */
async function openPR({ featureName, title, part, base, branch }) {
	logger.debug(`opening PR`);
	const prTitle = `[${featureName.toUpperCase()}${part ? ` - Part_${part}` : ''}] - ${title}`;
	let command = `${gh} pr create -t ${escapeSpace(prTitle)} -b ${escapeSpace(title)} -H ${branch}`;
	if (base) {
		command += ` -B ${base}`;
	}
	return run(command);
}

/**
 *
 * @param {string} branch
 * @param {string} [cwd]
 * @returns {Promise<string>}
 */
async function createBranch(branch, cwd) {
	logger.debug(`creating branch ${branch}`);
	return run(`git checkout -b ${branch}`, cwd);
}

/**
 *
 * @returns {Promise<boolean>}
 */
async function isGHInstalled() {
	const regex = /gh version \d+\.\d+\.\d+/;
	logger.debug('checking if gh is installed');
	try {
		const stdout = await run(`${gh} --version`);
		const result = regex.test(stdout);
		logger.debug(`gh installed? ${result}`);
		return result;
	} catch (e) {
		return false;
	}
}

/**
 *
 * @returns {Promise<boolean>}
 */
async function isLoggedIn() {
	// TODO: fake gh client from test and dont rely on this env var
	if (process.env.GH_CLI_NOT_AUTHED) {
		return false;
	}
	const regex = /You are not logged into any GitHub hosts. Run gh auth login to authenticate./;
	logger.debug('checking auth status');
	try {
		const stdout = await run(`${gh} auth status`);
		const result = !regex.test(stdout);
		logger.debug(`logged in? ${result}`);
		return result;
	} catch (e) {
		return false;
	}
}

/**
 *
 * @param {string} [str='']
 * @returns {string}
 */
function escapeSpace(str = '') {
	return str.replace(/\s/g, '\\ ');
}

/**
 *
 * @returns {Promise<string>}
 */
async function getDefaultBranch() {
	return run(`${gh} api repos/{owner}/{repo} --jq .default_branch`);
}

module.exports = {
	getRepoName,
	getBranchName,
	pushOrigin,
	openPR,
	initialCommit,
	createBranchBasedOn,
	checkoutPart,
	checkBranchExistence,
	getFeatureByBranch,
	createBranch,
	isGHInstalled,
	isLoggedIn,
	getDefaultBranch,
};
