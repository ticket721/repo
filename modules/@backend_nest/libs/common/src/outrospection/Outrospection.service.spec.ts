import { InstanceSignature, OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { capture, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { NestError } from '@lib/common/utils/NestError';

describe('Outrospection Service', function() {
    const context: {
        configServiceMock: ConfigService;
        shutdownServiceMock: ShutdownService;
    } = {
        configServiceMock: null,
        shutdownServiceMock: null,
    };

    beforeAll(async function() {
        context.configServiceMock = mock(ConfigService);
        context.shutdownServiceMock = mock(ShutdownService);
    });

    describe('constructor', function() {
        it('should build the Outrospection Service in dev mode', async function() {
            when(context.configServiceMock.get('NODE_ENV')).thenReturn('development');
            when(context.configServiceMock.get('MASTER')).thenReturn('true');

            const outrospectionService = new OutrospectionService(
                'worker',
                instance(context.configServiceMock),
                instance(context.shutdownServiceMock),
                () => 'worker-0',
            );

            const signature: InstanceSignature = await outrospectionService.getInstanceSignature();

            expect(signature).toEqual({
                master: true,
                name: 'worker',
                signature: 'worker MASTER',
                instanceName: 'worker-0',
            });
        });

        it('should build the Outrospection Service with instance 2', async function() {
            when(context.configServiceMock.get('NODE_ENV')).thenReturn('production');
            when(context.configServiceMock.get('MASTER')).thenReturn('false');

            const outrospectionService = new OutrospectionService(
                'worker',
                instance(context.configServiceMock),
                instance(context.shutdownServiceMock),
                () => 'worker-1',
            );

            const signature: InstanceSignature = await outrospectionService.getInstanceSignature();

            expect(signature).toEqual({
                master: false,
                name: 'worker',
                signature: 'worker',
                instanceName: 'worker-1',
            });
        });
    });
});
