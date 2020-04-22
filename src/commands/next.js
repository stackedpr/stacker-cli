const prompts = require('prompts');
const {
  getBranchName,
  pushOrigin,
  openPR,
  initialCommit,
  createBranchBasedOn,
} = require('../utils/git');
const { getFeatureByBranch } = require('../utils/cache');

async function next() {
  const baseBranchName = await getBranchName();
  const featureName = getFeatureByBranch(baseBranchName);

  const { subFeatureTitle } = await prompts([
    {
      type: 'text',
      name: 'subFeatureTitle',
      message: `What is the title of this Stack Instance?`,
      initial: 'Stack Instance Title',
    },
  ]);
  console.log(`Creating Feature Stack Instance...`);

  const { number } = await createBranchBasedOn(baseBranchName);
  const branchName = await getBranchName();

  await initialCommit();
  await pushOrigin(branchName);
  const prLink = await openPR(featureName, subFeatureTitle, number);
  console.log(`Created PR: ${prLink}`);
}

module.exports = { next };
