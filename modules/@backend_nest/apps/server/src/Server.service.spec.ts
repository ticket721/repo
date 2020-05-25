import { mock, when, instance, verify } from 'ts-mockito';
import * as pack from '../../../package.json';
import { Test, TestingModule } from '@nestjs/testing';
import { ServerService } from './Server.service';
import { APIInfos } from './Server.types';
import { ConfigService } from '@lib/common/config/Config.service';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';

const context: {
    serverService: ServerService;
    configServiceMock: ConfigService;
} = {
    serverService: null,
    configServiceMock: null,
};

describe('Server Service', () => {
    beforeEach(async function() {
        const configServiceMock: ConfigService = mock(ConfigService);

        const ConfigServiceProvider = {
            provide: ConfigService,
            useValue: instance(configServiceMock),
        };

        const WinstonLoggerServiceProvider = {
            provide: WinstonLoggerService,
            useValue: new WinstonLoggerService('server'),
        };

        const app: TestingModule = await Test.createTestingModule({
            providers: [ConfigServiceProvider, ServerService, WinstonLoggerServiceProvider],
        }).compile();

        const serverService: ServerService = app.get<ServerService>(ServerService);

        context.configServiceMock = configServiceMock;
        context.serverService = serverService;
    });

    afterEach(async function() {

        if (process.env.TAG) {
            delete process.env.TAG;
        }

    });

    it('build and get info with NODE_ENV=development', async function() {
        const {
            serverService,
            configServiceMock,
        }: {
            serverService: ServerService;
            configServiceMock: ConfigService;
        } = context;

        when(configServiceMock.get('NODE_ENV')).thenReturn('development');

        process.env.TAG = 'test';

        const res: APIInfos = serverService.getAPIInfos();
        expect(res.name).toEqual('t721api');
        expect(res.version).toEqual(pack.version);
        expect(res.env).toEqual(`development@test`);

        verify(configServiceMock.get('NODE_ENV')).called();
    });

    it('build and get info with NODE_ENV=production', async function() {
        const {
            serverService,
            configServiceMock,
        }: {
            serverService: ServerService;
            configServiceMock: ConfigService;
        } = context;

        when(configServiceMock.get('NODE_ENV')).thenReturn('production');

        const res: APIInfos = serverService.getAPIInfos();
        expect(res.name).toEqual('t721api');
        expect(res.version).toEqual(pack.version);
        expect(res.env).toEqual(`production@bare`);

        verify(configServiceMock.get('NODE_ENV')).called();
    });
});
