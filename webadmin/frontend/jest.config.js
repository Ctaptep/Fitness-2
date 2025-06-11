const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testMatch: ["**/src/pages/**/*.test.{js,ts,tsx}"],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};