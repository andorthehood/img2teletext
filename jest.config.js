module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/test/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'dist/**/*.js',
    '!dist/**/*.d.ts',
    '!dist/cli.js',
    '!**/node_modules/**'
  ],
  
  // Snapshot configuration
  snapshotSerializers: [],
  
  // Setup files
  setupFilesAfterEnv: [],
  
  // Transform configuration (not needed since we're testing compiled JS)
  transform: {},
  
  // Module configuration
  moduleFileExtensions: ['js', 'json'],
  
  // Verbose output
  verbose: true
}; 