const config = require('./config');
const spawnSync = require('child_process').spawnSync;

const main = async () => {

    const direction = process.argv[2];

    if (['up', 'down'].indexOf(direction) === -1) {
        console.error(`Usage: node migrator.js (up/down)`);
        process.exit(1);
    }

    const checkCall = (res) => {
        if (res.status !== 0) {
            console.error(`\tProcess exited with code ${res.status}`);

            console.error('\twith following error logs');
            console.error('==========>');
            console.error();
            console.error(res.output[2].toString());
            console.error();
            console.error('<==========');
            console.error('\twith following logs');
            console.error('==========>');
            console.error();
            console.error(res.output[1].toString());
            console.error();
            console.error('<==========');

            process.exit(res.status);
        }
    };

    const pause = (time) => new Promise(resolve => {
        console.log(`sleeping ${time} seconds.`)
        setTimeout(resolve, time * 1000)
    });

    let command = null;
    let tasks = null;

    switch (direction) {
        case 'up': {

            console.log('running [cassandra setup]');
            const cassandraSetup = spawnSync('node', ['keyspace.js'], {
                cwd: './cassandra'
            });
            checkCall(cassandraSetup);
            await pause(2);

            console.log('running [elasticsearch setup]');
            const elasticsearchSetup = spawnSync('npx', ['elastic-migrate', 'setup']);
            checkCall(elasticsearchSetup);
            await pause(2);

            command = 'up';
            tasks = config;

            break ;
        }

        case 'down': {

            command = 'down';
            tasks = config.reverse();

            break ;
        }
    }

    for (const task of tasks) {
        console.log();
        process.stdout.write(`running [${task.type}][${task.name}][${task.timestamp}][${command}] `);
        const taskRes = spawnSync('npm', ['run', `${task.type}-migrate-${command}`, task.timestamp], {
            cwd: task.type
        });
        checkCall(taskRes);
        if (process.env.VERBOSE) {
            console.log();
            console.log(taskRes.output[1].toString());
            console.log();
        }
        process.stdout.write(`[OK]\n`);
        await pause(2);
    }
    console.log();
    console.log(`${command} migration complete`);

};

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    });
