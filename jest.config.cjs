module.exports = {
  testEnvironment: 'node',
  verbose: true,
  moduleNameMapper: {
    '^openai$': '<rootDir>/__mocks__/openai.js',
    '^twilio$': '<rootDir>/__mocks__/twilio.js',
    '^googleapis$': '<rootDir>/__mocks__/googleapis.js'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
