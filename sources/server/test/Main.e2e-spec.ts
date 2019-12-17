import { use, expect }                      from 'chai';
import * as chaiAsPromised                  from 'chai-as-promised';
import { Test, TestingModule }              from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule }                        from '../src/App.module';
import { T721SDK }                          from '@ticket721sources/sdk';
import { getApiInfo }                       from './App.case';
import {
    resetMigrations,
    runMigrations,
    startElassandra,
    stopElassandra,
}                                           from './DockerElassandra.util';
import { register }                         from './api/Authentication.case';

use(chaiAsPromised);
const cassandraPort = 32702;
const elasticSearchPort = 32610;

describe('AppController (e2e)', () => {

    let app: INestApplication;
    let sdk: T721SDK;

    before(async function() {

        this.timeout(60000 * 30); // 30 mins to pull & run elassandra

        if (process.env.NO_DEPLOY !== 'true') {
            await startElassandra(cassandraPort, elasticSearchPort);
        }
        await runMigrations(cassandraPort, elasticSearchPort);

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
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
            await stopElassandra();
        }
    });

    afterEach(async function() {
        await resetMigrations(cassandraPort, elasticSearchPort);
        await runMigrations(cassandraPort, elasticSearchPort);
        //await new Promise((ok, ko) => setTimeout(ok, 5000));
    });

    describe('AppController', () => {

        it('/ (GET)', getApiInfo);

    });

    describe('AuthenticationController', () => {

        it('/authentication/register (POST)', register);

    });

});
