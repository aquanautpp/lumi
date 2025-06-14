const fs = require('fs');
process.env.DATA_DIR = './tmp-test';

module.exports = {
  testEnvironment: 'node',
  verbose: true,
  transform: {},
  setupFiles: ['./tests/setup.js']
};
