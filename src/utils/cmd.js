const execa = require('execa');

function run(cmd) {
  const cmdToRun = cmd.split(' ');
  const params = buildParams(cmdToRun.slice(1));

  return execa(cmdToRun[0], params);
}

function runSync(cmd) {
  const cmdToRun = cmd.split(' ');
  const params = buildParams(cmdToRun.slice(1));

  return execa.sync(cmdToRun[0], params);
}

function buildParams(cmd) {
  const params = [];
  let shouldConcat = false;
  for (let i = 0; i < cmd.length; i++) {
    const param = cmd[i];
    if (!shouldConcat) {
      params.push(param.replace(/"/g, ''));
    } else {
      params[params.length - 1] += ` ${param.replace(/"/g, '')}`;
    }
    if (param.indexOf('"') === 0) {
      shouldConcat = true;
    } else if (param.indexOf('"') === param.length - 1) {
      shouldConcat = false;
    }
  }
  return params;
}

module.exports = { run, runSync };
