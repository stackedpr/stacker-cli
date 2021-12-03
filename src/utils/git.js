const { run, runSync } = require('./cmd');
const logger = require('./logger');

/**
 *
 * @returns {string | undefined}
 */
function getRepoName() {
	const regex = /(\w+).git\s+/;
	logger.debug(`getting repo name`);
	const { stdout } = runSync('git remote -v');
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
	const { stdout } = await run('git rev-parse --abbrev-ref HEAD');
	logger.debug(`output:${stdout}`);
	return stdout;
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
	const { stdout } = await run(`gh pr list --json title,headRefName --search head:${branch}`);
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
 * @param {string} [cwd]
 * @returns {Promise<Branch>} branch
 */
async function createBranchBasedOn(base, cwd) {
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
	const { stdout } = await run(`git checkout -b ${branch} ${base}`, cwd);
	logger.debug(`output:${stdout}`);
	return { branch, name, number };
}

/**
 *
 * @param {string} msg
 * @param {string} [cwd]
 * @returns {Promise<string>}
 */
async function initialCommit(msg, cwd) {
	logger.debug(`creating initial commit`);
	const { stdout } = await run(`git commit --allow-empty -m ${escapeSpace(msg)}`, cwd);
	logger.debug(`output:${stdout}`);
	return stdout;
}

/**
 *
 * @param {string} branchName
 * @param {string} [cwd]
 * @returns {Promise<string>}
 */
async function pushOrigin(branchName, cwd) {
	logger.debug(`pushing origin upstream`);
	const { stdout } = await run(`git push --set-upstream origin ${branchName}`, cwd);
	logger.debug(`output:${stdout}`);
	return stdout;
}

/**
 *
 * @param {string} branch
 * @param {string} [cwd]
 * @returns {Promise<boolean>}
 */
async function checkBranchExistence(branch, cwd) {
	try {
		logger.debug(`checking branch existence:${branch}`);
		await run(`git rev-parse --verify --quiet ${branch}`, cwd);
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
 * @param {string} [cwd]
 * @returns {Promise<string>}
 * @throws {Error}
 */
async function checkoutPart(branch, part, cwd) {
	const match = branch.match(/(.*)\-(\d+)/);
	const base = match ? match[1] : branch;
	const partBranch = part === 'main' ? base : `${base}-${part}`;
	const doesBranchExist = await checkBranchExistence(partBranch, cwd);
	if (doesBranchExist) {
		const { stdout } = await run(`git checkout ${partBranch}`, cwd);
		return stdout;
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
	let command = `gh pr create -t ${escapeSpace(prTitle)} -b ${escapeSpace(title)} -H ${branch}`;
	if (base) {
		command += ` -B ${base}`;
	}
	const { stdout } = await run(command);
	logger.debug(`output:${stdout}`);
	return stdout;
}

/**
 *
 * @param {string} branch
 * @param {string} cwd
 * @returns {Promise<void>}
 */
async function createBranch(branch, cwd) {
	logger.debug(`creating branch ${branch}`);
	const { stdout } = await run(`git checkout -b ${branch}`, cwd);
	logger.debug(`output:${stdout}`);
}

/**
 *
 * @param {string} [cwd]
 * @returns {Promise<boolean>}
 */
async function isLoggedIn(cwd) {
	const regex = /You are not logged into any GitHub hosts. Run gh auth login to authenticate./;
	logger.debug('checking auth status');
	try {
		const { stdout } = await run(`gh auth status`, cwd);
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
	const { stdout } = await run('gh api repos/{owner}/{repo} --jq .default_branch');
	return stdout;
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
	isLoggedIn,
	getDefaultBranch,
};
