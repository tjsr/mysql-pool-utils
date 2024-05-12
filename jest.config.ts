import type { JestConfigWithTsJest } from 'ts-jest';
import dotenvFlow from 'dotenv-flow';

// import { DatabaseWaitEnvironment as dbenv } from './src/DatabaseWaitEnvironment.js';


dotenvFlow.config({silent: true});

const config: JestConfigWithTsJest = {
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.[m]ts',
  ],
  coverageDirectory: 'coverage',
  detectOpenHandles: true,
  extensionsToTreatAsEsm: ['.ts'],
  moduleFileExtensions: ['js', 'mjs', 'json', 'ts', 'mts'],
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/test/mocks/styleMock.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^\.+\\.env.*$': '$1',
  },
  modulePathIgnorePatterns: ['amplify', 'dist', 'build', 'node_modules'],
  setupFiles: ['<rootDir>/src/setup-tests.ts'],
  silent: false,
  // testEnvironment: './src/DatabaseWaitEnvironment.ts',
  // globalSetup: '<rootDir>/dist/esm/global-test-setup.js',
  // globalTeardown: './src/global-test-teardown.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.m?tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  // preset: "ts-jest/presets/default-esm",
  // globals: {
  //   'ts-jest': {
  //     useESM: true,
  //   },
  // },
  // transform: {
  //   '^.+\\.m?[jt]sx?$': [
  //     'esbuild-jest',
  //     {
  //       sourcemap: true,
  //       // useESM: true,
  //       '.test.ts': 'tsx'
  //     },
  //   ],
  // },
  // transformIgnorePatterns: ['<rootDir>/node_modules/'],
  verbose: false,
};

export default config;
