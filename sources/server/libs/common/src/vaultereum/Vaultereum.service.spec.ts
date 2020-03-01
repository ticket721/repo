import { VaultClient, VaultereumService } from '@lib/common/vaultereum/Vaultereum.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';

const context: {
    vaultereumService: VaultereumService;
    shutdownServiceMock: ShutdownService;
} = {
    vaultereumService: null,
    shutdownServiceMock: null,
};

class VaultClientMock implements VaultClient {
    read(path: string, args?: any): Promise<any> {
        return null;
    }

    write(path: string, args?: any): Promise<any> {
        return null;
    }
}

const config = {
    VAULT_HOST: 'localhost',
    VAULT_PORT: 8200,
    VAULT_PROTOCOL: 'http',
    VAULT_ETHEREUM_NODE_HOST: 'localhost',
    VAULT_ETHEREUM_NODE_PORT: 8545,
    VAULT_ETHEREUM_NODE_PROTOCOL: 'http',
    VAULT_ETHEREUM_NODE_NETWORK_ID: 2702,
    VAULT_TOKEN: 'dev_root_token',
};

describe('Vaultereum Service', function() {
    beforeEach(async function() {
        context.shutdownServiceMock = mock(ShutdownService);

        const VaultereumOptionsProvider = {
            provide: 'VAULTEREUM_MODULE_OPTIONS',
            useValue: config,
        };

        const ShutdownServiceProvider = {
            provide: ShutdownService,
            useValue: instance(context.shutdownServiceMock),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [VaultereumOptionsProvider, ShutdownServiceProvider, VaultereumService],
        }).compile();

        context.vaultereumService = module.get<VaultereumService>(VaultereumService);
    });

    describe('read', function() {
        it('calls read on vault client', async function() {
            const configureSpy = spy(context.vaultereumService);
            const clientMock = mock(VaultClientMock);

            const readResult = {
                response: 'value',
                other_field: 'other_value',
            };

            const readPath = 'ethereum/something';

            when(configureSpy.configure()).thenResolve(instance(clientMock));
            when(clientMock.read(readPath, undefined)).thenResolve(readResult);

            await context.vaultereumService.onModuleInit();
            const res = await context.vaultereumService.read(readPath, undefined);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(readResult);

            verify(configureSpy.configure()).called();
            verify(clientMock.read(readPath, undefined)).called();
        });

        it('read client error', async function() {
            const configureSpy = spy(context.vaultereumService);
            const clientMock = mock(VaultClientMock);

            const readPath = 'ethereum/something';

            when(configureSpy.configure()).thenResolve(instance(clientMock));
            when(clientMock.read(readPath, undefined)).thenThrow(new Error('an error occured'));

            await context.vaultereumService.onModuleInit();
            const res = await context.vaultereumService.read(readPath, undefined);

            expect(res.error).toEqual('an error occured');
            expect(res.response).toEqual(null);

            verify(configureSpy.configure()).called();
            verify(clientMock.read(readPath, undefined)).called();
        });
    });

    describe('write', function() {
        it('calls write on vault client', async function() {
            const configureSpy = spy(context.vaultereumService);
            const clientMock = mock(VaultClientMock);

            const writeResult = {
                response: 'value',
                other_field: 'other_value',
            };

            const writePath = 'ethereum/something';

            when(configureSpy.configure()).thenResolve(instance(clientMock));
            when(clientMock.write(writePath, undefined)).thenResolve(writeResult);

            await context.vaultereumService.onModuleInit();
            const res = await context.vaultereumService.write(writePath, undefined);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(writeResult);

            verify(configureSpy.configure()).called();
            verify(clientMock.write(writePath, undefined)).called();
        });

        it('write client error', async function() {
            const configureSpy = spy(context.vaultereumService);
            const clientMock = mock(VaultClientMock);

            const writePath = 'ethereum/something';

            when(configureSpy.configure()).thenResolve(instance(clientMock));
            when(clientMock.write(writePath, undefined)).thenThrow(new Error('an error occured'));

            await context.vaultereumService.onModuleInit();
            const res = await context.vaultereumService.write(writePath, undefined);

            expect(res.error).toEqual('an error occured');
            expect(res.response).toEqual(null);

            verify(configureSpy.configure()).called();
            verify(clientMock.write(writePath, undefined)).called();
        });
    });

    describe('configure', function() {
        it('properly reads ethereum/config', async function() {
            const configureSpy = spy(context.vaultereumService);
            const clientMock = mock(VaultClientMock);

            when(
                configureSpy.build(
                    deepEqual({
                        apiVersion: 'v1',
                        endpoint: `${config.VAULT_PROTOCOL}://${config.VAULT_HOST}:${config.VAULT_PORT}`,
                        token: config.VAULT_TOKEN,
                    }),
                ),
            ).thenReturn(instance(clientMock));

            when(clientMock.read('ethereum/config')).thenResolve({
                data: 'value',
            });

            await context.vaultereumService.configure();

            verify(
                configureSpy.build(
                    deepEqual({
                        apiVersion: 'v1',
                        endpoint: `${config.VAULT_PROTOCOL}://${config.VAULT_HOST}:${config.VAULT_PORT}`,
                        token: config.VAULT_TOKEN,
                    }),
                ),
            ).called();

            verify(clientMock.read('ethereum/config')).called();
        });

        it('throws on read for unexpected reasons', async function() {
            const configureSpy = spy(context.vaultereumService);
            const clientMock = mock(VaultClientMock);

            when(
                configureSpy.build(
                    deepEqual({
                        apiVersion: 'v1',
                        endpoint: `${config.VAULT_PROTOCOL}://${config.VAULT_HOST}:${config.VAULT_PORT}`,
                        token: config.VAULT_TOKEN,
                    }),
                ),
            ).thenReturn(instance(clientMock));

            when(clientMock.read('ethereum/config')).thenReject(new Error('unexpected reasons'));

            await expect(context.vaultereumService.configure()).rejects.toMatchObject(new Error('unexpected reasons'));

            verify(
                configureSpy.build(
                    deepEqual({
                        apiVersion: 'v1',
                        endpoint: `${config.VAULT_PROTOCOL}://${config.VAULT_HOST}:${config.VAULT_PORT}`,
                        token: config.VAULT_TOKEN,
                    }),
                ),
            ).called();

            verify(clientMock.read('ethereum/config')).called();
            verify(
                clientMock.write(
                    'ethereum/config',
                    deepEqual({
                        rpc_url: `${config.VAULT_ETHEREUM_NODE_PROTOCOL}://${config.VAULT_ETHEREUM_NODE_HOST}:${config.VAULT_ETHEREUM_NODE_PORT}`,
                        chain_id: config.VAULT_ETHEREUM_NODE_NETWORK_ID,
                    }),
                ),
            ).never();
            verify(context.shutdownServiceMock.shutdownWithError(deepEqual(new Error('unexpected reasons')))).called();
        });
    });
});
