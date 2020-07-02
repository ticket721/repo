const { spawn, exec } = require("child_process");

const run = (command, onEnd) => {
    return new Promise((ok, ko) => {
        const split = command.split(' ');

        const prcs = spawn(split[0], split.slice(1));

        prcs.stderr.on('data', (data) => {
            process.stderr.write(data.toString());
        });

        prcs.stdout.on('data', (data) => {
            process.stdout.write(data.toString());
        });

        prcs.on('exit', (code) => {
            if (code !== 0) {
                return ko(code)
            }
            ok();
        });
    })
};

const runGet = (command) => {
    return new Promise((ok, ko) => {
        exec(command, function(error, stdout, stderr) {
            if (stderr)
                ko(stderr)
            else
                ok(stdout);
        });
    })
};

module.exports = {
    run,
    runGet
};
