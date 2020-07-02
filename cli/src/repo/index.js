const { run } = require('../run');
const { goback, goroot } = require('../root');

const dependencies = async () => {
    await run('npm install --global lerna yarn truffle@5.0.18\n');
};

const submodules = async () => {
    const current = goroot();
    try {
        await run('yarn setup:submodules:clone', () => goback(current));
        goback(current);
    } catch {
        goback(current)
    }
};

const install = async () => {
    const current = goroot();
    try {
        await run('yarn @clean');
        await run('yarn @install');
        goback(current);
    } catch {
        goback(current)
    }
};

module.exports = function(program) {
    program
        .command('repo_dependencies')
        .description('install global dependencies (mainly clis) for the repo')
        .action(dependencies);

    program
        .command('repo_submodules')
        .description('import repository submodules')
        .action(submodules);

    program
        .command('repo_install')
        .description('install repository dependencies')
        .action(install);
}

