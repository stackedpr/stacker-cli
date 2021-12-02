const { run, runSync } = require('./cmd');
const { log } = require('./logger');

function getRepoName(cwd) {
	const regex = /(\w+).git\s+/;
	log(`getting repo name`);
	const { stdout } = runSync('git remote -v', cwd);
	log(`output:${stdout}`);
	const match = stdout.match(regex);
	if (match) {
		log(`repo name is: ${match[1]}`);
		return match[1];
	}
	log(`couldnt find feature name by branch`);
	return;
}

async function getBranchName(cwd) {
	log(`getting branch name`);
	const { stdout } = await run('git rev-parse --abbrev-ref HEAD', cwd);
	log(`output:${stdout}`);
	return stdout;
}

async function getFeatureByBranch(branch, cwd) {
	const regex = /\[(.*?)(?: - Part_\d+)?\]/;
	log(`getting feature by branch name`);
	log(`regex: ${regex.toString()}`);
	const { stdout } = await run(`gh pr list --json title,headRefName --search head:${branch}`, cwd);
	log(`output:${stdout}`);
	const pr = JSON.parse(stdout).find((pr) => pr.headRefName === branch);
	if (!pr) {
		log(`no pr found`);
		return '';
	}
	const title = pr.title;
	const match = title.match(regex);
	log(match);
	if (match) {
		log(`feature name is: ${match[1]}`);
		return match[1];
	}
	log(`couldnt find feature name by branch`);
	return '';
}

async function createBranchBasedOn(base, cwd) {
	const match = base.match(/(.*)\-(\d+)/);
	let name;
	let number;
	log(match);
	if (match) {
		const [, featureBranch, index] = match;
		log(`featureBranch`, featureBranch);
		log(`index`, index);
		const newBranchNumber = parseInt(index, 10) + 1;
		name = featureBranch;
		number = newBranchNumber;
	} else {
		name = base;
		number = 1;
	}
	const branch = `${name}-${number}`;

	log(`creating branch ${branch}`);
	const { stdout } = await run(`git checkout -b ${branch} ${base}`, cwd);
	log(`output:${stdout}`);
	return { branch, name, number };
}

async function initialCommit(msg, cwd) {
	log(`creating initial commit`);
	const { stdout } = await run(`git commit --allow-empty -m ${escapeSpace(msg)}`, cwd);
	log(`output:${stdout}`);
	return stdout;
}

async function pushOrigin(branchName, cwd) {
	log(`pushing origin upstream`);
	const { stdout } = await run(`git push --set-upstream origin ${branchName}`, cwd);
	log(`output:${stdout}`);
	return stdout;
}

async function checkBranchExistence(branch, cwd) {
	try {
		log(`checking branch existence:${branch}`);
		await run(`git rev-parse --verify --quiet ${branch}`, cwd);
		return true;
	} catch (e) {
		return false;
	}
}

async function checkoutPart(branch, part, cwd) {
	const match = branch.match(/(.*)\-(\d+)/);
	const base = match ? match[1] : branch;
	const partBranch = part === 'main' ? base : `${base}-${part}`;
	const doesBranchExist = await checkBranchExistence(partBranch, cwd);
	if (doesBranchExist) {
		const { stdout } = await run(`git checkout ${partBranch}`, cwd);
		return stdout;
	} else {
		log(`branch does not exist`);
		throw new Error('NO_BRANCH');
	}
}

async function openPR({ featureName, title, part, base, cwd, branch }) {
	log(`opening PR`);
	const prTitle = `[${featureName.toUpperCase()}${part ? ` - Part_${part}` : ''}] - ${title}`;
	let command = `gh pr create -t ${escapeSpace(prTitle)} -b ${escapeSpace(title)} -H ${branch}`;
	if (base) {
		command += ` -B ${base}`;
	}
	const { stdout } = await run(command, cwd);
	log(`output:${stdout}`);
	return stdout;
}

async function createBranch(branch, cwd) {
	log(`creating branch ${branch}`);
	const { stdout } = await run(`git checkout -b ${branch}`, cwd);
	log(`output:${stdout}`);
}

async function isLoggedIn(cwd) {
	const regex = /You are not logged into any GitHub hosts. Run gh auth login to authenticate./;
	log('checking auth status');
	try {
		const { stdout } = await run(`gh auth status`, cwd);
		const result = !regex.test(stdout);
		log(`logged in? ${result}`);
		return result;
	} catch (e) {
		return false;
	}
}

function escapeSpace(str = '') {
	return str.replace(/\s/g, '\\ ');
}

async function getDefaultBranch(cwd) {
	const { stdout } = await run('gh api repos/{owner}/{repo} --jq .default_branch', cwd);
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
