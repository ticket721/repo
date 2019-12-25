module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@lib/common/(.*)$': '<rootDir>/libs/common/src/$1',
        '^@app/server/(.*)$': '<rootDir>/apps/server/src/$1'
    },
    coveragePathIgnorePatterns: [
        '<rootDir>/libs/common/src/logger',
        '<rootDir>/apps/server/src/utils/HttpException.filter.ts',
        '<rootDir>/apps/server/src/authentication/Jwt.strategy.ts',
        '<rootDir>/apps/server/test'
    ]
};
