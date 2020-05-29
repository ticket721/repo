import { ContractsService, ContractsServiceOptions } from '@lib/common/contracts/Contracts.service';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { RocksideService } from '@lib/common/rockside/Rockside.service';
import { AuthorizationsService } from '@lib/common/authorizations/Authorizations.service';
import { T721AdminService } from '@lib/common/contracts/T721Admin.service';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@lib/common/config/Config.service';
import { FSService } from '@lib/common/fs/FS.service';
import { BytesToolService } from '@lib/common/toolbox/Bytes.tool.service';
import { T721TokenService } from '@lib/common/contracts/T721Token.service';
import { deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { Test } from '@nestjs/testing';
import { T721ControllerV0Service } from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { MetaMarketplaceV0Service } from '@lib/common/contracts/metamarketplace/MetaMarketplace.V0.service';
import { TicketforgeService } from '@lib/common/contracts/Ticketforge.service';
import path from 'path';
import { MintTokensAuthorization } from '@common/global';
import { EIP712Signature } from '@ticket721/e712/lib';
import { AuthorizationEntity } from '@lib/common/authorizations/entities/Authorization.entity';
import { NestError } from '@lib/common/utils/NestError';

describe('T721Token Service', function() {
    const context: {
        contractsServiceMock: ContractsService;
        web3ServiceMock: Web3Service;
        shutdownServiceMock: ShutdownService;
        rocksideServiceMock: RocksideService;
        authorizationsServiceMock: AuthorizationsService;
        t721AdminServiceMock: T721AdminService;
        contractsOptionsMock: ContractsServiceOptions;
        configServiceMock: ConfigService;
        fsServiceMock: FSService;
        bytesToolServiceMock: BytesToolService;
        t721tokenService: T721TokenService;
    } = {
        contractsServiceMock: null,
        web3ServiceMock: null,
        shutdownServiceMock: null,
        rocksideServiceMock: null,
        authorizationsServiceMock: null,
        t721AdminServiceMock: null,
        contractsOptionsMock: null,
        configServiceMock: null,
        fsServiceMock: null,
        bytesToolServiceMock: null,
        t721tokenService: null,
    };

    beforeEach(async function() {
        context.contractsServiceMock = mock(ContractsService);
        context.web3ServiceMock = mock(Web3Service);
        context.shutdownServiceMock = mock(ShutdownService);
        context.rocksideServiceMock = mock(RocksideService);
        context.authorizationsServiceMock = mock(AuthorizationsService);
        context.t721AdminServiceMock = mock(T721AdminService);
        context.contractsOptionsMock = {
            artifact_path: '/artifact/path',
        };
        context.configServiceMock = mock(ConfigService);
        context.fsServiceMock = mock(FSService);
        context.bytesToolServiceMock = mock(BytesToolService);

        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: ContractsService,
                    useValue: instance(context.contractsServiceMock),
                },
                {
                    provide: Web3Service,
                    useValue: instance(context.web3ServiceMock),
                },
                {
                    provide: ShutdownService,
                    useValue: instance(context.shutdownServiceMock),
                },
                {
                    provide: RocksideService,
                    useValue: instance(context.rocksideServiceMock),
                },
                {
                    provide: AuthorizationsService,
                    useValue: instance(context.authorizationsServiceMock),
                },
                {
                    provide: T721AdminService,
                    useValue: instance(context.t721AdminServiceMock),
                },
                {
                    provide: 'CONTRACTS_MODULE_OPTIONS',
                    useValue: context.contractsOptionsMock,
                },
                {
                    provide: ConfigService,
                    useValue: instance(context.configServiceMock),
                },
                {
                    provide: FSService,
                    useValue: instance(context.fsServiceMock),
                },
                {
                    provide: BytesToolService,
                    useValue: instance(context.bytesToolServiceMock),
                },
                T721TokenService,
            ],
        }).compile();

        context.t721tokenService = app.get<T721TokenService>(T721TokenService);
    });

    describe('getMinter', function() {
        it('should properly retrieve minter and sender addresses', async function() {
            const minter = '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8';
            const identity = '0x35Ba929b88E16F102990B55021f9d4a4a4710e89';

            when(
                context.fsServiceMock.readFile(
                    path.join('/artifact/path', 'minter_management', 'artifacts', 'minters.json'),
                ),
            ).thenReturn(JSON.stringify([minter]));

            when(
                context.fsServiceMock.readFile(
                    path.join('/artifact/path', 'minter_management', 'artifacts', 'identities.json'),
                ),
            ).thenReturn(JSON.stringify([identity]));

            when(context.configServiceMock.get('MINTER_INDEX')).thenReturn('0');

            const [result_minter, result_identity] = await context.t721tokenService.getMinter();

            expect(result_minter).toEqual(minter);
            expect(result_identity).toEqual(result_identity);

            verify(
                context.fsServiceMock.readFile(
                    path.join('/artifact/path', 'minter_management', 'artifacts', 'minters.json'),
                ),
            ).called();

            verify(
                context.fsServiceMock.readFile(
                    path.join('/artifact/path', 'minter_management', 'artifacts', 'identities.json'),
                ),
            ).called();

            verify(context.configServiceMock.get('MINTER_INDEX')).called();
        });

        it('should properly retrieve minter and sender addresses after initial fetch', async function() {
            const minter = '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8';
            const identity = '0x35Ba929b88E16F102990B55021f9d4a4a4710e89';

            when(
                context.fsServiceMock.readFile(
                    path.join('/artifact/path', 'minter_management', 'artifacts', 'minters.json'),
                ),
            ).thenReturn(JSON.stringify([minter]));

            when(
                context.fsServiceMock.readFile(
                    path.join('/artifact/path', 'minter_management', 'artifacts', 'identities.json'),
                ),
            ).thenReturn(JSON.stringify([identity]));

            when(context.configServiceMock.get('MINTER_INDEX')).thenReturn('0');

            await context.t721tokenService.getMinter();
            const [result_minter, result_identity] = await context.t721tokenService.getMinter();

            expect(result_minter).toEqual(minter);
            expect(result_identity).toEqual(result_identity);

            verify(
                context.fsServiceMock.readFile(
                    path.join('/artifact/path', 'minter_management', 'artifacts', 'minters.json'),
                ),
            ).once();

            verify(
                context.fsServiceMock.readFile(
                    path.join('/artifact/path', 'minter_management', 'artifacts', 'identities.json'),
                ),
            ).once();

            verify(context.configServiceMock.get('MINTER_INDEX')).once();
        });

        it('should fail on minter read action', async function() {
            const minter = '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8';

            when(
                context.fsServiceMock.readFile(
                    path.join('/artifact/path', 'minter_management', 'artifacts', 'minters.json'),
                ),
            ).thenThrow(new NestError('error while reading file'));

            when(context.configServiceMock.get('MINTER_INDEX')).thenReturn('0');

            await expect(context.t721tokenService.getMinter()).rejects.toMatchObject(
                new NestError(`Unable to resolve minter address required to create tokens: error while reading file`),
            );

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(
                        new NestError(
                            `Unable to resolve minter address required to create tokens: error while reading file`,
                        ),
                    ),
                ),
            ).called();

            verify(
                context.fsServiceMock.readFile(
                    path.join('/artifact/path', 'minter_management', 'artifacts', 'minters.json'),
                ),
            ).called();

            verify(context.configServiceMock.get('MINTER_INDEX')).called();
        });
    });

    describe('generateAuthorization', function() {
        it('should properly generate an authorization', async function() {
            // DECLARE
            const grantee = '0x35Ba929b88E16F102990B55021f9d4a4a4710e89';
            const adminAddress = '0x32Be343B94f860124dC4fEe278FDCBD38C102D88';
            const amount = '300';
            const net = 2702;
            const randomBytes = '01020304050102030405010203040501020304050102030405010203040599';
            const hexRandomBytes = `0x${randomBytes}`;
            const spiedService = spy(context.t721tokenService);
            const minter = '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8';
            const identity = '0x35Ba929b88E16F102990B55021f9d4a4a4710e89';
            const signature = '0xsignature';
            const authorizationEntity: Partial<AuthorizationEntity> = {
                granter: minter,
                grantee,
                mode: 'mintTokens',
                codes: MintTokensAuthorization.toCodesFormat(hexRandomBytes),
                selectors: MintTokensAuthorization.toSelectorFormat(grantee, amount),
                args: MintTokensAuthorization.toArgsFormat(grantee, amount, minter, hexRandomBytes),
                signature,
                readable_signature: false,
                cancelled: false,
                consumed: false,
                dispatched: false,
                user_expiration: null,
                be_expiration: null,
            };

            // MOCK
            when(context.t721AdminServiceMock.get()).thenResolve({
                _address: adminAddress,
                methods: {
                    isCodeConsumable: () => ({
                        call: () => true,
                    }),
                },
            } as any);
            when(context.bytesToolServiceMock.randomBytes(31)).thenReturn(randomBytes);
            when(context.web3ServiceMock.net()).thenResolve(net);
            when(spiedService.getMinter()).thenResolve([minter, identity]);
            when(context.rocksideServiceMock.getSigner(minter)).thenReturn(
                async (encodedPayload: string): Promise<EIP712Signature> => {
                    return {
                        hex: signature,
                        r: '0xr',
                        v: 1,
                        s: '0xs',
                    };
                },
            );
            when(context.authorizationsServiceMock.create(deepEqual(authorizationEntity))).thenResolve({
                response: authorizationEntity as AuthorizationEntity,
                error: null,
            });

            // TRIGGER
            const res = await context.t721tokenService.generateAuthorization(grantee, amount);

            // CHECK RETURNS
            expect(res.error).toEqual(null);
            expect(res.response[0]).toEqual(authorizationEntity);
            expect(res.response[1]).toEqual(hexRandomBytes);
            expect(res.response[2]).toEqual(identity);
            expect(res.response[3]).toEqual(minter);

            // CHECK CALLS
            verify(context.t721AdminServiceMock.get()).twice();
            verify(context.bytesToolServiceMock.randomBytes(31)).once();
            verify(context.web3ServiceMock.net()).once();
            verify(spiedService.getMinter()).once();
            verify(context.rocksideServiceMock.getSigner(minter)).once();
            verify(context.authorizationsServiceMock.create(deepEqual(authorizationEntity))).once();
        });

        it('should fail on code generation error', async function() {
            // DECLARE
            const grantee = '0x35Ba929b88E16F102990B55021f9d4a4a4710e89';
            const adminAddress = '0x32Be343B94f860124dC4fEe278FDCBD38C102D88';
            const amount = '300';
            const randomBytes = '01020304050102030405010203040501020304050102030405010203040599';
            const hexRandomBytes = `0x${randomBytes}`;
            const minter = '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8';
            const signature = '0xsignature';

            // MOCK
            when(context.t721AdminServiceMock.get()).thenResolve({
                _address: adminAddress,
                methods: {
                    isCodeConsumable: () => ({
                        call: () => {
                            throw new NestError(`Error occured`);
                        },
                    }),
                },
            } as any);
            when(context.bytesToolServiceMock.randomBytes(31)).thenReturn(randomBytes);

            // TRIGGER
            const res = await context.t721tokenService.generateAuthorization(grantee, amount);

            // CHECK RETURNS
            expect(res.error).toEqual('code_generation_error');
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(context.t721AdminServiceMock.get()).once();
            verify(context.bytesToolServiceMock.randomBytes(31)).once();
        });

        it('should fail on authorization creation error', async function() {
            // DECLARE
            const grantee = '0x35Ba929b88E16F102990B55021f9d4a4a4710e89';
            const adminAddress = '0x32Be343B94f860124dC4fEe278FDCBD38C102D88';
            const amount = '300';
            const net = 2702;
            const randomBytes = '01020304050102030405010203040501020304050102030405010203040599';
            const hexRandomBytes = `0x${randomBytes}`;
            const spiedService = spy(context.t721tokenService);
            const minter = '0xEA674fdDe714fd979de3EdF0F56AA9716B898ec8';
            const identity = '0x35Ba929b88E16F102990B55021f9d4a4a4710e89';
            const signature = '0xsignature';
            const authorizationEntity: Partial<AuthorizationEntity> = {
                granter: minter,
                grantee,
                mode: 'mintTokens',
                codes: MintTokensAuthorization.toCodesFormat(hexRandomBytes),
                selectors: MintTokensAuthorization.toSelectorFormat(grantee, amount),
                args: MintTokensAuthorization.toArgsFormat(grantee, amount, minter, hexRandomBytes),
                signature,
                readable_signature: false,
                cancelled: false,
                consumed: false,
                dispatched: false,
                user_expiration: null,
                be_expiration: null,
            };

            // MOCK
            when(context.t721AdminServiceMock.get()).thenResolve({
                _address: adminAddress,
                methods: {
                    isCodeConsumable: () => ({
                        call: () => true,
                    }),
                },
            } as any);
            when(context.bytesToolServiceMock.randomBytes(31)).thenReturn(randomBytes);
            when(context.web3ServiceMock.net()).thenResolve(net);
            when(spiedService.getMinter()).thenResolve([minter, identity]);
            when(context.rocksideServiceMock.getSigner(minter)).thenReturn(
                async (encodedPayload: string): Promise<EIP712Signature> => {
                    return {
                        hex: signature,
                        r: '0xr',
                        v: 1,
                        s: '0xs',
                    };
                },
            );
            when(context.authorizationsServiceMock.create(deepEqual(authorizationEntity))).thenResolve({
                response: null,
                error: 'unexpected_error',
            });

            // TRIGGER
            const res = await context.t721tokenService.generateAuthorization(grantee, amount);

            // CHECK RETURNS
            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(context.t721AdminServiceMock.get()).twice();
            verify(context.bytesToolServiceMock.randomBytes(31)).once();
            verify(context.web3ServiceMock.net()).once();
            verify(spiedService.getMinter()).once();
            verify(context.rocksideServiceMock.getSigner(minter)).once();
            verify(context.authorizationsServiceMock.create(deepEqual(authorizationEntity))).once();
        });
    });
});
