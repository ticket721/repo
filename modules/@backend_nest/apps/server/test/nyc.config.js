module.exports = {
    "nyc": {
        "extends": "@istanbuljs/nyc-config-typescript",
        "all": true,
        "reporter": [
            "text",
            "lcov"
        ],
        "include": [
            "**/*.ts"
        ],
        "exclude": [
            "node_modules",
            "src/**/*.spec.ts",
            "test/**/*.e2e-spec.ts",
            "dist"
        ]
    }
};
