import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { T721SDK } from '@ticket721sources/sdk';
import {
    ganache_revert,
    ganache_snapshot,
    prepare,
    resetMigrations,
    runMigrations,
    startDocker,
    stopDocker,
} from './utils';
import { ServerModule } from '../src/Server.module';
import ascii from './ascii';

import { getApiInfo } from './App.case';
import { register, web3register } from './api/Authentication.case';
import { fetchActions } from './api/Actions.case';
import { fetchDates } from './api/Dates.case';

const cassandraPort = 32702;
const elasticSearchPort = 32610;
const redisPort = 32412;
const ganachePort = 38545;
const vaultereumPorts = [8200, 8201];
const consulPort = 8500;

const context: {
    app: INestApplication;
    sdk: T721SDK;
} = {
    app: null,
    sdk: null,
};

const getCtx = (): { app: INestApplication; sdk: T721SDK } => context;
let snap_id = null;

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let sdk: T721SDK;
    let first: boolean = true;

    beforeAll(async function() {
        process.stdout.write(ascii.beforeAll);
        console.log('STARTED');

        if (process.env.NO_DEPLOY !== 'true') {
            await startDocker();
        }

        await prepare();

        process.stdout.write(ascii.beforeAll);
        console.log('FINISHED');
    }, 60000 * 30);

    afterAll(async function() {
        process.stdout.write(ascii.afterAll);
        console.log('STARTED');

        if (process.env.NO_DEPLOY !== 'true') {
            await stopDocker();
        }

        process.stdout.write(ascii.afterAll);
        console.log('FINISHED');
    }, 60000);

    beforeEach(async function() {
        process.stdout.write(ascii.beforeEach);
        console.log('STARTED');

        await ganache_revert(snap_id, ganachePort);
        snap_id = await ganache_snapshot(ganachePort);
        await runMigrations(cassandraPort, elasticSearchPort);

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ServerModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.enableShutdownHooks();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
        sdk = new T721SDK();
        sdk.local(app.getHttpServer());

        context.app = app;
        context.sdk = sdk;

        if (first) {
            first = false;
        } else {
            await runMigrations(cassandraPort, elasticSearchPort);
        }

        process.stdout.write(ascii.beforeEach);
        console.log('FINISHED');
    }, 60000);

    afterEach(async function() {
        process.stdout.write(ascii.afterEach);
        console.log('STARTED');

        await context.app.close();
        await resetMigrations(cassandraPort, elasticSearchPort);

        process.stdout.write(ascii.afterEach);
        console.log('FINISHED');
    }, 60000);

    describe('AppController', () => {
        test('/ (GET)', getApiInfo.bind(null, getCtx));
    });

    describe('AuthenticationController', () => {
        test(
            '/authentication/local/register & /authentication/local/login (POST)',
            register.bind(null, getCtx),
        );
        test(
            '/authentication/web3/register & /authentication/web3/login (POST)',
            web3register.bind(null, getCtx),
        );
    });

    describe('ActionsController', () => {
        test('/actions/search', fetchActions.bind(null, getCtx));
    });

    describe('DatesController', () => {
        test('/dates/search', fetchDates.bind(null, getCtx));
    });
});
