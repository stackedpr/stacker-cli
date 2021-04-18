const os = require('os');
const path = require('path');
const { log } = require('./utils/logger');
const { getRepoName } = require('./utils/git');

const tmpDir = os.tmpdir();
const repoName = getRepoName();
const tmpPath = path.join(tmpDir, repoName);
const cacheDir = path.join(tmpPath, '.stacker');
const cacheFile = path.join(cacheDir, 'cache.json');

log(`cache file is located at ${cacheFile}`);

module.exports = {
	cacheDir,
	cacheFile,
};
