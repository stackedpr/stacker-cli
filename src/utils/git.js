const { run, runSync } = require('./cmd');
const { log } = require('./logger');

function getRepoName() {
  const regex = /(\w+).git\s+/;
  log(`getting repo name`);
  const { stdout } = runSync('git remote -v');
  log(`output:${stdout}`);
  const match = stdout.match(regex);
  if (match) {
    log(`repo name is: ${match[1]}`);
    return match[1];
  }
  log(`couldnt find feature name by branch`);
  return;
}

async function getBranchName() {
  log(`getting branch name`);
  const { stdout } = await run('git rev-parse --abbrev-ref HEAD');
  log(`output:${stdout}`);
  return stdout;
}

async function getFeatureByBranch(branch) {
  const regex = /\#\d+\s+\[(.*?)(?: - Part_\d+)?\].*/;
  log(`getting feature by branch name`);
  const { stdout } = await run(`hub pr list -h ${branch}`);
  log(`output:${stdout}`);
  const match = stdout.match(regex);
  if (match) {
    log(`feature name is: ${match[1]}`);
    return match[1];
  }
  log(`couldnt find feature name by branch`);
  return '';
}

async function createBranchBasedOn(base) {
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
  const { stdout } = await run(`git checkout -b ${branch} ${base}`);
  log(`output:${stdout}`);
  return { branch, name, number };
}

async function initialCommit(msg) {
  log(`creating initial commit`);
  const { stdout } = await run(`git commit --allow-empty -m "${msg}"`);
  log(`output:${stdout}`);
  return stdout;
}

async function pushOrigin(branchName) {
  log(`pushing origin upstream`);
  const { stdout } = await run(`git push --set-upstream origin ${branchName}`);
  log(`output:${stdout}`);
  return stdout;
}

async function checkBranchExistence(branch) {
  try {
    log(`checking branch existence:${branch}`);
    await run(`git rev-parse --verify --quiet ${branch}`);
    return true;
  } catch (e) {
    return false;
  }
}

async function checkoutPart(branch, part) {
  const match = branch.match(/(.*)\-(\d+)/);
  const base = match ? match[1] : branch;
  const partBranch = part === 'main' ? base : `${base}-${part}`;
  const doesBranchExist = await checkBranchExistence(partBranch);
  if (doesBranchExist) {
    const { stdout } = await run(`git checkout ${partBranch}`);
    return stdout;
  } else {
    log(`branch does not exist`);
    throw new Error('NO_BRANCH');
  }
}

async function openPR(featureName, title, part, base) {
  log(`opening PR`);
  const prTitle = `[${featureName.toUpperCase()}${
    part ? ` - Part_${part}` : ''
  }] - ${title}`;
  let command = `hub pull-request -m "${prTitle}"`;
  if (base) {
    command += ` -b ${base}`;
  }
  const { stdout } = await run(command);
  log(`output:${stdout}`);
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
};
