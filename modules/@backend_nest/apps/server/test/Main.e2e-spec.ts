jest.setTimeout(30000);
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { T721SDK } from '@common/sdk';
import { prepare, runMigrations, startDocker, stopDocker } from './utils';
import { ServerModule } from '../src/Server.module';
import ascii from './ascii';

import { WorkerModule } from '@app/worker/Worker.module';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';

import AuthenticationControllerTestSuite from '@app/server/authentication/Authentication.controller.routes-spec';
import ActionSetsControllerTestSuite from '@app/server/controllers/actionsets/ActionSets.controller.routes-spec';
import CategoriesControllerTestSuite from '@app/server/controllers/categories/Categories.controller.routes-spec';
import CheckoutControllerTestSuite from '@app/server/controllers/checkout/Checkout.controller.routes-spec';
import ContractsControllerTestSuite from '@app/server/controllers/contracts/Contracts.controller.routes-spec';
import DatesControllerTestSuite from '@app/server/controllers/dates/Dates.controller.routes-spec';
import DosojinControllerTestSuite from '@app/server/controllers/dosojin/Dosojin.controller.routes-spec';
import EventsControllerTestSuite from '@app/server/controllers/events/Events.controller.routes-spec';
import ImagesControllerTestSuite from '@app/server/controllers/images/Images.controller.routes-spec';
import TxsControllerTestSuite from '@app/server/controllers/txs/Txs.controller.routes-spec';

const cassandraPort = 32702;
const elasticSearchPort = 32610;
const redisPort = 32412;
const ganachePort = 38545;
const vaultereumPorts = [8200, 8201];
const consulPort = 8500;

let global_ok;

const context: {
    app: INestApplication;
    worker: INestApplication;
    ready: Promise<void>;
} = {
    app: null,
    worker: null,
    ready: new Promise(ok => {
        global_ok = ok;
    }),
};

const getCtx = (): { ready: Promise<void> } => context;
let snap_id = null;

const shouldDeploy = () => process.env.DEPLOY === 'true';

describe('AppController (e2e)', () => {
    let app: INestApplication;
    let worker: INestApplication;
    let sdk: T721SDK;

    beforeAll(async function() {
        process.stdout.write(ascii.beforeAll);
        console.log('STARTED');

        if (shouldDeploy()) {
            await startDocker();
            await prepare();
            await runMigrations(cassandraPort, elasticSearchPort);
        }

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
        await app.listen(3000);

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

        context.app = app;
        context.worker = worker;

        process.stdout.write(ascii.beforeAll);
        console.log('FINISHED');
        global_ok();
    }, 60000 * 30);

    afterAll(async function() {
        process.stdout.write(ascii.afterAll);
        console.log('STARTED');

        await context.app.close();
        await context.worker.close();

        if (shouldDeploy()) {
            await new Promise((ok, ko) => setTimeout(ok, 5000));
            await stopDocker();
        }

        process.stdout.write(ascii.afterAll);
        console.log('FINISHED');
    }, 60000);

    describe('Authentication Controller', AuthenticationControllerTestSuite(getCtx));
    // describe('ActionSets Controller', ActionSetsControllerTestSuite);
    // describe('Categories Controller', CategoriesControllerTestSuite);
    // describe('Checkout Controller', CheckoutControllerTestSuite);
    // describe('Contracts Controller', ContractsControllerTestSuite);
    // describe('Dates Controller', DatesControllerTestSuite);
    // describe('Dosojin Controller', DosojinControllerTestSuite);
    // describe('Events Controller', EventsControllerTestSuite);
    // describe('Images Controller', ImagesControllerTestSuite);
    // describe('Txs Controller', TxsControllerTestSuite);
});
