module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Where to find tests
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  
  // Transform settings
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
      isolatedModules: true,  // Faster test execution
    }]
  },
  
  // Module handling
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',  // Optional for path aliases
  },
  
  // Coverage settings
  collectCoverageFrom: ['src/**/*.ts'],  // Only measure coverage from source files
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/dist/'
  ],
  
  // Test execution
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  clearMocks: true,
  
  // Performance
  maxWorkers: '50%',  // Better resource management
};