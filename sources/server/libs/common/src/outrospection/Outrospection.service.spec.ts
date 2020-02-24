import {
    InstanceSignature,
    OutrospectionOptions,
    OutrospectionService,
} from '@lib/common/outrospection/Outrospection.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { capture, deepEqual, instance, mock, verify, when } from 'ts-mockito';

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
            when(context.configServiceMock.get('NODE_ENV')).thenReturn(
                'development',
            );

            const outrospectionService = new OutrospectionService(
                {
                    name: 'worker',
                },
                instance(context.configServiceMock),
                instance(context.shutdownServiceMock),
                () => 'worker-0',
            );

            const signature: InstanceSignature = await outrospectionService.getInstanceSignature();

            expect(signature).toEqual({
                master: true,
                name: 'worker',
                position: 1,
                signature: 'worker [1 / 1] MASTER',
                total: 1,
            });
        });

        it('should build the Outrospection Service in production mode', async function() {
            when(context.configServiceMock.get('NODE_ENV')).thenReturn(
                'production',
            );

            const outrospectionService = new OutrospectionService(
                {
                    name: 'worker',
                },
                instance(context.configServiceMock),
                instance(context.shutdownServiceMock),
                () => 'worker-0',
            );

            const signature: InstanceSignature = await outrospectionService.getInstanceSignature();

            expect(signature).toEqual({
                master: true,
                name: 'worker',
                position: 1,
                signature: 'worker [1 / 1] MASTER',
                total: 1,
            });
        });

        it('should build the Outrospection Service with instance 2', async function() {
            when(context.configServiceMock.get('NODE_ENV')).thenReturn(
                'production',
            );

            const outrospectionService = new OutrospectionService(
                {
                    name: 'worker',
                },
                instance(context.configServiceMock),
                instance(context.shutdownServiceMock),
                () => 'worker-1',
            );

            const signature: InstanceSignature = await outrospectionService.getInstanceSignature();

            expect(signature).toEqual({
                master: false,
                name: 'worker',
                position: 2,
                signature: 'worker [2 / 1]',
                total: 1,
            });
        });

        it('should fail on invalid hostname', async function() {
            when(context.configServiceMock.get('NODE_ENV')).thenReturn(
                'production',
            );

            expect((): void => {
                new OutrospectionService(
                    {
                        name: 'worker',
                    },
                    instance(context.configServiceMock),
                    instance(context.shutdownServiceMock),
                    () => 'server-0',
                );
            }).toThrow(
                new Error(
                    `Invalid instance name 'worker', cannot extract position in hostname 'server-0'`,
                ),
            );

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(
                        new Error(
                            `Invalid instance name 'worker', cannot extract position in hostname 'server-0'`,
                        ),
                    ),
                ),
            ).called();
        });

        it('should fail on regexp test fail', async function() {
            when(context.configServiceMock.get('NODE_ENV')).thenReturn(
                'production',
            );

            expect((): void => {
                new OutrospectionService(
                    {
                        name: 'worker',
                    },
                    instance(context.configServiceMock),
                    instance(context.shutdownServiceMock),
                    () => 'server--0',
                );
            }).toThrow(
                new Error(
                    `Invalid instance name 'worker', cannot extract position in hostname 'server--0'`,
                ),
            );

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(
                        new Error(
                            `Invalid instance name 'worker', cannot extract position in hostname 'server--0'`,
                        ),
                    ),
                ),
            ).called();
        });
    });
});
