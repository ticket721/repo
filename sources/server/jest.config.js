module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@lib/common/(.*)$': '<rootDir>/libs/common/src/$1',
        '^@app/server/(.*)$': '<rootDir>/apps/server/src/$1'
    }
};
