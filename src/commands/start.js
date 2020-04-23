const prompts = require('prompts');
const {
  getBranchName,
  pushOrigin,
  openPR,
  initialCommit,
} = require('../utils/git');
const { setFeatureForBranch } = require('../utils/cache');

async function start() {
  const branchName = await getBranchName();
  const { featureName, title } = await prompts([
    {
      type: 'text',
      name: 'featureName',
      message: `What is the name of the feature you're working on?`,
      initial: branchName
        .split('-')
        .map((name) => `${name[0].toUpperCase()}${name.substr(1)}`)
        .join(' '),
    },
    {
      type: 'text',
      name: 'title',
      message: `What would you like to appear in the title?`,
      initial: 'Add the ability to do something',
    },
  ]);
  console.log(`Creating a feature stack for ${featureName}`);
  setFeatureForBranch(branchName, featureName);
  await initialCommit();
  await pushOrigin(branchName);
  const prLink = await openPR(featureName, title);
  console.log(`Created Stack PR: ${prLink}`);
  console.log(`Run \`npx stacker --next\` to create a Stack Item`);
}

module.exports = { start };
