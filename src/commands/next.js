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
const { log } = require('../utils/logger');

async function next() {
  const baseBranchName = await getBranchName();
  const featureName = await getFeatureByBranch(baseBranchName);
  log('got featureName', featureName);
  const { subFeatureTitle } = await prompts([
    {
      type: 'text',
      name: 'subFeatureTitle',
      message: `What is the title of this Stack Item?`,
      initial: 'Stack Item Title',
    },
  ]);
  console.log(`Creating Stack Item...`);

  const { number } = await createBranchBasedOn(baseBranchName);
  const branchName = await getBranchName();
  // setFeatureForBranch(branchName, featureName);
  await initialCommit(
    `Initial commit for [${featureName}] - ${subFeatureTitle}`
  );
  await pushOrigin(branchName);
  const prLink = await openPR(
    featureName,
    subFeatureTitle,
    number,
    baseBranchName
  );
  console.log(`Created Stack Item: ${prLink}`);
}

module.exports = { next };
