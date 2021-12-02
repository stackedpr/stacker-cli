const prompts = require('prompts');
const {
	getBranchName,
	pushOrigin,
	openPR,
	initialCommit,
	getDefaultBranch,
} = require('../utils/git');
// const { setFeatureForBranch } = require('../utils/cache');

async function newStack() {
	const [defaultBranchName, currentBranchName] = await Promise.all([
		getDefaultBranch(),
		getBranchName(),
	]);
	if (defaultBranchName === currentBranchName) {
		console.log(`You are on ${defaultBranchName}. Switch to a new branch to create a new Stack.`);
		process.exit();
	}
	const { featureName, title } = await prompts([
		{
			type: 'text',
			name: 'featureName',
			message: `What is the name of the PR Stack?`,
			initial: currentBranchName
				.split('-')
				.map((name) => `${name[0].toUpperCase()}${name.substr(1)}`)
				.join(' '),
		},
		{
			type: 'text',
			name: 'title',
			message: `What would you like to appear in the title of the main PR?`,
			initial: 'Add the ability to do something',
		},
	]);
	console.log(`Creating a PR Stack for ${featureName}...`);
	// setFeatureForBranch(branchName, featureName);
	await initialCommit(`Initial commit for ${featureName}`);
	await pushOrigin(currentBranchName);
	const prLink = await openPR({ featureName, title, branch: currentBranchName });
	console.log(`Created PR Stack: ${prLink}`);
	console.log(`Run \`stacker --add\` to create a Stack Item`);
}

module.exports = { newStack };
