const NodeCache = require("node-cache");

// Set up node-cache instance (stdTTL: 5 minutes, checkperiod: 1 minute)
const cache = new NodeCache({
  stdTTL: 300,
  checkperiod: 60,
  useClones: false,
});

module.exports = cache;
