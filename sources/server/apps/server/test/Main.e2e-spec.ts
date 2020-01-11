import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { T721SDK } from '@ticket721sources/sdk';
import { getApiInfo } from './App.case';
import {
    ganache_revert,
    ganache_snapshot,
    prepare,
    resetMigrations,
    runMigrations,
    startDocker,
    stopDocker,
} from './DockerElassandra.util';
import { register, web3register } from './api/Authentication.case';
import { ServerModule } from '../src/Server.module';
import { fetchActions } from './api/Actions.case';

const cassandraPort = 32702;
const elasticSearchPort = 32610;
const redisPort = 32412;
const ganachePort = 38545;

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
        if (process.env.NO_DEPLOY !== 'true') {
            await startDocker(
                cassandraPort,
                elasticSearchPort,
                redisPort,
                ganachePort,
            );
        }
        await runMigrations(cassandraPort, elasticSearchPort);
        await prepare();

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
    }, 60000 * 30);

    afterAll(async function() {
        await context.app.close();
        if (process.env.NO_DEPLOY !== 'true') {
            await stopDocker();
        }
    });

    beforeEach(async function() {
        await ganache_revert(snap_id, ganachePort);
        snap_id = await ganache_snapshot(ganachePort);
        if (first) {
            first = false;
        } else {
            await runMigrations(cassandraPort, elasticSearchPort);
        }
    });

    afterEach(async function() {
        await resetMigrations(cassandraPort, elasticSearchPort);
    });

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
});
