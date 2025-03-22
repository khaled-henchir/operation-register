module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],  
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    transformIgnorePatterns: ['node_modules/'],
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov"],
  };
  