import { spawn } from 'child_process';
import fs from 'fs-extra';
import Web3 from 'web3';

let docker_compose_up_proc = null;

const readyLogs = [
    {
        line: 'Listening on 0.0.0.0:8545',
        image: 'ganache',
    },
    {
        line: '!!VAULTEREUM STARTED!!',
        image: 'vaultereum',
    },
    {
        line: '[DEBUG] agent: Service "vault:127.0.0.1:8200" in sync',
        image: 'consul',
    },
    {
        line: 'Elassandra started',
        image: 'elassandra',
    },
    {
        line: 'Ready to accept connections',
        image: 'redis',
    },
];

export const ganache_snapshot = (ganachePort: number) => {
    console.log('STARTING @utils/ganache_snapshot');

    const web3 = new Web3(
        new Web3.providers.HttpProvider(`http://127.0.0.1:${ganachePort}`),
    );
    return new Promise((ok, ko) => {
        (web3.currentProvider as any).send(
            {
                method: 'evm_snapshot',
                params: [],
                jsonrpc: '2.0',
                id: new Date().getTime(),
            },
            (error, res) => {
                if (error) {
                    return ko(error);
                } else {
                    console.log('FINISHED @utils/ganache_snapshot');
                    ok(res.result);
                }
            },
        );
    });
};

export const ganache_revert = (snap_id: number, ganachePort: number) => {
    console.log('STARTING @utils/ganache_revert');

    const web3 = new Web3(
        new Web3.providers.HttpProvider(`http://127.0.0.1:${ganachePort}`),
    );
    return new Promise((ok, ko) => {
        (web3.currentProvider as any).send(
            {
                method: 'evm_revert',
                params: [snap_id],
                jsonrpc: '2.0',
                id: new Date().getTime(),
            },
            (error, res) => {
                if (error) {
                    return ko(error);
                } else {
                    console.log('FINISHED @utils/ganache_revert');
                    ok(res.result);
                }
            },
        );
    });
};

export async function clear_artifacts() {
    console.log('STARTING @utils/clear_artifacts');

    if (fs.existsSync('../../artifacts/remote_ganache')) {
        fs.removeSync('../../artifacts/remote_ganache');
    }

    console.log('FINISHED @utils/clear_artifacts');
}

export async function run_contracts_migrations() {
    console.log('STARTING @utils/run_contracts_migrations');

    const current_dir = process.cwd();
    process.chdir('../..');
    const clean_proc = spawn(`env`, [
        ...`T721_CONFIG=./config.ganache.e2e.remote.json gulp contracts::clean network::clean`.split(
            ' ',
        ),
    ]);

    await new Promise((ok, ko) => {
        clean_proc.on('close', ok);
    });

    const network_proc = spawn(`env`, [
        ...`T721_CONFIG=./config.ganache.e2e.remote.json gulp network::run`.split(
            ' ',
        ),
    ]);

    await new Promise((ok, ko) => {
        let found = false;

        network_proc.stderr.on('data', data => {
            process.stderr.write(data);
        });

        network_proc.stdout.on('data', data => {
            process.stdout.write(data);
            if (data.indexOf('Completed task network::run') !== -1) {
                found = true;
            }
        });

        network_proc.on('close', () => (found ? ok() : ko()));
    });

    const contracts_proc = spawn(`env`, [
        ...`T721_CONFIG=./config.ganache.e2e.remote.json gulp contracts::run`.split(
            ' ',
        ),
    ]);

    await new Promise((ok, ko) => {
        let found = false;

        contracts_proc.stderr.on('data', data => {
            process.stderr.write(data);
        });

        contracts_proc.stdout.on('data', data => {
            process.stdout.write(data);
            if (data.indexOf('Completed task contracts::run') !== -1) {
                found = true;
            }
        });

        contracts_proc.on('close', () => (found ? ok() : ko()));
    });

    const server_prepare_proc = spawn(`env`, [
        ...`T721_CONFIG=./config.ganache.e2e.remote.json gulp server::dev::prepare`.split(
            ' ',
        ),
    ]);

    await new Promise((ok, ko) => {
        let found = false;

        server_prepare_proc.stderr.on('data', data => {
            process.stderr.write(data);
        });

        server_prepare_proc.stdout.on('data', data => {
            process.stdout.write(data);
            if (data.indexOf("Finished 'server::dev::prepare") !== -1) {
                found = true;
            }
        });

        server_prepare_proc.on('close', () => (found ? ok() : ko()));
    });

    process.chdir(current_dir);

    console.log('FINISHED @utils/run_contracts_migrations');
}

export const startDocker = async () => {
    console.log('STARTING @utils/startDocker');

    docker_compose_up_proc = spawn(
        `docker-compose`,
        [...`-f ./infra.yaml up`.split(' ')],
        {
            cwd: `${process.cwd()}/scripts/`,
        },
    );

    await new Promise((ok, ko) => {
        let ready = false;

        docker_compose_up_proc.stderr.on('data', data => {
            process.stderr.write(data);
        });

        docker_compose_up_proc.stdout.on('data', data => {
            if (!ready) {
                process.stdout.write(data);
            }

            const found = readyLogs.findIndex(ent => {
                if (data.indexOf(ent.line) !== -1) {
                    return true;
                }
            });
            if (found !== -1) {
                console.log(`Entity ${readyLogs[found].image} is READY`);
                readyLogs.splice(found, 1);

                if (readyLogs.length === 0) {
                    ready = true;
                    ok();
                }
            }
        });
    });

    console.log('FINISHED @utils/startDocker');
};

export const prepare = async () => {
    console.log('STARTING @utils/prepare');

    await clear_artifacts();
    await run_contracts_migrations();

    console.log('FINISHED @utils/prepare');
};

export const stopDocker = async () => {
    console.log('STARTING @utils/stopDocker');

    const docker_compose_down_proc = spawn(
        `docker-compose`,
        [...`-f ./infra.yaml down`.split(' ')],
        {
            cwd: `${process.cwd()}/scripts/`,
        },
    );

    await new Promise((ok, ko) => {
        docker_compose_down_proc.stderr.on('data', data => {
            process.stderr.write(data);
        });

        docker_compose_down_proc.stdout.on('data', data => {
            process.stdout.write(data);
        });

        docker_compose_down_proc.on('close', ok);
    });

    const docker_compose_rm_proc = spawn(
        `docker-compose`,
        [...`-f ./infra.yaml rm`.split(' ')],
        {
            cwd: `${process.cwd()}/scripts/`,
        },
    );

    await new Promise((ok, ko) => {
        docker_compose_rm_proc.stderr.on('data', data => {
            process.stderr.write(data);
        });

        docker_compose_rm_proc.stdout.on('data', data => {
            process.stdout.write(data);
        });

        docker_compose_rm_proc.on('close', ok);
    });

    docker_compose_up_proc.unref();
    docker_compose_up_proc.stdout.removeAllListeners('data');
    docker_compose_up_proc.stdin.removeAllListeners('data');
    docker_compose_up_proc.stderr.removeAllListeners('data');
    docker_compose_up_proc.removeAllListeners('close');

    console.log('FINISHED @utils/stopDocker');
};

export const runMigrations = async (
    cassandraPort: number,
    elasticSearchPort: number,
) => {
    console.log('STARTING @utils/runMigrations');

    return new Promise((ok, ko) => {
        const current_dir = process.cwd();
        process.chdir('../migrations');
        const proc = spawn(`env`, [
            ...`CASSANDRA_HOSTS=127.0.0.1 ELASTICSEARCH_HOST=127.0.0.1:${elasticSearchPort} CASSANDRA_PORT=${cassandraPort} ./migrate.sh`.split(
                ' ',
            ),
        ]);

        proc.stdout.on('data', data => {
            process.stdout.write(data);
        });

        proc.stderr.on('data', data => {
            process.stderr.write(data);
        });

        proc.on('close', code => {
            process.chdir(current_dir);
            if (code === 0) {
                proc.stdout.removeAllListeners('data');
                proc.stdin.removeAllListeners('data');
                proc.removeAllListeners('close');
                console.log('FINISHED @utils/runMigrations');
                return ok();
            } else {
                proc.stdout.removeAllListeners('data');
                proc.stdin.removeAllListeners('data');
                proc.removeAllListeners('close');
                return ko(code);
            }
        });
    });
};

export const resetMigrations = async (
    cassandraPort: number,
    elasticSearchPort: number,
) => {
    console.log('STARTING @utils/resetMigrations');

    return new Promise((ok, ko) => {
        const current_dir = process.cwd();
        process.chdir('../migrations');
        const proc = spawn(`env`, [
            ...`CASSANDRA_HOSTS=127.0.0.1 ELASTICSEARCH_HOST=127.0.0.1:${elasticSearchPort} CASSANDRA_PORT=${cassandraPort} ./reset.sh`.split(
                ' ',
            ),
        ]);

        proc.stdout.on('data', data => {
            process.stdout.write(data);
        });

        proc.stderr.on('data', data => {
            process.stderr.write(data);
        });

        proc.on('close', code => {
            process.chdir(current_dir);
            if (code === 0) {
                proc.stdout.removeAllListeners('data');
                proc.stdin.removeAllListeners('data');
                proc.removeAllListeners('close');
                console.log('FINISHED @utils/resetMigrations');
                return ok();
            } else {
                proc.stdout.removeAllListeners('data');
                proc.stdin.removeAllListeners('data');
                proc.removeAllListeners('close');
                return ko(code);
            }
        });
    });
};
