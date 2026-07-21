import { createDefaultEsmPreset } from 'ts-jest';

export default {
  ...createDefaultEsmPreset({ tsconfig: 'tsconfig.test.json' }),
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*.test.js'],
  testPathIgnorePatterns: ['<rootDir>/dist/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@harborclient/sdk/react$': 'react'
  }
};
