const tasks = t => t.join(' && ');

module.exports = {
    hooks: {
        "pre-commit": tasks([
            'editorconfig-cli'
        ]),
        "commit-msg": tasks([
            "commitlint -E HUSKY_GIT_PARAMS"
        ])
    }
};
