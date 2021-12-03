const prompts = require('prompts');
const {
	getBranchName,
	pushOrigin,
	openPR,
	initialCommit,
	createBranchBasedOn,
	getFeatureByBranch,
} = require('../utils/git');
// const { setFeatureForBranch } = require('../utils/cache');
const logger = require('../utils/logger');

async function add() {
	const baseBranchName = await getBranchName();
	const featureName = await getFeatureByBranch(baseBranchName);
	logger.debug('got featureName', featureName);
	const { subFeatureTitle } = await prompts([
		{
			type: 'text',
			name: 'subFeatureTitle',
			message: `What is the title of this Stack Item?`,
			initial: 'Stack Item Title',
		},
	]);
	logger.info(`\nCreating Stack Item...`);

	const { number } = await createBranchBasedOn(baseBranchName);
	const branchName = await getBranchName();
	// setFeatureForBranch(branchName, featureName);
	await initialCommit(`Initial commit for [${featureName}] - ${subFeatureTitle}`);
	await pushOrigin(branchName);
	const prLink = await openPR({
		featureName,
		title: subFeatureTitle,
		part: number,
		base: baseBranchName,
		branch: branchName,
	});
	logger.success(`Created Stack Item: ${logger.Highlight(prLink)}`);
}

module.exports = { add };
