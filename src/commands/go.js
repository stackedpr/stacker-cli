const { getBranchName, checkoutPart } = require('../utils/git');

async function go(part) {
  try {
    const branchName = await getBranchName();
    await checkoutPart(branchName, part);
    const partBranchName = await getBranchName();
    console.log(`Switched to: ${partBranchName}`);
  } catch (e) {
    if (e.message === 'NO_BRANCH') {
      if (part === 'main') {
        console.log(`Feature Stack does not exist`);
      } else {
        console.log(`Stack Item ${part} does not exist`);
      }
    } else {
      if (part === 'main') {
        console.log(`Failed to go to Feature Stack`);
      } else {
        console.log(`Failed to go to Stack Item ${part}`);
      }
    }
  }
}

module.exports = { go };
