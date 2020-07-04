const { run, runGet } = require('../run');
const { join } = require('path');
const { goback, goroot } = require('../root');

const ciexec = async (module, commands) => {
    const path = goroot();
    const modulePath = join(process.cwd(), 'modules', module);
    try {
        const diff = await runGet(`git diff $(git merge-base develop HEAD)..HEAD ${modulePath}`);
        console.log('diff', diff);
        goback(path);
        if (diff === '') {
            console.log(`No diff found in ${modulePath}`);
            process.exit(0);
        }
        await run(commands.join(' '))
    } catch (e) {
        console.error(e);
        goback(path)
    }

};

module.exports = function(program) {
    program
        .command('ci_exec <module> [commands...]')
        .description('runs command if code changed on current branch')
        .action(ciexec)
}

