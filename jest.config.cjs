module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',

  // allow imports like "@/lib/foo"
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },

  // so Jest looks in src/ before you need long ../../ paths
  moduleDirectories: ['node_modules', '<rootDir>/src'],
};
