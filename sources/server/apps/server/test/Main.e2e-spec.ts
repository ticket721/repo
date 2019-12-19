import { use, expect }                      from 'chai';
import * as chaiAsPromised                  from 'chai-as-promised';
import { Test, TestingModule }              from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { T721SDK }                          from '@ticket721sources/sdk';
import { getApiInfo }                       from './App.case';
import {
    resetMigrations,
    runMigrations,
    startDocker, stopDocker,
}                                           from './DockerElassandra.util';
import { register, web3register }           from './api/Authentication.case';
import { ServerModule }                     from '../src/Server.module';

use(chaiAsPromised);
const cassandraPort = 32702;
const elasticSearchPort = 32610;
const redisPort = 32412;

describe('AppController (e2e)', () => {

    let app: INestApplication;
    let sdk: T721SDK;
    let first: boolean = true;

    before(async function() {

        this.timeout(60000 * 30); // 30 mins to pull & run elassandra

        if (process.env.NO_DEPLOY !== 'true') {
            await startDocker(cassandraPort, elasticSearchPort, redisPort);
        }
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

        this.app = app;
        this.sdk = sdk;
        this.expect = expect;

    });

    after(async function() {
        await app.close();
        if (process.env.NO_DEPLOY !== 'true') {
            await stopDocker();
        }
    });

    beforeEach(async function () {
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

        it('/ (GET)', getApiInfo);

    });

    describe('AuthenticationController', () => {

        it('/authentication/local/register & /authentication/local/login (POST)', register);
        it('/authentication/web3/register & /authentication/web3/login (POST)', web3register);

    });

});
