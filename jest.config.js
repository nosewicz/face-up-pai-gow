/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  testEnvironment: "node",
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
};

module.exports = config;
