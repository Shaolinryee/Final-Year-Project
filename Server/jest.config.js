module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js', // Exclude main entry file
    '!src/config/**', // Exclude config files
    '!src/schedulers/**', // Exclude schedulers
    '!src/scripts/**', // Exclude scripts
    '!src/uploads/**', // Exclude uploads
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  
  // Module name mapping for aliases (if needed in future)
  // moduleNameMapping: {
  //   '^@/(.*)$': '<rootDir>/src/$1'
  // },
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Test timeout
  testTimeout: 10000,
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],
  
  // Transform configuration (for future ES modules support)
  transform: {},
  
  // Global variables
  globals: {
    'process.env.NODE_ENV': 'test'
  }
};
