const fs = require('fs');
const config = require('../config');

function createCache() {
  if (!fs.existsSync(config.cacheDir)) {
    fs.mkdirSync(config.cacheDir);
    fs.writeFileSync(config.cacheFile, JSON.stringify({}));
  }
}

function getCache() {
  return JSON.parse(fs.readFileSync(config.cacheFile, 'utf-8'));
}

function setCache(cache) {
  fs.writeFileSync(config.cacheFile, JSON.stringify(cache));
}

function getFeatureByBranch(branch) {
  const cache = getCache();
  return cache[branch];
}

function setFeatureForBranch(branch, feature) {
  const cache = getCache();
  cache[branch] = feature;
  setCache(cache);
}

module.exports = { createCache, getFeatureByBranch, setFeatureForBranch };
