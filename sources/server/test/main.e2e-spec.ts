import { use, expect }                      from 'chai';
import * as chaiAsPromised                  from 'chai-as-promised';

use(chaiAsPromised);
import { Test, TestingModule }              from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule }                        from '../src/app.module';
import { T721SDK }                          from '@ticket721sources/sdk';
import { getApiInfo }                       from './app.case';
import {
    createCassandraSnapshot,
    resetMigrations, restoreCassandraSnapshot,
    runMigrations,
    startElassandra,
    stopElassandra,
} from './docker-elassandra.util';
import * as fs        from 'fs-extra';

const cassandraPort = 32702;
const elasticSearchPort = 32610;

describe('AppController (e2e)', () => {

    let app: INestApplication;
    let sdk: T721SDK;

    before(async function() {

        this.timeout(60000 * 30); // 30 mins to pull & run elassandra

        await startElassandra(cassandraPort, elasticSearchPort);
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

        await new Promise((ok, ko) => setTimeout(ok, 10000));

    });

    after(async function() {
        await app.close();
        await stopElassandra();
    });

    afterEach(async function() {
        await resetMigrations(cassandraPort, elasticSearchPort);
        await runMigrations(cassandraPort, elasticSearchPort);
    });

    describe('AppController', () => {

        it('/ (GET)', getApiInfo);

    });
});
