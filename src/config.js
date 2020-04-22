const path = require('path');
const findUp = require('find-up');
const { log } = require('./utils/logger');

const rootDir = path.dirname(findUp.sync('package.json'));
log(`rootDir:${rootDir}`);
const cacheDir = path.join(rootDir, '.stacker');
const cacheFile = path.join(cacheDir, 'cache.json');

module.exports = {
  cacheDir,
  cacheFile,
};
