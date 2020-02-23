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
        '<rootDir>/apps/server/src/utils/HttpEception.filter.ts',
        '<rootDir>/apps/server/src/authentication/Jwt.strategy.ts',
        '<rootDir>/apps/server/test',
        '<rootDir>(.*).module.ts'
    ]
};
