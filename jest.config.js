module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testPathIgnorePatterns: ["/node_modules/"],
  coveragePathIgnorePatterns: ["/node_modules/", "enzyme.js"],
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig.json",
    },
  },
  setupFilesAfterEnv: ["jest-extended"],
  coverageReporters: ["json", "lcov", "text", "text-summary"],
};
