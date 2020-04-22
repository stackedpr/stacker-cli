const { run } = require('./cmd');
const { log } = require('./logger');

async function getBranchName() {
  log(`getting branch name`);
  const { stdout } = await run('git rev-parse --abbrev-ref HEAD');
  log(`output:${stdout}`);
  return stdout;
}

async function createBranchBasedOn(base) {
  const match = base.match(/(.*)-(\d+)/);
  let name;
  let number;
  if (match) {
    const [, featureBranch, number] = match;
    const newBranchNumber = parseInt(number, 10) + 1;
    name = featureBranch;
    number = newBranchNumber;
  } else {
    name = base;
    number = 1;
  }
  const branch = `${base}-${number}`;

  log(`creating branch ${branch}`);
  const { stdout } = await run(`git checkout -b ${branch} ${base}`);
  log(`output:${stdout}`);
  return { branch, name, number };
}

async function initialCommit() {
  log(`creating initial commit`);
  const { stdout } = await run(`git commit --allow-empty -m "Start Feature"`);
  log(`output:${stdout}`);
  return stdout;
}

async function pushOrigin(branchName) {
  log(`pushing origin upstream`);
  const { stdout } = await run(`git push --set-upstream origin ${branchName}`);
  log(`output:${stdout}`);
  return stdout;
}

// TODO: use -b for base
async function openPR(featureName, title, part) {
  log(`opening PR`);
  const prTitle = `[${featureName.toUpperCase()}${
    part ? ` - Part_${part}` : ''
  }] - ${title}`;
  const { stdout } = await run(`hub pull-request -m "${prTitle}"`);
  log(`output:${stdout}`);
  return stdout;
}

module.exports = {
  getBranchName,
  pushOrigin,
  openPR,
  initialCommit,
  createBranchBasedOn,
};
