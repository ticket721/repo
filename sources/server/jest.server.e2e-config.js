module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageDirectory: 'coverage-server-e2e',
    testMatch: [
        "**/apps/server/**/*e2e-spec.ts"
    ],
    moduleNameMapper: {
        '^@lib/common/(.*)$': '<rootDir>/libs/common/src/$1',
        '^@app/server/(.*)$': '<rootDir>/apps/server/src/$1'
    }
};
