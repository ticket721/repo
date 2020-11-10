module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [
        "**/*.spec.ts"
    ],
    modulePathIgnorePatterns: [
        '<rootDir>/libs/common/archive',
        '<rootDir>/apps/worker/archive',
        '<rootDir>/apps/server/archive',
    ],
    moduleNameMapper: {
        '^@lib/common/(.*)$': '<rootDir>/libs/common/src/$1',
        '^@app/server/(.*)$': '<rootDir>/apps/server/src/$1',
        '^@app/worker/(.*)$': '<rootDir>/apps/worker/src/$1'
    },
    // collectCoverageFrom: [
    //     '<rootDir>/libs/common/src/**/*.ts',
    //     '<rootDir>/apps/server/src/**/*.ts',
    //     '<rootDir>/apps/worker/src/**/*.ts'
    // ],
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
        '<rootDir>(.*).driver.ts', // Driver of external service
        '<rootDir>(.*).routes-spec.ts', // E2E tests
        '<rootDir>(.*)/controllers/(.*).controller.ts', // E2E focuses on them
        '<rootDir>(.*).controller.decorator.ts', // E2E focuses on them
        '<rootDir>(.*).dto.ts', // Basically types
        '<rootDir>(.*).type.ts', // Types
        '<rootDir>(.*).value.ts', // Values used for configuration
        '<rootDir>(.*).joi.ts', // Dynamic config validation schema
        '<rootDir>(.*).rights.ts', // Values used for rights configuration
    ]
};
