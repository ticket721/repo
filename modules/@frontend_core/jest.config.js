module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coveragePathIgnorePatterns: [
        '<rootDir>/src/log',
        '<rootDir>/lib/*',
        '<rootDir>/src/**/*.spec.ts',
    ],
    testPathIgnorePatterns: [
        '<rootDir>/lib/'
    ]
};
