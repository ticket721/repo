import { ShutdownService }      from '@lib/common/shutdown/Shutdown.service';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { Test, TestingModule }  from '@nestjs/testing';
import { ServerService }                          from '@app/server/Server.service';
import { anything, instance, mock, verify, when } from 'ts-mockito';

const context: {
    shutdownService: ShutdownService;
    winstonLoggerServiceMock: WinstonLoggerService

} = {
    shutdownService: null,
    winstonLoggerServiceMock: null,
};

class FnClass {
    public call() {}
}

describe('Shutdown Service', function() {

    beforeEach(async function() {

        const winstonLoggerServiceMock = mock(WinstonLoggerService);

        const WinstonLoggerServiceProvider = {
            provide: WinstonLoggerService,
            useValue: instance(winstonLoggerServiceMock)
        };

        const app: TestingModule = await Test.createTestingModule({
            providers: [
                WinstonLoggerServiceProvider,
                ShutdownService
            ],
        }).compile();

        const shutdownService: ShutdownService = app.get<ShutdownService>(ShutdownService);

        context.shutdownService = shutdownService;
        context.winstonLoggerServiceMock = winstonLoggerServiceMock;

    });

    test('Simple shutdown', async function() {
        let value = 1;
        let fn = () => {
            value = 2;
        };
        const shutdownService: ShutdownService = context.shutdownService;
        const winstonLogger: WinstonLoggerService = context.winstonLoggerServiceMock;

        shutdownService.subscribeToShutdown(fn.call.bind(fn));
        shutdownService.shutdown();

        await new Promise((ok, ko) => setTimeout(ok, 1000));

        expect(value).toEqual(2);
        verify(winstonLogger.log(anything())).never();

    });

    test('Simple shutdown with message', async function() {
        let value = 1;
        let fn = () => {
            value = 2;
        };
        const shutdownService: ShutdownService = context.shutdownService;
        const winstonLogger: WinstonLoggerService = context.winstonLoggerServiceMock;

        shutdownService.subscribeToShutdown(fn.call.bind(fn));
        shutdownService.shutdownWithMessage('hi');

        await new Promise((ok, ko) => setTimeout(ok, 1000));

        expect(value).toEqual(2);
        verify(winstonLogger.log('hi')).called();

    });

    test('Error shutdown', async function() {
        let value = 1;
        let fn = () => {
            value = 2;
        };
        const shutdownService: ShutdownService = context.shutdownService;
        const winstonLogger: WinstonLoggerService = context.winstonLoggerServiceMock;
        const error = new Error('hi');

        shutdownService.subscribeToShutdown(fn.call.bind(fn));
        shutdownService.shutdownWithError(error);

        await new Promise((ok, ko) => setTimeout(ok, 1000));

        expect(value).toEqual(2);
        verify(winstonLogger.error(error.message, error.stack)).called();

    });

});
