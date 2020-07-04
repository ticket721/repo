const { run, runGet } = require('../run');
const { join } = require('path');
const { goback, goroot } = require('../root');

const ciexec = async (module, commands) => {
    const currentBranch = (await runGet(`git symbolic-ref --short HEAD`)).replace('\n', '');
    console.log(currentBranch);

    if (currentBranch !== 'develop') {
        const path = goroot();
        const modulePath = join(process.cwd(), 'modules', module);
        try {
            const diff = await runGet(`git diff $(git merge-base develop HEAD)..HEAD ${modulePath}`);
            goback(path);
            if (diff === '') {
                console.log(`No diff found in ${modulePath}`);
                process.exit(0);
            }
        } catch {
            goback(path)
        }
    }

    await run(commands.join(' '))
};

module.exports = function(program) {
    program
        .command('ci_exec <module> [commands...]')
        .description('runs command if code changed on current branch')
        .action(ciexec)
}

