import Dockerode from 'dockerode';
import { spawn } from 'child_process';
import fs from 'fs-extra';
const Docker = new Dockerode();

export async function pull_ganache_image(): Promise<void> {
    return new Promise((ok, ko) => {
        Docker.pull(`trufflesuite/ganache-cli:v6.7.0`, (err, res) => {
            if (err) {
                return ko(err);
            }

            Docker.modem.followProgress(res, () => {
                ok();
            });
        });
    });
}

export async function pull_redis_image(): Promise<void> {
    return new Promise((ok, ko) => {
        Docker.pull(`redis:5.0.7`, (err, res) => {
            if (err) {
                return ko(err);
            }

            Docker.modem.followProgress(res, () => {
                ok();
            });
        });
    });
}

export async function pull_elassandra_image(): Promise<void> {
    return new Promise((ok, ko) => {
        Docker.pull(`strapdata/elassandra:6.8.4.0`, (err, res) => {
            if (err) {
                return ko(err);
            }

            Docker.modem.followProgress(res, () => {
                ok();
            });
        });
    });
}

export async function run_ganache(ganachePort: number): Promise<void> {
    const container = await Docker.createContainer({
        Image: `trufflesuite/ganache-cli:v6.7.0`,
        ExposedPorts: {
            '8545': {},
        },
        HostConfig: {
            AutoRemove: true,
            PortBindings: {
                '8545': [
                    {
                        HostPort: ganachePort.toString(),
                    },
                ],
            },
        },
        name: 'ganache-e2e-instance',
    });
    await container.start();
    const logOpts = {
        stdout: true,
        stderr: true,
        tail: 100,
        follow: true,
    };
    return new Promise((ok, ko) => {
        container.logs(logOpts, (err, data) => {
            if (err) {
                return ko(err);
            }
            data.setEncoding('utf8');
            data.on('data', function(_data) {
                process.stdout.write(_data);
                if (_data.indexOf('Listening on 0.0.0.0:8545') !== -1) {
                    process.stdout.write('\n');
                    data.removeAllListeners('data');
                    return ok();
                }
            });
        });
    });
}

export async function run_redis(redisPort: number): Promise<void> {
    const container = await Docker.createContainer({
        Image: `redis:5.0.7`,
        ExposedPorts: {
            '6379': {},
        },
        HostConfig: {
            AutoRemove: true,
            PortBindings: {
                '6379': [
                    {
                        HostPort: redisPort.toString(),
                    },
                ],
            },
        },
        name: 'redis-e2e-instance',
    });
    await container.start();
    const logOpts = {
        stdout: true,
        stderr: true,
        tail: 100,
        follow: true,
    };
    return new Promise((ok, ko) => {
        container.logs(logOpts, (err, data) => {
            if (err) {
                return ko(err);
            }
            data.setEncoding('utf8');
            data.on('data', function(_data) {
                process.stdout.write(_data);
                if (_data.indexOf('Ready to accept connections') !== -1) {
                    process.stdout.write('\n');
                    data.removeAllListeners('data');
                    return ok();
                }
            });
        });
    });
}

export async function run_elassandra(
    cassandraPort: number,
    elasticSearchPort: number,
): Promise<void> {
    const container = await Docker.createContainer({
        Image: `strapdata/elassandra:6.8.4.0`,
        ExposedPorts: {
            '9042': {},
            '9200': {},
        },
        HostConfig: {
            AutoRemove: true,
            PortBindings: {
                '9042': [
                    {
                        HostPort: cassandraPort.toString(),
                    },
                ],
                '9200': [
                    {
                        HostPort: elasticSearchPort.toString(),
                    },
                ],
            },
        },
        name: 'elassandra-e2e-instance',
    });
    await container.start();
    const logOpts = {
        stdout: true,
        stderr: true,
        tail: 100,
        follow: true,
    };
    return new Promise((ok, ko) => {
        container.logs(logOpts, (err, data) => {
            if (err) {
                return ko(err);
            }
            data.setEncoding('utf8');
            data.on('data', function(_data) {
                process.stdout.write(_data);
                if (_data.indexOf('Elassandra started') !== -1) {
                    process.stdout.write('\n');
                    data.removeAllListeners('data');
                    return ok();
                }
            });
        });
    });
}

export async function kill_container(container_name: string) {
    try {
        const container = await Docker.getContainer(container_name);
        await container.kill();
    } catch (e) {}
}

export const startDocker = async (
    cassandraPort: number,
    elasticSearchPort: number,
    redisPort: number,
    ganachePort: number,
) => {
    console.log('Started pulling elassandra:6.8.4.0');
    await pull_elassandra_image();
    console.log('Pulled elassandra:6.8.4.0');
    console.log('Starting elassandra:6.8.4.0 container');
    await run_elassandra(cassandraPort, elasticSearchPort);
    console.log('Started elassandra:6.8.4.0 container');

    console.log('Started pulling redis:5.0.7');
    await pull_redis_image();
    console.log('Pulled redis:5.0.7');
    console.log('Starting redis:5.0.7 container');
    await run_redis(redisPort);
    console.log('Started redis:5.0.7 container');

    console.log('Started pulling trufflesuite/ganache-cli:v6.7.0');
    await pull_ganache_image();
    console.log('Pulled trufflesuite/ganache-cli:v6.7.0');
    console.log('Starting trufflesuite/ganache-cli:v6.7.0 container');
    await run_ganache(ganachePort);
    console.log('Started trufflesuite/ganache-cli:v6.7.0 container');
};

export const stopDocker = async () => {
    console.log('Stoping elassandra:6.8.4.0 container');
    await kill_container('elassandra-e2e-instance');
    console.log('Stopped elassandra:6.8.4.0 container');

    console.log('Stoping redis:5.0.7 container');
    await kill_container('redis-e2e-instance');
    console.log('Stopped redis:5.0.7 container');

    console.log('Stoping trufflesuite/ganache-cli:v6.7.0 container');
    await kill_container('ganache-e2e-instance');
    console.log('Stopped trufflesuite/ganache-cli:v6.7.0 container');
};

export const runMigrations = async (
    cassandraPort: number,
    elasticSearchPort: number,
) => {
    console.log('Starting Migrations');
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
                console.log('Finished Migrations');
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
    console.log('Reseting Migrations');
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
                console.log('Migrations Reverted');
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

export const createCassandraSnapshot = async () => {
    const container = await Docker.getContainer('elassandra-e2e-instance');
    container.exec(
        {
            Cmd: ['nodetool', 'snapshot', '-t', 'e2e-test-snapshot'],
            AttachStdin: true,
            AttachStdout: true,
        },
        (err, exec) => {
            exec.start({ hijack: true, stdin: true }, function(err, stream) {
                // Fortunately, we have a regular TCP socket now, so when the readstream finishes and closes our
                // stream, it is still open for reading and we will still get our results :-)
                //stream.pipe(process.stdout);
                stream.pipe(process.stdout);
                Docker.modem.followProgress(stream, () => {
                    console.log('Created Initial State Snapshot');
                });
            });
        },
    );
};

export const restoreCassandraSnapshot = async () => {
    const base_path = '/tmp/cassandra-e2e-data';
    const keyspaces_dirs = fs.readdirSync(base_path);

    for (const keyspace of keyspaces_dirs) {
        const tables_dirs = fs.readdirSync(`${base_path}/${keyspace}`);
        for (const table of tables_dirs) {
            if (['elastic_admin'].indexOf(table) !== -1) {
                const columns_dirs = fs.readdirSync(
                    `${base_path}/${keyspace}/${table}`,
                );
                for (const column of columns_dirs) {
                    if (['backup', 'snapshot'].indexOf(column) === -1) {
                        console.log(`Removing ${keyspace} ${table} ${column}`);
                        fs.removeSync(
                            `${base_path}/${keyspace}/${table}/${column}`,
                        );
                    }

                    console.log(`${keyspace} ${table} ${column}`);
                }

                const saved_columns_dirs = fs.readdirSync(
                    `${base_path}/${keyspace}/${table}/snapshot/e2e-test-snapshot/`,
                );

                for (const column of saved_columns_dirs) {
                    console.log(`Recovering ${keyspace} ${table} ${column}`);
                    fs.copySync(
                        `${base_path}/${keyspace}/${table}/snapshot/e2e-test-snapshot/${column}`,
                        `${base_path}/${keyspace}/${table}/${column}`,
                    );
                }
            }
        }
    }
};
