const { getBranchName, checkoutPart } = require('../utils/git');

async function go(part) {
  try {
    const branchName = await getBranchName();
    await checkoutPart(branchName, part);
    const partBranchName = await getBranchName();
    console.log(`Switched to: ${partBranchName}`);
  } catch (e) {
    if (e.message === 'NO_BRANCH') {
      if (part === 'head') {
        console.log(`Stack Head does not exist`);
      } else {
        console.log(`Stack Instance ${part} does not exist`);
      }
    } else {
      if (part === 'head') {
        console.log(`Failed to go to Stack Head`);
      } else {
        console.log(`Failed to go to Stack Instance ${part}`);
      }
    }
  }
}

module.exports = { go };
