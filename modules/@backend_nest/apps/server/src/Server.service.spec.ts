import { mock, when, instance, verify } from 'ts-mockito';
import * as pack from '../../../package.json';
import { Test, TestingModule } from '@nestjs/testing';
import { ServerService } from './Server.service';
import { APIInfos } from './Server.types';
import { ConfigService } from '@lib/common/config/Config.service';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { keccak256FromBuffer } from '@common/global';

const context: {
    serverService: ServerService;
    configServiceMock: ConfigService;
    outrospectionServiceMock: OutrospectionService;
} = {
    serverService: null,
    configServiceMock: null,
    outrospectionServiceMock: null,
};

describe('Server Service', () => {
    beforeEach(async function() {
        context.configServiceMock = mock(ConfigService);
        context.outrospectionServiceMock = mock(OutrospectionService);

        const app: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ConfigService,
                    useValue: instance(context.configServiceMock),
                },

                {
                    provide: WinstonLoggerService,
                    useValue: new WinstonLoggerService('server'),
                },

                {
                    provide: OutrospectionService,
                    useValue: instance(context.outrospectionServiceMock),
                },
                ServerService,
            ],
        }).compile();

        context.serverService = app.get<ServerService>(ServerService);
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
            outrospectionServiceMock,
        }: {
            serverService: ServerService;
            configServiceMock: ConfigService;
            outrospectionServiceMock: OutrospectionService;
        } = context;

        when(configServiceMock.get('NODE_ENV')).thenReturn('development');
        when(outrospectionServiceMock.getInstanceSignature()).thenResolve({
            signature: 'signature',
            master: true,
            name: 'name',
            instanceName: 'name-0',
        });

        process.env.TAG = 'test';

        const res: APIInfos = await serverService.getAPIInfos();
        expect(res.name).toEqual('t721api');
        expect(res.instanceHash).toEqual(keccak256FromBuffer(Buffer.from('name-0')));
        expect(res.version).toEqual(pack.version);
        expect(res.env).toEqual(`development@test`);

        verify(configServiceMock.get('NODE_ENV')).called();
        verify(outrospectionServiceMock.getInstanceSignature()).called();
    });
});
