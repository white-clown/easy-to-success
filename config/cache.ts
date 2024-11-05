// config/cache.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
export default cache
