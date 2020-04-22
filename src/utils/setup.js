const { createCache } = require('./cache');

function setup() {
  createCache();
}

module.exports = { setup };
