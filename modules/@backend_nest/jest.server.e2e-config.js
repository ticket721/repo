module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageDirectory: 'coverage-server-e2e',
    testMatch: [
        "**/apps/server/**/*e2e-spec.ts"
    ],
    moduleNameMapper: {
        '^@lib/common/(.*)$': '<rootDir>/libs/common/src/$1',
        '^@app/server/(.*)$': '<rootDir>/apps/server/src/$1',
        '^@app/worker/(.*)$': '<rootDir>/apps/worker/src/$1'
    },
    coveragePathIgnorePatterns: [
        '<rootDir>/libs/common/src/logger',
        '<rootDir>/apps/server/src/utils/HttpException.filter.ts',
        '<rootDir>/apps/server/src/authentication/Jwt.strategy.ts',

        // Not testing e2e sources
        '<rootDir>/apps/server/test',

        // Not testing main files
        '<rootDir>/apps/server/src/main.ts',
        '<rootDir>/apps/worker/src/main.ts',

        // Not testing certain types of files
        '<rootDir>(.*).module.ts', // Useless to test modules
        '<rootDir>(.*).routes-spec.ts', // E2E tests
        '<rootDir>(.*).dto.ts', // Basically types
        '<rootDir>(.*).type.ts', // Types
        '<rootDir>(.*).value.ts', // Values used for configuration
        '<rootDir>(.*).joi.ts', // Dynamic config validation schema
        '<rootDir>(.*).rights.ts', // Values used for rights configuration
    ]
};
