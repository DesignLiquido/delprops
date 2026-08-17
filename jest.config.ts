import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/fontes', '<rootDir>/testes'],
  testMatch: ['**/testes/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'fontes/**/*.ts',
    '!fontes/**/*.d.ts',
    '!fontes/**/index.ts'
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }]
  },
  coverageReporters: ['text', 'lcov', 'json', 'html', 'text-summary'],
};

export default config;
