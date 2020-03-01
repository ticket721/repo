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
import { deployJustice } from './api/Events.case';
import { WorkerModule } from '@app/worker/Worker.module';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';

const cassandraPort = 32702;
const elasticSearchPort = 32610;
const redisPort = 32412;
const ganachePort = 38545;
const vaultereumPorts = [8200, 8201];
const consulPort = 8500;

const context: {
    app: INestApplication;
    worker: INestApplication;
    sdk: T721SDK;
} = {
    app: null,
    worker: null,
    sdk: null,
};

const getCtx = (): { app: INestApplication; sdk: T721SDK } => context;
let snap_id = null;

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let worker: INestApplication;
    let sdk: T721SDK;

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

        const appFixture: TestingModule = await Test.createTestingModule({
            imports: [ServerModule],
        }).compile();
        appFixture.useLogger(new WinstonLoggerService('e2e-server'));
        app = appFixture.createNestApplication();
        app.enableShutdownHooks();
        app.useGlobalPipes(new ValidationPipe());
        app.get(ShutdownService).subscribeToShutdown(() => {
            console.log('Server & Worker Shut Down');
        });
        await app.init();

        const workerFixture: TestingModule = await Test.createTestingModule({
            imports: [WorkerModule],
        }).compile();
        workerFixture.useLogger(new WinstonLoggerService('e2e-server'));
        worker = workerFixture.createNestApplication();
        worker.enableShutdownHooks();
        worker.get(ShutdownService).subscribeToShutdown(() => {
            console.log('Server & Worker Shut Down');
        });
        await worker.init();

        sdk = new T721SDK();
        sdk.local(app.getHttpServer());

        context.app = app;
        context.worker = worker;
        context.sdk = sdk;

        process.stdout.write(ascii.beforeEach);
        console.log('FINISHED');
    }, 60000);

    afterEach(async function() {
        process.stdout.write(ascii.afterEach);
        console.log('STARTED');

        await context.app.close();
        await context.worker.close();
        await new Promise((ok, ko) => setTimeout(ok, 5000));
        await resetMigrations(cassandraPort, elasticSearchPort);

        process.stdout.write(ascii.afterEach);
        console.log('FINISHED');
    }, 60000);

    describe('AppController', () => {
        test('/ (GET)', getApiInfo.bind(null, getCtx));
    });

    describe('AuthenticationController', () => {
        test('/authentication/local/register & /authentication/local/login (POST)', register.bind(null, getCtx));
        test('/authentication/web3/register & /authentication/web3/login (POST)', web3register.bind(null, getCtx));
    });

    describe('ActionsController', () => {
        test('/actions/search', fetchActions.bind(null, getCtx));
    });

    describe('DatesController', () => {
        test('/dates/search', fetchDates.bind(null, getCtx));
    });

    describe('EventsController', () => {
        test('Deploy Event justice (1 event, 2 dates, resale on)', deployJustice.bind(null, getCtx));
    });
});
