// config.js
const crypto = require('crypto');

const config = {
  jwtSecretKey: crypto.randomBytes(32).toString('hex'),
};

module.exports = config;
