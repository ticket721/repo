import { spawn } from 'child_process';
import fs from 'fs-extra';
import Web3 from 'web3';
import readline from 'readline';
import { T721SDK } from '@common/sdk';
import { StatusCodes, StatusNames } from '@lib/common/utils/codes.value';
import _ from 'lodash';
import { AxiosResponse } from 'axios';
import { LocalRegisterResponseDto } from '@app/server/authentication/dto/LocalRegisterResponse.dto';
import { EmailValidationResponseDto } from '@app/server/authentication/dto/EmailValidationResponse.dto';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { ActionsSearchResponseDto } from '@app/server/controllers/actionsets/dto/ActionsSearchResponse.dto';
import CassandraDriver from 'cassandra-driver';
import { EventDto } from '@app/server/controllers/events/dto/Event.dto';
import FormData from 'form-data';
import { ImagesUploadResponseDto } from '@app/server/controllers/images/dto/ImagesUploadResponse.dto';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { anything, instance, mock, when } from 'ts-mockito';
import { Stripe } from 'stripe';
import Crypto from 'crypto';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';
import { TicketsSearchResponseDto } from '@app/server/controllers/tickets/dto/TicketsSearchResponse.dto';
import { NestError } from '@lib/common/utils/NestError';
import { CategoriesSearchResponseDto } from '@app/server/controllers/categories/dto/CategoriesSearchResponse.dto';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';

let docker_compose_up_proc = null;

const readyLogs = [
    {
        line: 'Listening on 0.0.0.0:8545',
        image: 'ganache',
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

    const web3 = new Web3(new Web3.providers.HttpProvider(`http://127.0.0.1:${ganachePort}`));
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

    const web3 = new Web3(new Web3.providers.HttpProvider(`http://127.0.0.1:${ganachePort}`));
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
        ...`T721_CONFIG=./config.ganache.e2e.remote.json gulp contracts::clean network::clean`.split(' '),
    ]);

    await new Promise((ok, ko) => {
        clean_proc.on('close', ok);
    });

    const network_proc = spawn(`env`, [...`T721_CONFIG=./config.ganache.e2e.remote.json gulp network::run`.split(' ')]);

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
        ...`T721_CONFIG=./config.ganache.e2e.remote.json gulp contracts::run`.split(' '),
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

    process.chdir(current_dir);

    console.log('FINISHED @utils/run_contracts_migrations');
}

export const startDocker = async () => {
    console.log('STARTING @utils/startDocker');

    const docker_compose_down_proc = spawn(`docker-compose`, [...`-f ./infra.yaml down`.split(' ')], {
        cwd: `${process.cwd()}/scripts/`,
    });

    await new Promise((ok, ko) => {
        docker_compose_down_proc.on('exit', code => {
            if (code === 0) {
                return ok();
            }
            ko(code);
        });

        docker_compose_down_proc.stderr.on('data', data => {
            process.stderr.write(data.toString());
        });

        docker_compose_down_proc.stdout.on('data', data => {
            process.stdout.write(data.toString());
        });
    });

    const docker_compose_rm_proc = spawn(`docker-compose`, [...`-f ./infra.yaml rm`.split(' ')], {
        cwd: `${process.cwd()}/scripts/`,
    });

    await new Promise((ok, ko) => {
        docker_compose_rm_proc.on('exit', code => {
            if (code === 0) {
                return ok();
            }
            ko(code);
        });

        docker_compose_rm_proc.stderr.on('data', data => {
            process.stderr.write(data.toString());
        });

        docker_compose_rm_proc.stdout.on('data', data => {
            process.stdout.write(data.toString());
        });
    });

    docker_compose_up_proc = spawn(`docker-compose`, [...`-f ./infra.yaml up`.split(' ')], {
        cwd: `${process.cwd()}/scripts/`,
    });

    await new Promise((ok, ko) => {
        let ready = false;

        const err_stream = readline.createInterface({
            input: docker_compose_up_proc.stderr,
        });
        const out_stream = readline.createInterface({
            input: docker_compose_up_proc.stdout,
        });

        err_stream.on('line', (line: string): void => {
            process.stderr.write(line);
            process.stderr.write('\n');
        });

        out_stream.on('line', (line: string): void => {
            if (!ready) {
                process.stdout.write(line);
                process.stdout.write('\n');
            }

            const found = readyLogs.findIndex(ent => {
                if (line.indexOf(ent.line) !== -1) {
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

    const docker_compose_down_proc = spawn(`docker-compose`, [...`-f ./infra.yaml down`.split(' ')], {
        cwd: `${process.cwd()}/scripts/`,
    });

    await new Promise((ok, ko) => {
        docker_compose_down_proc.stderr.on('data', data => {
            process.stderr.write(data);
        });

        docker_compose_down_proc.stdout.on('data', data => {
            process.stdout.write(data);
        });

        docker_compose_down_proc.on('close', ok);
    });

    const docker_compose_rm_proc = spawn(`docker-compose`, [...`-f ./infra.yaml rm`.split(' ')], {
        cwd: `${process.cwd()}/scripts/`,
    });

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

export const runMigrations = async (cassandraPort: number, elasticSearchPort: number) => {
    console.log('STARTING @utils/runMigrations');

    return new Promise((ok, ko) => {
        const current_dir = process.cwd();
        process.chdir('../@backend_migrations');
        const proc = spawn(`env`, [
            ...`CASSANDRA_HOSTS=127.0.0.1 ELASTICSEARCH_HOST=127.0.0.1:${elasticSearchPort} CASSANDRA_PORT=${cassandraPort} CASSANDRA_KEYSPACE=ticket721 node ./migrator.js up`.split(
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

export const resetMigrations = async (cassandraPort: number, elasticSearchPort: number) => {
    console.log('STARTING @utils/resetMigrations');

    return new Promise((ok, ko) => {
        const current_dir = process.cwd();
        process.chdir('../@backend_migrations');
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

export const generateEmail = () => {
    // tslint:disable-next-line:no-bitwise
    return `${_.times(64, () => ((Math.random() * 0xf) << 0).toString(16)).join('')}@ticket721.com`;
};

export const generateUserName = () => {
    // tslint:disable-next-line:no-bitwise
    return _.times(64, () => ((Math.random() * 0xf) << 0).toString(16)).join('');
};

export const getSDK = async (getCtx: () => { ready: Promise<void> }): Promise<T721SDK> => {
    const { ready } = getCtx();

    await ready;

    const sdk = new T721SDK();
    sdk.connect('localhost', 3000, 'http');

    return sdk;
};

export const generatePassword = generateUserName;

export const failWithCode = async (promise: Promise<any>, code: StatusCodes, message?: string): Promise<void> => {
    let res;

    try {
        res = await promise;
    } catch (e) {
        if (!message) {
            expect(e.response.data).toMatchObject({
                statusCode: code,
                name: StatusNames[code],
            });
        } else {
            expect(e.response.data).toMatchObject({
                statusCode: code,
                name: StatusNames[code],
                message,
            });
        }
        return;
    }

    throw new NestError(`Expected request to fail with status ${code}, but succeeded with status ${res.status}`);
};

export const getInvalidUser = async (
    sdk: T721SDK,
): Promise<{
    token: string;
    user: PasswordlessUserDto;
    password: string;
}> => {
    const user = {
        email: generateEmail(),
        username: generateUserName(),
        password: generatePassword(),
    };

    const response: AxiosResponse<LocalRegisterResponseDto> = (await sdk.localRegister(
        user.email,
        user.password,
        user.username,
    )) as AxiosResponse<LocalRegisterResponseDto>;

    return {
        token: response.data.token,
        user: response.data.user,
        password: user.password,
    };
};

export const getUser = async (
    sdk: T721SDK,
): Promise<{
    token: string;
    user: PasswordlessUserDto;
    password: string;
}> => {
    const user = {
        email: generateEmail(),
        username: generateUserName(),
        password: generatePassword(),
    };

    const response: AxiosResponse<LocalRegisterResponseDto> = (await sdk.localRegister(
        user.email,
        user.password,
        user.username,
    )) as AxiosResponse<LocalRegisterResponseDto>;

    const validatedResponse: AxiosResponse<EmailValidationResponseDto> = await sdk.validateEmail(
        response.data.validationToken,
    );

    return {
        token: response.data.token,
        user: validatedResponse.data.user,
        password: user.password,
    };
};

export const pause = async (time: number): Promise<void> => {
    return new Promise(ok => setTimeout(ok, time));
};

export const getSDKAndInvalidUser = async (
    getCtx: () => { ready: Promise<void> },
): Promise<{
    sdk: T721SDK;
    token: string;
    user: PasswordlessUserDto;
    password: string;
}> => {
    const sdk = await getSDK(getCtx);
    const { token, user, password } = await getInvalidUser(sdk);

    return {
        sdk,
        token,
        user,
        password,
    };
};

export const getSDKAndUser = async (
    getCtx: () => { ready: Promise<void> },
): Promise<{
    sdk: T721SDK;
    token: string;
    user: PasswordlessUserDto;
    password: string;
}> => {
    const sdk = await getSDK(getCtx);
    const { token, user, password } = await getUser(sdk);

    return {
        sdk,
        token,
        user,
        password,
    };
};

export const waitForTickets = async (
    sdk: T721SDK,
    token: string,
    address: string,
    checker: (tickets: TicketEntity[]) => boolean,
): Promise<TicketEntity[]> => {
    let tickets: AxiosResponse<TicketsSearchResponseDto>;

    do {
        tickets = await sdk.tickets.search(token, {
            owner: {
                $eq: address,
            },
        });
        await pause(10);
    } while (!checker(tickets.data.tickets));

    return tickets.data.tickets;
};

export const waitForCategory = async (
    sdk: T721SDK,
    token: string,
    id: string,
    checker: (as: CategoryEntity) => boolean,
): Promise<CategoryEntity> => {
    let category: AxiosResponse<CategoriesSearchResponseDto>;

    do {
        category = await sdk.categories.search(token, {
            id: {
                $eq: id,
            },
        });
        await pause(10);
    } while (!checker(category.data.categories[0]));

    return category.data.categories[0];
};

export const waitForActionSet = async (
    sdk: T721SDK,
    token: string,
    id: string,
    checker: (as: ActionSetEntity) => boolean,
): Promise<ActionSetEntity> => {
    let actionSet: AxiosResponse<ActionsSearchResponseDto>;

    do {
        actionSet = await sdk.actions.search(token, {
            id: {
                $eq: id,
            },
        });
        if (actionSet.data.actionsets[0]) {
            const actionSetClass = new ActionSet().load(actionSet.data.actionsets[0]);

            switch (actionSetClass.actions[actionSetClass.current_action].status) {
                case 'error':
                case 'input:error':
                case 'event:error': {
                    // console.log(`Received ActionSet with status ${actionSetClass.actions[actionSetClass.current_action].status}`);
                    // console.log(`=> ${JSON.stringify(actionSetClass.actions[actionSetClass.current_action].error, null, 4)}`)
                }
            }
        }
        await pause(10);
    } while (!checker(actionSet.data.actionsets[0]));

    return actionSet.data.actionsets[0];
};

export const admin_setAdmin = async (user: string): Promise<void> => {
    const client = new CassandraDriver.Client({
        contactPoints: ['localhost'],
        keyspace: 'ticket721',
        protocolOptions: {
            port: 32702,
        },
        queryOptions: {
            consistency: 1,
        },
    });

    const query = `UPDATE ticket721.user SET admin=true where id=${user};`;

    await client.execute(query);
};
export const admin_addRight = async (
    user: string,
    entity: string,
    entity_value: string,
    rights: string,
): Promise<void> => {
    const client = new CassandraDriver.Client({
        contactPoints: ['localhost'],
        keyspace: 'ticket721',
        protocolOptions: {
            port: 32702,
        },
        queryOptions: {
            consistency: 1,
        },
    });

    const query = `INSERT INTO ticket721.right (grantee_id, entity_type, entity_value, rights) VALUES (${user}, '${entity}', '${entity_value}', ${rights});`;

    await client.execute(query);
};

export const createEventWithUltraVIP = async (token: string, sdk: T721SDK): Promise<EventDto> => {
    const initialArgument = {};

    const actionSetName = 'event_create';

    const eventCreationActionSetRes = await sdk.actions.create(token, {
        name: actionSetName,
        arguments: initialArgument,
    });

    const actionSetId = eventCreationActionSetRes.data.actionset.id;

    await sdk.events.create.textMetadata(token, actionSetId, {
        name: 'myEvent',
        description: 'This is my event',
        tags: ['test', 'event'],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 1;
    });

    const form = new FormData();

    form.append('images', fs.readFileSync(__dirname + '/../src/controllers/events/test_resources/test_avatar.png'), {
        filename: 'avatar.png',
    });

    const imageUploadRes: AxiosResponse<ImagesUploadResponseDto> = await sdk.images.upload(
        token,
        form.getBuffer(),
        form.getHeaders(),
    );

    const avatarId = imageUploadRes.data.urls[0];

    await sdk.events.create.imagesMetadata(token, actionSetId, {
        avatar: avatarId,
        signatureColors: ['#ff0000', '#00ff00'],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 2;
    });

    await sdk.events.create.modulesConfiguration(token, actionSetId, {});

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 3;
    });

    await sdk.events.create.datesConfiguration(token, actionSetId, {
        dates: [
            {
                name: 'first date',
                eventBegin: new Date(Date.now() + 1000000),
                eventEnd: new Date(Date.now() + 2000000),
                location: {
                    lat: 40.75901,
                    lon: -73.984474,
                    label: 'Times Square',
                },
            },
            {
                name: 'second date',
                eventBegin: new Date(Date.now() + 1000000),
                eventEnd: new Date(Date.now() + 2000000),
                location: {
                    lat: 40.75901,
                    lon: -73.984474,
                    label: 'Times Square',
                },
            },
        ],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 4;
    });

    await sdk.events.create.categoriesConfiguration(token, actionSetId, {
        global: [
            {
                name: 'VIP Tickets',
                saleBegin: new Date(Date.now() - 1000000),
                saleEnd: new Date(Date.now() + 23 * 1000000),
                resaleBegin: new Date(Date.now() - 1000000),
                resaleEnd: new Date(Date.now() + 23 * 1000000),
                seats: 100,
                currencies: [
                    {
                        currency: 'Fiat',
                        price: '200',
                    },
                ],
            },
            {
                name: 'Ultra VIP Tickets',
                saleBegin: new Date(Date.now() - 1000000),
                saleEnd: new Date(Date.now() + 23 * 1000000),
                resaleBegin: new Date(Date.now() - 1000000),
                resaleEnd: new Date(Date.now() + 23 * 1000000),
                seats: 2,
                currencies: [
                    {
                        currency: 'Fiat',
                        price: '200',
                    },
                ],
            },
        ],
        dates: [
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() - 1000000),
                    saleEnd: new Date(Date.now() + 23 * 1000000),
                    resaleBegin: new Date(Date.now() - 1000000),
                    resaleEnd: new Date(Date.now() + 23 * 1000000),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '200',
                        },
                    ],
                },
            ],
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() - 1000000),
                    saleEnd: new Date(Date.now() + 23 * 1000000),
                    resaleBegin: new Date(Date.now() - 1000000),
                    resaleEnd: new Date(Date.now() + 23 * 1000000),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '200',
                        },
                    ],
                },
            ],
        ],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 5;
    });

    await sdk.events.create.adminsConfiguration(token, actionSetId, {
        admins: [],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_status === 'complete';
    });

    const eventEntityRes = await sdk.events.create.create(token, {
        //completedActionSet: actionSetId,
        eventPayload: null,
    });

    return eventEntityRes.data.event;
};

export const editEventActionSet = async (token: string, sdk: T721SDK, actionSetId: string): Promise<string> => {
    await sdk.events.create.adminsConfiguration(token, actionSetId, {
        admins: [],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_status === 'complete';
    });

    await sdk.events.create.categoriesConfiguration(token, actionSetId, {
        global: [
            {
                name: 'VIP Tickets',
                saleBegin: new Date(Date.now() - 1000000),
                saleEnd: new Date(Date.now() + 23 * 1000000),
                resaleBegin: new Date(Date.now() - 1000000),
                resaleEnd: new Date(Date.now() + 23 * 1000000),
                seats: 100,
                currencies: [
                    {
                        currency: 'Fiat',
                        price: '200',
                    },
                ],
            },
        ],
        dates: [
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() - 1000000),
                    saleEnd: new Date(Date.now() + 23 * 1000000),
                    resaleBegin: new Date(Date.now() - 1000000),
                    resaleEnd: new Date(Date.now() + 23 * 1000000),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '200',
                        },
                    ],
                },
            ],
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() - 1000000),
                    saleEnd: new Date(Date.now() + 23 * 1000000),
                    resaleBegin: new Date(Date.now() - 1000000),
                    resaleEnd: new Date(Date.now() + 23 * 1000000),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '200',
                        },
                    ],
                },
            ],
        ],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_status === 'complete';
    });

    await sdk.events.create.datesConfiguration(token, actionSetId, {
        dates: [
            {
                name: 'first date',
                eventBegin: new Date(Date.now() + 1000000),
                eventEnd: new Date(Date.now() + 2000000),
                location: {
                    lat: 40.75901,
                    lon: -73.984474,
                    label: 'Times Square',
                },
            },
            {
                name: 'second date',
                eventBegin: new Date(Date.now() + 1000000),
                eventEnd: new Date(Date.now() + 2000000),
                location: {
                    lat: 40.75901,
                    lon: -73.984474,
                    label: 'Times Square',
                },
            },
        ],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_status === 'complete';
    });

    await sdk.events.create.modulesConfiguration(token, actionSetId, {});

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_status === 'complete';
    });

    const form = new FormData();

    form.append('images', fs.readFileSync(__dirname + '/../src/controllers/events/test_resources/test_avatar.png'), {
        filename: 'avatar.png',
    });

    const imageUploadRes: AxiosResponse<ImagesUploadResponseDto> = await sdk.images.upload(
        token,
        form.getBuffer(),
        form.getHeaders(),
    );

    const avatarId = imageUploadRes.data.urls[0];

    await sdk.events.create.imagesMetadata(token, actionSetId, {
        avatar: avatarId,
        signatureColors: ['#ffff00', '#00ff00'],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_status === 'complete';
    });

    await sdk.events.create.textMetadata(token, actionSetId, {
        name: 'myEvent',
        description: 'This is my event',
        tags: ['test', 'event'],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_status === 'complete';
    });

    return actionSetId;
};

export const createEventActionSet = async (token: string, sdk: T721SDK): Promise<string> => {
    const initialArgument = {};

    const actionSetName = 'event_create';

    const eventCreationActionSetRes = await sdk.actions.create(token, {
        name: actionSetName,
        arguments: initialArgument,
    });

    const actionSetId = eventCreationActionSetRes.data.actionset.id;

    await sdk.events.create.textMetadata(token, actionSetId, {
        name: 'myEvent',
        description: 'This is my event',
        tags: ['test', 'event'],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 1;
    });

    const form = new FormData();

    form.append('images', fs.readFileSync(__dirname + '/../src/controllers/events/test_resources/test_avatar.png'), {
        filename: 'avatar.png',
    });

    const imageUploadRes: AxiosResponse<ImagesUploadResponseDto> = await sdk.images.upload(
        token,
        form.getBuffer(),
        form.getHeaders(),
    );

    const avatarId = imageUploadRes.data.urls[0];

    await sdk.events.create.imagesMetadata(token, actionSetId, {
        avatar: avatarId,
        signatureColors: ['#ff0000', '#00ff00'],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 2;
    });

    await sdk.events.create.modulesConfiguration(token, actionSetId, {});

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 3;
    });

    await sdk.events.create.datesConfiguration(token, actionSetId, {
        dates: [
            {
                name: 'first date',
                eventBegin: new Date(Date.now() + 1000000),
                eventEnd: new Date(Date.now() + 2000000),
                location: {
                    lat: 40.75901,
                    lon: -73.984474,
                    label: 'Times Square',
                },
            },
            {
                name: 'second date',
                eventBegin: new Date(Date.now() + 1000000),
                eventEnd: new Date(Date.now() + 2000000),
                location: {
                    lat: 40.75901,
                    lon: -73.984474,
                    label: 'Times Square',
                },
            },
        ],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 4;
    });

    await sdk.events.create.categoriesConfiguration(token, actionSetId, {
        global: [
            {
                name: 'VIP Tickets',
                saleBegin: new Date(Date.now() - 1000000),
                saleEnd: new Date(Date.now() + 23 * 1000000),
                resaleBegin: new Date(Date.now() - 1000000),
                resaleEnd: new Date(Date.now() + 23 * 1000000),
                seats: 100,
                currencies: [
                    {
                        currency: 'Fiat',
                        price: '200',
                    },
                ],
            },
        ],
        dates: [
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() - 1000000),
                    saleEnd: new Date(Date.now() + 23 * 1000000),
                    resaleBegin: new Date(Date.now() - 1000000),
                    resaleEnd: new Date(Date.now() + 23 * 1000000),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '200',
                        },
                    ],
                },
            ],
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() - 1000000),
                    saleEnd: new Date(Date.now() + 23 * 1000000),
                    resaleBegin: new Date(Date.now() - 1000000),
                    resaleEnd: new Date(Date.now() + 23 * 1000000),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '200',
                        },
                    ],
                },
            ],
        ],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 5;
    });

    await sdk.events.create.adminsConfiguration(token, actionSetId, {
        admins: [],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_status === 'complete';
    });

    return actionSetId;
};

export const createLostEvent = async (token: string, sdk: T721SDK): Promise<EventDto> => {
    const initialArgument = {};

    const actionSetName = 'event_create';

    const eventCreationActionSetRes = await sdk.actions.create(token, {
        name: actionSetName,
        arguments: initialArgument,
    });

    const actionSetId = eventCreationActionSetRes.data.actionset.id;

    await sdk.events.create.textMetadata(token, actionSetId, {
        name: 'myEvent',
        description: 'This is my event',
        tags: ['test', 'event'],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 1;
    });

    const form = new FormData();

    form.append('images', fs.readFileSync(__dirname + '/../src/controllers/events/test_resources/test_avatar.png'), {
        filename: 'avatar.png',
    });

    const imageUploadRes: AxiosResponse<ImagesUploadResponseDto> = await sdk.images.upload(
        token,
        form.getBuffer(),
        form.getHeaders(),
    );

    const avatarId = imageUploadRes.data.urls[0];

    await sdk.events.create.imagesMetadata(token, actionSetId, {
        avatar: avatarId,
        signatureColors: ['#ff0000', '#00ff00'],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 2;
    });

    await sdk.events.create.modulesConfiguration(token, actionSetId, {});

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 3;
    });

    await sdk.events.create.datesConfiguration(token, actionSetId, {
        dates: [
            {
                name: 'first date',
                eventBegin: new Date(Date.now() + 1000000),
                eventEnd: new Date(Date.now() + 2000000),
                location: {
                    lat: 0,
                    lon: 0,
                    label: 'Times Square',
                },
            },
            {
                name: 'second date',
                eventBegin: new Date(Date.now() + 1000000),
                eventEnd: new Date(Date.now() + 2000000),
                location: {
                    lat: 0.001,
                    lon: 0.001,
                    label: 'Times Square',
                },
            },
        ],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 4;
    });

    await sdk.events.create.categoriesConfiguration(token, actionSetId, {
        global: [
            {
                name: 'VIP Tickets',
                saleBegin: new Date(Date.now() - 1000000),
                saleEnd: new Date(Date.now() + 23 * 1000000),
                resaleBegin: new Date(Date.now() - 1000000),
                resaleEnd: new Date(Date.now() + 23 * 1000000),
                seats: 100,
                currencies: [
                    {
                        currency: 'Fiat',
                        price: '200',
                    },
                ],
            },
        ],
        dates: [
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() - 1000000),
                    saleEnd: new Date(Date.now() + 23 * 1000000),
                    resaleBegin: new Date(Date.now() - 1000000),
                    resaleEnd: new Date(Date.now() + 23 * 1000000),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '200',
                        },
                    ],
                },
            ],
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() - 1000000),
                    saleEnd: new Date(Date.now() + 23 * 1000000),
                    resaleBegin: new Date(Date.now() - 1000000),
                    resaleEnd: new Date(Date.now() + 23 * 1000000),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '200',
                        },
                    ],
                },
            ],
        ],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 5;
    });

    await sdk.events.create.adminsConfiguration(token, actionSetId, {
        admins: [],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_status === 'complete';
    });

    const eventEntityRes = await sdk.events.create.create(token, {
        eventPayload: null,
    });

    await sdk.events.start(token, {
        event: eventEntityRes.data.event.id,
    });

    return eventEntityRes.data.event;
};

export const createFuzzyEvent = async (token: string, sdk: T721SDK): Promise<EventDto> => {
    const initialArgument = {};

    const actionSetName = 'event_create';

    const eventCreationActionSetRes = await sdk.actions.create(token, {
        name: actionSetName,
        arguments: initialArgument,
    });

    const actionSetId = eventCreationActionSetRes.data.actionset.id;

    await sdk.events.create.textMetadata(token, actionSetId, {
        name: 'Fuzzy',
        description: 'My Event',
        tags: ['test', 'event'],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 1;
    });

    const form = new FormData();

    form.append('images', fs.readFileSync(__dirname + '/../src/controllers/events/test_resources/test_avatar.png'), {
        filename: 'avatar.png',
    });

    const imageUploadRes: AxiosResponse<ImagesUploadResponseDto> = await sdk.images.upload(
        token,
        form.getBuffer(),
        form.getHeaders(),
    );

    const avatarId = imageUploadRes.data.urls[0];

    await sdk.events.create.imagesMetadata(token, actionSetId, {
        avatar: avatarId,
        signatureColors: ['#ff0000', '#00ff00'],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 2;
    });

    await sdk.events.create.modulesConfiguration(token, actionSetId, {});

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 3;
    });

    await sdk.events.create.datesConfiguration(token, actionSetId, {
        dates: [
            {
                name: 'fuzzy',
                eventBegin: new Date(Date.now() + 1000000),
                eventEnd: new Date(Date.now() + 2000000),
                location: {
                    lat: 40.75901,
                    lon: -73.984474,
                    label: 'Times Square',
                },
            },
            {
                name: 'fuzzy',
                eventBegin: new Date(Date.now() + 1000000),
                eventEnd: new Date(Date.now() + 2000000),
                location: {
                    lat: 40.75901,
                    lon: -73.984474,
                    label: 'Times Square',
                },
            },
        ],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 4;
    });

    await sdk.events.create.categoriesConfiguration(token, actionSetId, {
        global: [
            {
                name: 'VIP Tickets',
                saleBegin: new Date(Date.now() - 1000000),
                saleEnd: new Date(Date.now() + 23 * 1000000),
                resaleBegin: new Date(Date.now() - 1000000),
                resaleEnd: new Date(Date.now() + 23 * 1000000),
                seats: 100,
                currencies: [
                    {
                        currency: 'Fiat',
                        price: '200',
                    },
                ],
            },
        ],
        dates: [
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() - 1000000),
                    saleEnd: new Date(Date.now() + 23 * 1000000),
                    resaleBegin: new Date(Date.now() - 1000000),
                    resaleEnd: new Date(Date.now() + 23 * 1000000),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '200',
                        },
                    ],
                },
            ],
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() - 1000000),
                    saleEnd: new Date(Date.now() + 23 * 1000000),
                    resaleBegin: new Date(Date.now() - 1000000),
                    resaleEnd: new Date(Date.now() + 23 * 1000000),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '200',
                        },
                    ],
                },
            ],
        ],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 5;
    });

    await sdk.events.create.adminsConfiguration(token, actionSetId, {
        admins: [],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_status === 'complete';
    });

    const eventEntityRes = await sdk.events.create.create(token, {
        eventPayload: null,
    });

    await sdk.events.start(token, {
        event: eventEntityRes.data.event.id,
    });

    return eventEntityRes.data.event;
};

export const createEvent = async (token: string, sdk: T721SDK): Promise<EventDto> => {
    const initialArgument = {};

    const actionSetName = 'event_create';

    const eventCreationActionSetRes = await sdk.actions.create(token, {
        name: actionSetName,
        arguments: initialArgument,
    });

    const actionSetId = eventCreationActionSetRes.data.actionset.id;

    await sdk.events.create.textMetadata(token, actionSetId, {
        name: 'myEvent',
        description: 'This is my event',
        tags: ['test', 'event'],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 1;
    });

    const form = new FormData();

    form.append('images', fs.readFileSync(__dirname + '/../src/controllers/events/test_resources/test_avatar.png'), {
        filename: 'avatar.png',
    });

    const imageUploadRes: AxiosResponse<ImagesUploadResponseDto> = await sdk.images.upload(
        token,
        form.getBuffer(),
        form.getHeaders(),
    );

    const avatarId = imageUploadRes.data.urls[0];

    await sdk.events.create.imagesMetadata(token, actionSetId, {
        avatar: avatarId,
        signatureColors: ['#ff0000', '#00ff00'],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 2;
    });

    await sdk.events.create.modulesConfiguration(token, actionSetId, {});

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 3;
    });

    await sdk.events.create.datesConfiguration(token, actionSetId, {
        dates: [
            {
                name: 'first date',
                eventBegin: new Date(Date.now() + 1000000),
                eventEnd: new Date(Date.now() + 2000000),
                location: {
                    lat: 40.75901,
                    lon: -73.984474,
                    label: 'Times Square',
                },
            },
            {
                name: 'second date',
                eventBegin: new Date(Date.now() + 1000000),
                eventEnd: new Date(Date.now() + 2000000),
                location: {
                    lat: 40.75901,
                    lon: -73.984474,
                    label: 'Times Square',
                },
            },
        ],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 4;
    });

    await sdk.events.create.categoriesConfiguration(token, actionSetId, {
        global: [
            {
                name: 'VIP Tickets',
                saleBegin: new Date(Date.now() - 1000000),
                saleEnd: new Date(Date.now() + 23 * 1000000),
                resaleBegin: new Date(Date.now() + 1000000),
                resaleEnd: new Date(Date.now() + 23 * 1000000),
                seats: 100,
                currencies: [
                    {
                        currency: 'Fiat',
                        price: '200',
                    },
                ],
            },
        ],
        dates: [
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() - 1000000),
                    saleEnd: new Date(Date.now() + 23 * 1000000),
                    resaleBegin: new Date(Date.now() + 1000000),
                    resaleEnd: new Date(Date.now() + 23 * 1000000),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '200',
                        },
                    ],
                },
            ],
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() - 1000000),
                    saleEnd: new Date(Date.now() + 23 * 1000000),
                    resaleBegin: new Date(Date.now() + 1000000),
                    resaleEnd: new Date(Date.now() + 23 * 1000000),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '200',
                        },
                    ],
                },
            ],
        ],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 5;
    });

    await sdk.events.create.adminsConfiguration(token, actionSetId, {
        admins: [],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_status === 'complete';
    });

    const eventEntityRes = await sdk.events.create.create(token, {
        eventPayload: null,
    });

    return eventEntityRes.data.event;
};

export const createExpensiveEvent = async (token: string, sdk: T721SDK): Promise<EventDto> => {
    const initialArgument = {};

    const actionSetName = 'event_create';

    const eventCreationActionSetRes = await sdk.actions.create(token, {
        name: actionSetName,
        arguments: initialArgument,
    });

    const actionSetId = eventCreationActionSetRes.data.actionset.id;

    await sdk.events.create.textMetadata(token, actionSetId, {
        name: 'myEvent',
        description: 'This is my event',
        tags: ['test', 'event'],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 1;
    });

    const form = new FormData();

    form.append('images', fs.readFileSync(__dirname + '/../src/controllers/events/test_resources/test_avatar.png'), {
        filename: 'avatar.png',
    });

    const imageUploadRes: AxiosResponse<ImagesUploadResponseDto> = await sdk.images.upload(
        token,
        form.getBuffer(),
        form.getHeaders(),
    );

    const avatarId = imageUploadRes.data.urls[0];

    await sdk.events.create.imagesMetadata(token, actionSetId, {
        avatar: avatarId,
        signatureColors: ['#ff0000', '#00ff00'],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 2;
    });

    await sdk.events.create.modulesConfiguration(token, actionSetId, {});

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 3;
    });

    await sdk.events.create.datesConfiguration(token, actionSetId, {
        dates: [
            {
                name: 'first date',
                eventBegin: new Date(Date.now() + 1000000),
                eventEnd: new Date(Date.now() + 2000000),
                location: {
                    lat: 40.75901,
                    lon: -73.984474,
                    label: 'Times Square',
                },
            },
            {
                name: 'second date',
                eventBegin: new Date(Date.now() + 1000000),
                eventEnd: new Date(Date.now() + 2000000),
                location: {
                    lat: 40.75901,
                    lon: -73.984474,
                    label: 'Times Square',
                },
            },
        ],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 4;
    });

    await sdk.events.create.categoriesConfiguration(token, actionSetId, {
        global: [
            {
                name: 'VIP Tickets',
                saleBegin: new Date(Date.now() - 1000000),
                saleEnd: new Date(Date.now() + 23 * 1000000),
                resaleBegin: new Date(Date.now() + 1000000),
                resaleEnd: new Date(Date.now() + 23 * 1000000),
                seats: 100,
                currencies: [
                    {
                        currency: 'Fiat',
                        price: '10000',
                    },
                ],
            },
        ],
        dates: [
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() - 1000000),
                    saleEnd: new Date(Date.now() + 23 * 1000000),
                    resaleBegin: new Date(Date.now() + 1000000),
                    resaleEnd: new Date(Date.now() + 23 * 1000000),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '10000',
                        },
                    ],
                },
            ],
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() - 1000000),
                    saleEnd: new Date(Date.now() + 23 * 1000000),
                    resaleBegin: new Date(Date.now() + 1000000),
                    resaleEnd: new Date(Date.now() + 23 * 1000000),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '10000',
                        },
                    ],
                },
            ],
        ],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 5;
    });

    await sdk.events.create.adminsConfiguration(token, actionSetId, {
        admins: [],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_status === 'complete';
    });

    const eventEntityRes = await sdk.events.create.create(token, {
        eventPayload: null,
    });

    return eventEntityRes.data.event;
};

export const createLimitedEvent = async (token: string, sdk: T721SDK): Promise<EventDto> => {
    const initialArgument = {};

    const actionSetName = 'event_create';

    const eventCreationActionSetRes = await sdk.actions.create(token, {
        name: actionSetName,
        arguments: initialArgument,
    });

    const actionSetId = eventCreationActionSetRes.data.actionset.id;

    await sdk.events.create.textMetadata(token, actionSetId, {
        name: 'myEvent',
        description: 'This is my event',
        tags: ['test', 'event'],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 1;
    });

    const form = new FormData();

    form.append('images', fs.readFileSync(__dirname + '/../src/controllers/events/test_resources/test_avatar.png'), {
        filename: 'avatar.png',
    });

    const imageUploadRes: AxiosResponse<ImagesUploadResponseDto> = await sdk.images.upload(
        token,
        form.getBuffer(),
        form.getHeaders(),
    );

    const avatarId = imageUploadRes.data.urls[0];

    await sdk.events.create.imagesMetadata(token, actionSetId, {
        avatar: avatarId,
        signatureColors: ['#ff0000', '#00ff00'],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 2;
    });

    await sdk.events.create.modulesConfiguration(token, actionSetId, {});

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 3;
    });

    await sdk.events.create.datesConfiguration(token, actionSetId, {
        dates: [
            {
                name: 'first date',
                eventBegin: new Date(Date.now() + 1000000),
                eventEnd: new Date(Date.now() + 2000000),
                location: {
                    lat: 40.75901,
                    lon: -73.984474,
                    label: 'Times Square',
                },
            },
            {
                name: 'second date',
                eventBegin: new Date(Date.now() + 1000000),
                eventEnd: new Date(Date.now() + 2000000),
                location: {
                    lat: 40.75901,
                    lon: -73.984474,
                    label: 'Times Square',
                },
            },
        ],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 4;
    });

    await sdk.events.create.categoriesConfiguration(token, actionSetId, {
        global: [
            {
                name: 'VIP Tickets',
                saleBegin: new Date(Date.now() - 1000000),
                saleEnd: new Date(Date.now() + 23 * 1000000),
                resaleBegin: new Date(Date.now() + 1000000),
                resaleEnd: new Date(Date.now() + 23 * 1000000),
                seats: 3,
                currencies: [
                    {
                        currency: 'Fiat',
                        price: '10000',
                    },
                ],
            },
        ],
        dates: [
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() - 1000000),
                    saleEnd: new Date(Date.now() + 23 * 1000000),
                    resaleBegin: new Date(Date.now() + 1000000),
                    resaleEnd: new Date(Date.now() + 23 * 1000000),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '10000',
                        },
                    ],
                },
            ],
            [
                {
                    name: 'Regular Tickets',
                    saleBegin: new Date(Date.now() - 1000000),
                    saleEnd: new Date(Date.now() + 23 * 1000000),
                    resaleBegin: new Date(Date.now() + 1000000),
                    resaleEnd: new Date(Date.now() + 23 * 1000000),
                    seats: 200,
                    currencies: [
                        {
                            currency: 'Fiat',
                            price: '10000',
                        },
                    ],
                },
            ],
        ],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_action === 5;
    });

    await sdk.events.create.adminsConfiguration(token, actionSetId, {
        admins: [],
    });

    await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        return as.current_status === 'complete';
    });

    const eventEntityRes = await sdk.events.create.create(token, {
        eventPayload: null,
    });

    return eventEntityRes.data.event;
};

let stripeMock: Stripe;
let paymentIntentsResourceMock: Stripe.PaymentIntentsResource;
let payoutsResourceMock: Stripe.PayoutsResource;
let refundsResourceMock: Stripe.RefundsResource;

export const setupStripeMock = (): Stripe => {
    stripeMock = mock(Stripe);

    paymentIntentsResourceMock = mock(Stripe.PaymentIntentsResource);
    payoutsResourceMock = mock(Stripe.PayoutsResource);
    refundsResourceMock = mock(Stripe.RefundsResource);

    when(stripeMock.paymentIntents).thenReturn(instance(paymentIntentsResourceMock));
    when(stripeMock.payouts).thenReturn(instance(payoutsResourceMock));
    when(stripeMock.refunds).thenReturn(instance(refundsResourceMock));

    when(paymentIntentsResourceMock.create(anything())).thenCall(
        async (pi: Stripe.PaymentIntentCreateParams): Promise<Stripe.PaymentIntent> => {
            const client_secret = Crypto.randomBytes(32).toString('base64');
            const id = createPaymentIntent(pi as Stripe.PaymentIntent);

            return {
                id,
                ...pi,
                status: 'requires_payment_method',
                client_secret,
            } as Stripe.PaymentIntent;
        },
    );

    return stripeMock;
};

export const createPaymentIntent = (content: Partial<Stripe.PaymentIntent>): string => {
    const randomB64 = Crypto.randomBytes(32).toString('base64');

    const id = `pi_${randomB64}`;

    when(paymentIntentsResourceMock.retrieve(id, anything(), anything())).thenResolve({
        ...content,
        id,
    } as Stripe.PaymentIntent);
    when(paymentIntentsResourceMock.retrieve(id, anything())).thenResolve({
        ...content,
        id,
    } as Stripe.PaymentIntent);
    when(paymentIntentsResourceMock.retrieve(id)).thenResolve({
        ...content,
        id,
    } as Stripe.PaymentIntent);
    when(paymentIntentsResourceMock.capture(id, anything())).thenCall(
        async (id, amount): Promise<any> => {
            const pi = await instance(paymentIntentsResourceMock).retrieve(id);
            const newPi = {
                ...pi,
                amount_capturable: 0,
                amount_received: amount.amount_to_capture,
                status: 'succeeded',
                charges: {
                    data: [
                        {
                            ...(pi.charges?.data[0] || {}),
                            amount_refunded: pi.amount - amount.amount_to_capture,
                        },
                    ],
                } as any,
            };

            setPaymentIntent(id, newPi as any);

            return newPi;
        },
    );

    return id;
};

export const setPaymentIntent = (id: string, content: Partial<Stripe.PaymentIntent>): void => {
    when(paymentIntentsResourceMock.retrieve(id)).thenResolve({
        ...content,
        id,
    } as Stripe.PaymentIntent);
    when(paymentIntentsResourceMock.retrieve(id, anything())).thenResolve({
        ...content,
        id,
    } as Stripe.PaymentIntent);
    when(paymentIntentsResourceMock.retrieve(id, anything(), anything())).thenResolve({
        ...content,
        id,
    } as Stripe.PaymentIntent);
};

export const getMocks = (): [Stripe, Stripe.PaymentIntentsResource, Stripe.PayoutsResource, Stripe.RefundsResource] => {
    return [stripeMock, paymentIntentsResourceMock, payoutsResourceMock, refundsResourceMock];
};

export const gemFail = async (sdk: T721SDK, token: string, id: string, body: any): Promise<void> => {
    const gemReq = await sdk.dosojin.search(token, {
        id: {
            $eq: id,
        },
    });

    if (gemReq.data.gemOrders.length === 0) {
        throw new NestError('Cannot find gem');
    }

    const gem = gemReq.data.gemOrders[0].gem;

    expect(gem.error_info).toMatchObject(body);
};

export const getPIFromCart = async (sdk: T721SDK, token: string, cart: string): Promise<string> => {
    const cartActionSetBeforeRes = await sdk.actions.search(token, {
        id: {
            $eq: cart,
        },
    });
    const cartEntity = cartActionSetBeforeRes.data.actionsets[0];
    return JSON.parse(cartEntity.actions[2].data).paymentIntentId;
};

export const invalidateCardPayment = async (pi: string): Promise<void> => {
    const storedPi = await instance(getMocks()[1]).retrieve(pi);
    setPaymentIntent(pi, {
        ...storedPi,
        amount_capturable: storedPi.amount / 2,
        charges: {
            data: [
                {
                    payment_method_details: {
                        type: 'card',
                        card: {
                            country: 'FR',
                        },
                    },
                },
            ],
        },
        status: 'requires_capture',
    } as any);
};

export const validateCardPayment = async (pi: string): Promise<void> => {
    const storedPi = await instance(getMocks()[1]).retrieve(pi);
    setPaymentIntent(pi, {
        ...storedPi,
        amount_capturable: storedPi.amount,
        charges: {
            data: [
                {
                    payment_method_details: {
                        type: 'card',
                        card: {
                            country: 'FR',
                        },
                    },
                },
            ],
        },
        status: 'requires_capture',
    } as any);
};
