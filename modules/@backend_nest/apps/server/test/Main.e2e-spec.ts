jest.setTimeout(process.env.JEST_GLOBAL_TIMEOUT ? parseInt(process.env.JEST_GLOBAL_TIMEOUT, 10) : 120000);
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { T721SDK } from '@common/sdk';
import { createPaymentIntent, prepare, runMigrations, setupStripeMock, startDocker, stopDocker } from './utils';
import { ServerModule } from '../src/Server.module';
import ascii from './ascii';

import { WorkerModule } from '@app/worker/Worker.module';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';

import AuthenticationControllerTestSuite from '@app/server/authentication/Authentication.controller.routes-spec';
import ServerControllerTestSuite from '@app/server/controllers/server/Server.controller.routes-spec';
import ActionSetsControllerTestSuite from '@app/server/controllers/actionsets/ActionSets.controller.routes-spec';
import UsersControllerTestSuite from '@app/server/controllers/users/Users.controller.routes-spec';
import CategoriesControllerTestSuite from '@app/server/controllers/categories/Categories.controller.routes-spec';
import CheckoutControllerTestSuite from '@app/server/controllers/checkout/Checkout.controller.routes-spec';
import ContractsControllerTestSuite from '@app/server/controllers/contracts/Contracts.controller.routes-spec';
import DatesControllerTestSuite from '@app/server/controllers/dates/Dates.controller.routes-spec';
import DosojinControllerTestSuite from '@app/server/controllers/dosojin/Dosojin.controller.routes-spec';
import EventsControllerTestSuite from '@app/server/controllers/events/Events.controller.routes-spec';
import ImagesControllerTestSuite from '@app/server/controllers/images/Images.controller.routes-spec';
import TxsControllerTestSuite from '@app/server/controllers/txs/Txs.controller.routes-spec';
import RightsControllerTestSuite from '@app/server/controllers/rights/Rights.controller.routes-spec';
import MetadatasControllerTestSuite from '@app/server/controllers/metadatas/Metadatas.controller.routes-spec';
import TicketsControllerTestSuite from '@app/server/controllers/tickets/Tickets.controller.routes-spec';
import GeolocControllerTestSuite from '@app/server/controllers/geoloc/Geoloc.controller.routes-spec';

import { instance } from 'ts-mockito';

const cassandraPort = 32702;
const elasticSearchPort = 32610;

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

        const stripeMock = setupStripeMock();

        const workerFixture: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: 'STRIPE_MOCK_INSTANCE',
                    useValue: instance(stripeMock),
                },
            ],
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
    }, 60000 * (process.env.DEPLOY === 'true' ? 10 : 1));

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

    // describe('Server Controller', ServerControllerTestSuite(getCtx));
    // describe('Users Controller', UsersControllerTestSuite(getCtx));
    // describe('Authentication Controller', AuthenticationControllerTestSuite(getCtx));
    // describe('ActionSets Controller', ActionSetsControllerTestSuite(getCtx));
    // describe('Categories Controller', CategoriesControllerTestSuite(getCtx));
    // describe('Rights Controller', RightsControllerTestSuite(getCtx));
    // describe('Contracts Controller', ContractsControllerTestSuite(getCtx));
    // describe('Dates Controller', DatesControllerTestSuite(getCtx));
    // describe('Images Controller', ImagesControllerTestSuite(getCtx));
    // describe('Events Controller', EventsControllerTestSuite(getCtx));
    // describe('Txs Controller', TxsControllerTestSuite(getCtx));
    // describe('Metadatas Controller', MetadatasControllerTestSuite(getCtx));
    // describe('Checkout Controller', CheckoutControllerTestSuite(getCtx));
    // describe('Dosojin Controller', DosojinControllerTestSuite(getCtx));
    // describe('Tickets Controller', TicketsControllerTestSuite(getCtx));
    describe('Geoloc Controller', GeolocControllerTestSuite(getCtx));
});
