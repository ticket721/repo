const { run } = require('../run');
const { goback, goroot } = require('../root');
const path = require('path')

const dependencies = async () => {
    await run('npm install --global lerna yarn truffle@5.0.18 pm2');
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

const delWatchers = async () => {
    const current = goroot();
    try {
        await run('pm2 flush');
        await run('pm2 delete all');
        goback(current);
    } catch {
        goback(current)
    }
};

const runWatchers = async () => {
    const current = goroot();
    try {
        await run('pm2 start cli/src/repo/ecosystem.config.js');
        goback(current);
    } catch {
        goback(current)
    }
};

const logWatchers = async () => {
    const current = goroot();
    const files = [
        ".pm2/logs/global-out.log",
        ".pm2/logs/sdk-out.log",
        ".pm2/logs/core-out.log",
        ".pm2/logs/flib-out.log"
    ].map(f => path.resolve(process.env.HOME, f))
    console.log(files.join('\n'));
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

    program
        .command('repo_run_watchers')
        .description('run watchers')
        .action(runWatchers);

    program
        .command('repo_log_watchers')
        .description('log watchers')
        .action(logWatchers);

    program
        .command('repo_del_watchers')
        .description('delete watchers')
        .action(delWatchers);
}

