import type { JestConfigWithTsJest } from 'ts-jest';
import { loadEnv } from '@tjsr/simple-env-utils';

loadEnv({ silent: true });

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
  testEnvironment: 'node',
  transform: {
    '^.+\\.m?tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  preset: "ts-jest/presets/default-esm",
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  verbose: false,
};

export default config;
