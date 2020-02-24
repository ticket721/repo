import { TxsService, TxsServiceOptions } from '@lib/common/txs/Txs.service';
import { TxsRepository } from '@lib/common/txs/Txs.repository';
import { BaseModel } from '@iaminfinity/express-cassandra';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { VaultereumService } from '@lib/common/vaultereum/Vaultereum.service';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { RefractFactoryV0Service } from '@lib/common/contracts/refract/RefractFactory.V0.service';
import { T721AdminService } from '@lib/common/contracts/T721Admin.service';
import {
    anything,
    capture,
    deepEqual,
    instance,
    mock,
    spy,
    verify,
    when,
} from 'ts-mockito';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';
import { TxEntity } from '@lib/common/txs/entities/Tx.entity';
import { GlobalEntity } from '@lib/common/globalconfig/entities/Global.entity';
import { UserDto } from '@lib/common/users/dto/User.dto';

class TxEntityMock {
    public _properties = null;

    search(
        options: EsSearchOptionsStatic,
        callback?: (err: any, ret: any) => void,
    ): void {
        return;
    }
}

describe('Txs Service', function() {
    const context: {
        txsService: TxsService;
        txsRepositoryMock: TxsRepository;
        txsEntityMock: TxEntityMock;
        txsOptionsMock: TxsServiceOptions;
        globalConfigServiceMock: GlobalConfigService;
        vaultereumServiceMock: VaultereumService;
        web3ServiceMock: Web3Service;
        refractFactoryServiceMock: RefractFactoryV0Service;
        t721AdminService: T721AdminService;
    } = {
        txsService: null,
        txsRepositoryMock: null,
        txsEntityMock: null,
        txsOptionsMock: null,
        globalConfigServiceMock: null,
        vaultereumServiceMock: null,
        web3ServiceMock: null,
        refractFactoryServiceMock: null,
        t721AdminService: null,
    };

    beforeEach(async function() {
        context.txsRepositoryMock = mock(TxsRepository);
        context.txsEntityMock = mock(TxEntityMock);
        when(context.txsEntityMock._properties).thenReturn({
            schema: {
                fields: {},
            },
        });
        context.txsOptionsMock = {
            blockThreshold: 2,
            blockPollingRefreshRate: 1000,
            ethereumNetworkId: 2702,
            ethereumMtxDomainName: 'Refract Wallet',
            ethereumMtxVersion: '0',
            ethereumMtxRelayAdmin: 'admin_0',
            targetGasPrice: 150,
        };
        context.globalConfigServiceMock = mock(GlobalConfigService);
        context.vaultereumServiceMock = mock(VaultereumService);
        context.web3ServiceMock = mock(Web3Service);
        context.refractFactoryServiceMock = mock(RefractFactoryV0Service);
        context.t721AdminService = mock(T721AdminService);

        const app: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: TxsRepository,
                    useValue: instance(context.txsRepositoryMock),
                },
                {
                    provide: getModelToken(TxEntity),
                    useValue: instance(context.txsEntityMock),
                },
                {
                    provide: 'TXS_MODULE_OPTIONS',
                    useValue: context.txsOptionsMock,
                },
                {
                    provide: GlobalConfigService,
                    useValue: instance(context.globalConfigServiceMock),
                },
                {
                    provide: VaultereumService,
                    useValue: instance(context.vaultereumServiceMock),
                },
                {
                    provide: Web3Service,
                    useValue: instance(context.web3ServiceMock),
                },
                {
                    provide: RefractFactoryV0Service,
                    useValue: instance(context.refractFactoryServiceMock),
                },
                {
                    provide: T721AdminService,
                    useValue: instance(context.t721AdminService),
                },
                TxsService,
            ],
        }).compile();

        context.txsService = app.get<TxsService>(TxsService);
    });

    describe('subscribe', function() {
        it('should subscribe to a transaction', async function() {
            const transactionHash =
                '0x642d048892f14c556d16dcbbdc5567bafee2d9bae40226d13807e72e097d59b8';
            const spied = spy(context.txsService);
            const txentiy = {
                transaction_hash:
                    '0x93e56b205c2ca911b754536d2474a75b9823e0b3d2b3537d08457ebd5f8f8cce',
                confirmed: false,
                block_number: 0,
            };

            when(
                spied.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            when(
                spied.create(
                    deepEqual({
                        transaction_hash: transactionHash,
                        block_number: 0,
                        confirmed: false,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: (txentiy as any) as TxEntity,
            });

            const res = await context.txsService.subscribe(transactionHash);

            expect(res).toEqual({
                error: null,
                response: txentiy,
            });

            verify(
                spied.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).called();

            verify(
                spied.create(
                    deepEqual({
                        transaction_hash: transactionHash,
                        block_number: 0,
                        confirmed: false,
                    }),
                ),
            ).called();
        });

        it('should return existing transaction', async function() {
            const transactionHash =
                '0x642d048892f14c556d16dcbbdc5567bafee2d9bae40226d13807e72e097d59b8';
            const spied = spy(context.txsService);
            const txentiy = {
                transaction_hash:
                    '0x93e56b205c2ca911b754536d2474a75b9823e0b3d2b3537d08457ebd5f8f8cce',
                confirmed: false,
                block_number: 0,
            };

            when(
                spied.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [(txentiy as any) as TxEntity],
            });

            when(
                spied.create(
                    deepEqual({
                        transaction_hash: transactionHash,
                        block_number: 0,
                        confirmed: false,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: (txentiy as any) as TxEntity,
            });

            const res = await context.txsService.subscribe(transactionHash);

            expect(res).toEqual({
                error: null,
                response: txentiy,
            });

            verify(
                spied.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).called();

            verify(
                spied.create(
                    deepEqual({
                        transaction_hash: transactionHash,
                        block_number: 0,
                        confirmed: false,
                    }),
                ),
            ).never();
        });

        it('should fail on invalid txhash', async function() {
            const transactionHash =
                '0x642d048892f14c556d16dcbbdc5567bafee2d9bae40226d13807e72e097d59';
            const spied = spy(context.txsService);
            const txentiy = {
                transaction_hash:
                    '0x93e56b205c2ca911b754536d2474a75b9823e0b3d2b3537d08457ebd5f8f8cce',
                confirmed: false,
                block_number: 0,
            };

            const res = await context.txsService.subscribe(transactionHash);

            expect(res).toEqual({
                error: 'invalid_tx_hash_format',
                response: null,
            });
        });

        it('should fail on duplicate check error', async function() {
            const transactionHash =
                '0x642d048892f14c556d16dcbbdc5567bafee2d9bae40226d13807e72e097d59b8';
            const spied = spy(context.txsService);
            const txentiy = {
                transaction_hash:
                    '0x93e56b205c2ca911b754536d2474a75b9823e0b3d2b3537d08457ebd5f8f8cce',
                confirmed: false,
                block_number: 0,
            };

            when(
                spied.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.txsService.subscribe(transactionHash);

            expect(res).toEqual({
                error: 'unexpected_error',
                response: null,
            });

            verify(
                spied.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).called();
        });

        it('should fail on creation error', async function() {
            const transactionHash =
                '0x642d048892f14c556d16dcbbdc5567bafee2d9bae40226d13807e72e097d59b8';
            const spied = spy(context.txsService);
            const txentiy = {
                transaction_hash:
                    '0x93e56b205c2ca911b754536d2474a75b9823e0b3d2b3537d08457ebd5f8f8cce',
                confirmed: false,
                block_number: 0,
            };

            when(
                spied.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            when(
                spied.create(
                    deepEqual({
                        transaction_hash: transactionHash,
                        block_number: 0,
                        confirmed: false,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.txsService.subscribe(transactionHash);

            expect(res).toEqual({
                error: 'unexpected_error',
                response: null,
            });

            verify(
                spied.search(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                ),
            ).called();

            verify(
                spied.create(
                    deepEqual({
                        transaction_hash: transactionHash,
                        block_number: 0,
                        confirmed: false,
                    }),
                ),
            ).called();
        });
    });

    describe('estimateGasPrice', function() {
        it('should estimate gas price and provide optimized solution', async function() {
            const globalConfig: Partial<GlobalEntity> = {
                eth_eur_price: 10000,
                block_number: 1000,
                id: 'global',
            };

            const web3 = {
                eth: {
                    getGasPrice: async () => 25000000000,
                },
            };

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [(globalConfig as any) as GlobalEntity],
            });

            when(context.web3ServiceMock.get()).thenResolve(web3);

            const res = await context.txsService.estimateGasPrice('10000000');

            expect(res).toEqual({
                error: null,
                response: '15000000000',
            });

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(context.web3ServiceMock.get()).called();
        });

        it('should estimate gas price and provide default gas price', async function() {
            const globalConfig: Partial<GlobalEntity> = {
                eth_eur_price: 10000,
                block_number: 1000,
                id: 'global',
            };

            const web3 = {
                eth: {
                    getGasPrice: async () => 2500000000,
                },
            };

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [(globalConfig as any) as GlobalEntity],
            });

            when(context.web3ServiceMock.get()).thenResolve(web3);

            const res = await context.txsService.estimateGasPrice('10000000');

            expect(res).toEqual({
                error: null,
                response: '2500000000',
            });

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(context.web3ServiceMock.get()).called();
        });

        it('should fail on global config fetch error', async function() {
            const globalConfig: Partial<GlobalEntity> = {
                eth_eur_price: 10000,
                block_number: 1000,
                id: 'global',
            };

            const web3 = {
                eth: {
                    getGasPrice: async () => 25000000000,
                },
            };

            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.txsService.estimateGasPrice('10000000');

            expect(res).toEqual({
                error: 'unexpected_error',
                response: null,
            });

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();
        });
    });

    describe('estimateGasLimit', function() {
        it('should estimate gas limit with admin_0', async function() {
            const from = 'admin_0';
            const real_from = '0xb722ef11057ef599fb3b34adfee74ee2df6c9f70';
            const to = '0xb722ef11057ef599fb3b34adfee74ee2df6c9f60';

            const web3 = {
                eth: {
                    getTransactionCount: async () => 10,
                    estimateGas: async () => 1000000,
                },
            };

            when(
                context.vaultereumServiceMock.read(`ethereum/accounts/${from}`),
            ).thenResolve({
                error: null,
                response: {
                    data: {
                        address: real_from,
                    },
                },
            });

            when(context.web3ServiceMock.get()).thenResolve(web3);

            const res = await context.txsService.estimateGasLimit(
                from,
                to,
                '0xabcd',
            );

            expect(res).toEqual({
                error: null,
                response: '1000000',
            });

            verify(
                context.vaultereumServiceMock.read(`ethereum/accounts/${from}`),
            ).called();

            verify(context.web3ServiceMock.get()).called();
        });

        it('should estimate gas limit with admin_0 and no result conversion', async function() {
            const from = 'admin_0';
            const real_from = '0xb722ef11057ef599fb3b34adfee74ee2df6c9f70';
            const to = '0xb722ef11057ef599fb3b34adfee74ee2df6c9f60';

            const web3 = {
                eth: {
                    getTransactionCount: async () => 10,
                    estimateGas: async () => '1000000',
                },
            };

            when(
                context.vaultereumServiceMock.read(`ethereum/accounts/${from}`),
            ).thenResolve({
                error: null,
                response: {
                    data: {
                        address: real_from,
                    },
                },
            });

            when(context.web3ServiceMock.get()).thenResolve(web3);

            const res = await context.txsService.estimateGasLimit(
                from,
                to,
                '0xabcd',
            );

            expect(res).toEqual({
                error: null,
                response: '1000000',
            });

            verify(
                context.vaultereumServiceMock.read(`ethereum/accounts/${from}`),
            ).called();

            verify(context.web3ServiceMock.get()).called();
        });

        it('should estimate gas limit with real account', async function() {
            const from = '0xb722ef11057ef599fb3b34adfee74ee2df6c9f70';
            const to = '0xb722ef11057ef599fb3b34adfee74ee2df6c9f60';

            const web3 = {
                eth: {
                    getTransactionCount: async () => 10,
                    estimateGas: async () => 1000000,
                },
            };

            when(context.web3ServiceMock.get()).thenResolve(web3);

            const res = await context.txsService.estimateGasLimit(
                from,
                to,
                '0xabcd',
            );

            expect(res).toEqual({
                error: null,
                response: '1000000',
            });

            verify(context.web3ServiceMock.get()).called();
        });

        it('should fail while resolving admin name', async function() {
            const from = 'admin_0';
            const real_from = '0xb722ef11057ef599fb3b34adfee74ee2df6c9f70';
            const to = '0xb722ef11057ef599fb3b34adfee74ee2df6c9f60';

            const web3 = {
                eth: {
                    getTransactionCount: async () => 10,
                    estimateGas: async () => 1000000,
                },
            };

            when(
                context.vaultereumServiceMock.read(`ethereum/accounts/${from}`),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.txsService.estimateGasLimit(
                from,
                to,
                '0xabcd',
            );

            expect(res).toEqual({
                error: 'unexpected_error',
                response: null,
            });

            verify(
                context.vaultereumServiceMock.read(`ethereum/accounts/${from}`),
            ).called();
        });
    });

    describe('mtx', function() {
        it('should broadcast mtx', async function() {
            const payload = {
                domain: {
                    name: 'Refract Wallet',
                    version: '0',
                    chainId: 2702,
                    verifyingContract:
                        '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                },
                primaryType: 'MetaTransaction',
                types: {
                    MetaTransaction: [
                        {
                            name: 'parameters',
                            type: 'TransactionParameters[]',
                        },
                        {
                            name: 'nonce',
                            type: 'uint256',
                        },
                    ],
                    TransactionParameters: [
                        {
                            type: 'address',
                            name: 'from',
                        },
                        {
                            type: 'address',
                            name: 'to',
                        },
                        {
                            type: 'address',
                            name: 'relayer',
                        },
                        {
                            type: 'uint256',
                            name: 'value',
                        },
                        {
                            type: 'bytes',
                            name: 'data',
                        },
                    ],
                    EIP712Domain: [
                        {
                            name: 'name',
                            type: 'string',
                        },
                        {
                            name: 'version',
                            type: 'string',
                        },
                        {
                            name: 'chainId',
                            type: 'uint256',
                        },
                        {
                            name: 'verifyingContract',
                            type: 'address',
                        },
                    ],
                },
                message: {
                    nonce: 3,
                    parameters: [
                        {
                            from: '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                            to: '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                            relayer:
                                '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                            data:
                                '0xdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                            value: '0',
                        },
                        {
                            from: '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                            to: '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                            relayer:
                                '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                            data:
                                '0xa032c39b8464cd7af6e74a68c015a423ee17228b225ab09f69ff6d95d17ed3e55414e7b500000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000090000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a0600000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                            value: '0',
                        },
                    ],
                },
            };
            const signature =
                '0x4433e0ca220c31ba2d1d020b6c4066a63a6dd61342503c6438317af6b8ac1ebf3110eaad36943c5ce9ac58d3f23b6a927cd0c2aebab474c9563bd7704a66ceb71b';
            const user = {
                id: 'd5a13807-489c-4312-a9e2-58e024ea01e0',
                address: '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                email: 'tester@test.com',
                locale: 'en',
                role: 'authenticated',
                type: 't721',
                username: 'tester',
                valid: true,
            };
            const signer = '0x9E43ABA62c0b3590e0fC2deF13ba922Ec35283d9';
            const args: [number, string[], string[], string] = [
                3,
                [
                    '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                    '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                    '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                    '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                ],
                ['0', '100', '0', '1380'],
                '0x4433e0ca220c31ba2d1d020b6c4066a63a6dd61342503c6438317af6b8ac1ebf3110eaad36943c5ce9ac58d3f23b6a927cd0c2aebab474c9563bd7704a66ceb71bdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000a032c39b8464cd7af6e74a68c015a423ee17228b225ab09f69ff6d95d17ed3e55414e7b500000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000090000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a0600000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            ];
            const target = '0x1d276ee950745444BE5A22A94dC41845CCD21795';
            const t721adminContract = {
                _address: target,
                methods: {
                    refundedExecute: () => ({
                        encodeABI: () => '0x1234',
                    }),
                },
            };
            const spied = spy(context.txsService);

            when(
                context.refractFactoryServiceMock.isController(
                    user.address,
                    signer,
                    anything(),
                ),
            ).thenResolve(true);

            when(
                context.refractFactoryServiceMock.encodeCall(
                    user.address,
                    signer,
                    anything(),
                    anything(),
                    anything(),
                    anything(),
                    anything(),
                ),
            ).thenResolve([target, '0xabcd']);

            when(context.t721AdminService.get()).thenResolve(t721adminContract);

            when(
                spied.estimateGasLimit('admin_0', target, '0x1234'),
            ).thenResolve({
                error: null,
                response: '1000000',
            });

            when(spied.estimateGasPrice('1000000')).thenResolve({
                error: null,
                response: '150000000',
            });

            when(
                spied.sendRawTransaction(
                    'admin_0',
                    target,
                    '0',
                    '0x1234',
                    '150000000',
                    '1000000',
                ),
            ).thenResolve({
                error: null,
                response: ({
                    transaction_hash:
                        '0x93e56b205c2ca911b754536d2474a75b9823e0b3d2b3537d08457ebd5f8f8cce',
                    confirmed: false,
                    block_number: 0,
                } as any) as TxEntity,
            });

            const res = await context.txsService.mtx(
                payload,
                signature,
                user as UserDto,
            );

            expect(res).toEqual({
                error: null,
                response: {
                    transaction_hash:
                        '0x93e56b205c2ca911b754536d2474a75b9823e0b3d2b3537d08457ebd5f8f8cce',
                    confirmed: false,
                    block_number: 0,
                },
            });

            verify(
                context.refractFactoryServiceMock.isController(
                    user.address,
                    signer,
                    anything(),
                ),
            ).called();
            verify(
                context.refractFactoryServiceMock.encodeCall(
                    user.address,
                    signer,
                    anything(),
                    anything(),
                    anything(),
                    anything(),
                    anything(),
                ),
            ).called();
            verify(context.t721AdminService.get()).called();
            verify(
                spied.estimateGasLimit('admin_0', target, '0x1234'),
            ).called();
            verify(spied.estimateGasPrice('1000000')).called();
            verify(
                spied.sendRawTransaction(
                    'admin_0',
                    target,
                    '0',
                    '0x1234',
                    '150000000',
                    '1000000',
                ),
            ).called();
        });

        it('should fail on invalid controller', async function() {
            const payload = {
                domain: {
                    name: 'Refract Wallet',
                    version: '0',
                    chainId: 2702,
                    verifyingContract:
                        '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                },
                primaryType: 'MetaTransaction',
                types: {
                    MetaTransaction: [
                        {
                            name: 'parameters',
                            type: 'TransactionParameters[]',
                        },
                        {
                            name: 'nonce',
                            type: 'uint256',
                        },
                    ],
                    TransactionParameters: [
                        {
                            type: 'address',
                            name: 'from',
                        },
                        {
                            type: 'address',
                            name: 'to',
                        },
                        {
                            type: 'address',
                            name: 'relayer',
                        },
                        {
                            type: 'uint256',
                            name: 'value',
                        },
                        {
                            type: 'bytes',
                            name: 'data',
                        },
                    ],
                    EIP712Domain: [
                        {
                            name: 'name',
                            type: 'string',
                        },
                        {
                            name: 'version',
                            type: 'string',
                        },
                        {
                            name: 'chainId',
                            type: 'uint256',
                        },
                        {
                            name: 'verifyingContract',
                            type: 'address',
                        },
                    ],
                },
                message: {
                    nonce: 3,
                    parameters: [
                        {
                            from: '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                            to: '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                            relayer:
                                '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                            data:
                                '0xdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                            value: '0',
                        },
                        {
                            from: '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                            to: '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                            relayer:
                                '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                            data:
                                '0xa032c39b8464cd7af6e74a68c015a423ee17228b225ab09f69ff6d95d17ed3e55414e7b500000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000090000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a0600000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                            value: '0',
                        },
                    ],
                },
            };
            const signature =
                '0x4433e0ca220c31ba2d1d020b6c4066a63a6dd61342503c6438317af6b8ac1ebf3110eaad36943c5ce9ac58d3f23b6a927cd0c2aebab474c9563bd7704a66ceb71b';
            const user = {
                id: 'd5a13807-489c-4312-a9e2-58e024ea01e0',
                address: '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                email: 'tester@test.com',
                locale: 'en',
                role: 'authenticated',
                type: 't721',
                username: 'tester',
                valid: true,
            };
            const signer = '0x9E43ABA62c0b3590e0fC2deF13ba922Ec35283d9';
            const args: [number, string[], string[], string] = [
                3,
                [
                    '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                    '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                    '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                    '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                ],
                ['0', '100', '0', '1380'],
                '0x4433e0ca220c31ba2d1d020b6c4066a63a6dd61342503c6438317af6b8ac1ebf3110eaad36943c5ce9ac58d3f23b6a927cd0c2aebab474c9563bd7704a66ceb71bdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000a032c39b8464cd7af6e74a68c015a423ee17228b225ab09f69ff6d95d17ed3e55414e7b500000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000090000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a0600000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            ];
            const target = '0x1d276ee950745444BE5A22A94dC41845CCD21795';
            const t721adminContract = {
                _address: target,
                methods: {
                    refundedExecute: () => ({
                        encodeABI: () => '0x1234',
                    }),
                },
            };
            const spied = spy(context.txsService);

            when(
                context.refractFactoryServiceMock.isController(
                    user.address,
                    signer,
                    anything(),
                ),
            ).thenResolve(false);

            const res = await context.txsService.mtx(
                payload,
                signature,
                user as UserDto,
            );

            expect(res).toEqual({
                error: 'payload_not_signed_by_controller',
                response: null,
            });

            verify(
                context.refractFactoryServiceMock.isController(
                    user.address,
                    signer,
                    anything(),
                ),
            ).called();
        });

        it('should fail on gas limit estimation error', async function() {
            const payload = {
                domain: {
                    name: 'Refract Wallet',
                    version: '0',
                    chainId: 2702,
                    verifyingContract:
                        '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                },
                primaryType: 'MetaTransaction',
                types: {
                    MetaTransaction: [
                        {
                            name: 'parameters',
                            type: 'TransactionParameters[]',
                        },
                        {
                            name: 'nonce',
                            type: 'uint256',
                        },
                    ],
                    TransactionParameters: [
                        {
                            type: 'address',
                            name: 'from',
                        },
                        {
                            type: 'address',
                            name: 'to',
                        },
                        {
                            type: 'address',
                            name: 'relayer',
                        },
                        {
                            type: 'uint256',
                            name: 'value',
                        },
                        {
                            type: 'bytes',
                            name: 'data',
                        },
                    ],
                    EIP712Domain: [
                        {
                            name: 'name',
                            type: 'string',
                        },
                        {
                            name: 'version',
                            type: 'string',
                        },
                        {
                            name: 'chainId',
                            type: 'uint256',
                        },
                        {
                            name: 'verifyingContract',
                            type: 'address',
                        },
                    ],
                },
                message: {
                    nonce: 3,
                    parameters: [
                        {
                            from: '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                            to: '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                            relayer:
                                '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                            data:
                                '0xdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                            value: '0',
                        },
                        {
                            from: '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                            to: '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                            relayer:
                                '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                            data:
                                '0xa032c39b8464cd7af6e74a68c015a423ee17228b225ab09f69ff6d95d17ed3e55414e7b500000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000090000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a0600000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                            value: '0',
                        },
                    ],
                },
            };
            const signature =
                '0x4433e0ca220c31ba2d1d020b6c4066a63a6dd61342503c6438317af6b8ac1ebf3110eaad36943c5ce9ac58d3f23b6a927cd0c2aebab474c9563bd7704a66ceb71b';
            const user = {
                id: 'd5a13807-489c-4312-a9e2-58e024ea01e0',
                address: '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                email: 'tester@test.com',
                locale: 'en',
                role: 'authenticated',
                type: 't721',
                username: 'tester',
                valid: true,
            };
            const signer = '0x9E43ABA62c0b3590e0fC2deF13ba922Ec35283d9';
            const args: [number, string[], string[], string] = [
                3,
                [
                    '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                    '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                    '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                    '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                ],
                ['0', '100', '0', '1380'],
                '0x4433e0ca220c31ba2d1d020b6c4066a63a6dd61342503c6438317af6b8ac1ebf3110eaad36943c5ce9ac58d3f23b6a927cd0c2aebab474c9563bd7704a66ceb71bdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000a032c39b8464cd7af6e74a68c015a423ee17228b225ab09f69ff6d95d17ed3e55414e7b500000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000090000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a0600000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            ];
            const target = '0x1d276ee950745444BE5A22A94dC41845CCD21795';
            const t721adminContract = {
                _address: target,
                methods: {
                    refundedExecute: () => ({
                        encodeABI: () => '0x1234',
                    }),
                },
            };
            const spied = spy(context.txsService);

            when(
                context.refractFactoryServiceMock.isController(
                    user.address,
                    signer,
                    anything(),
                ),
            ).thenResolve(true);

            when(
                context.refractFactoryServiceMock.encodeCall(
                    user.address,
                    signer,
                    anything(),
                    anything(),
                    anything(),
                    anything(),
                    anything(),
                ),
            ).thenResolve([target, '0xabcd']);

            when(context.t721AdminService.get()).thenResolve(t721adminContract);

            when(
                spied.estimateGasLimit('admin_0', target, '0x1234'),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.txsService.mtx(
                payload,
                signature,
                user as UserDto,
            );

            expect(res).toEqual({
                error: 'unexpected_error',
                response: null,
            });

            verify(
                context.refractFactoryServiceMock.isController(
                    user.address,
                    signer,
                    anything(),
                ),
            ).called();
            verify(
                context.refractFactoryServiceMock.encodeCall(
                    user.address,
                    signer,
                    anything(),
                    anything(),
                    anything(),
                    anything(),
                    anything(),
                ),
            ).called();
            verify(context.t721AdminService.get()).called();
            verify(
                spied.estimateGasLimit('admin_0', target, '0x1234'),
            ).called();
        });

        it('should fail on gas price estimation error', async function() {
            const payload = {
                domain: {
                    name: 'Refract Wallet',
                    version: '0',
                    chainId: 2702,
                    verifyingContract:
                        '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                },
                primaryType: 'MetaTransaction',
                types: {
                    MetaTransaction: [
                        {
                            name: 'parameters',
                            type: 'TransactionParameters[]',
                        },
                        {
                            name: 'nonce',
                            type: 'uint256',
                        },
                    ],
                    TransactionParameters: [
                        {
                            type: 'address',
                            name: 'from',
                        },
                        {
                            type: 'address',
                            name: 'to',
                        },
                        {
                            type: 'address',
                            name: 'relayer',
                        },
                        {
                            type: 'uint256',
                            name: 'value',
                        },
                        {
                            type: 'bytes',
                            name: 'data',
                        },
                    ],
                    EIP712Domain: [
                        {
                            name: 'name',
                            type: 'string',
                        },
                        {
                            name: 'version',
                            type: 'string',
                        },
                        {
                            name: 'chainId',
                            type: 'uint256',
                        },
                        {
                            name: 'verifyingContract',
                            type: 'address',
                        },
                    ],
                },
                message: {
                    nonce: 3,
                    parameters: [
                        {
                            from: '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                            to: '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                            relayer:
                                '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                            data:
                                '0xdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                            value: '0',
                        },
                        {
                            from: '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                            to: '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                            relayer:
                                '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                            data:
                                '0xa032c39b8464cd7af6e74a68c015a423ee17228b225ab09f69ff6d95d17ed3e55414e7b500000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000090000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a0600000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                            value: '0',
                        },
                    ],
                },
            };
            const signature =
                '0x4433e0ca220c31ba2d1d020b6c4066a63a6dd61342503c6438317af6b8ac1ebf3110eaad36943c5ce9ac58d3f23b6a927cd0c2aebab474c9563bd7704a66ceb71b';
            const user = {
                id: 'd5a13807-489c-4312-a9e2-58e024ea01e0',
                address: '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                email: 'tester@test.com',
                locale: 'en',
                role: 'authenticated',
                type: 't721',
                username: 'tester',
                valid: true,
            };
            const signer = '0x9E43ABA62c0b3590e0fC2deF13ba922Ec35283d9';
            const args: [number, string[], string[], string] = [
                3,
                [
                    '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                    '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                    '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                    '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                ],
                ['0', '100', '0', '1380'],
                '0x4433e0ca220c31ba2d1d020b6c4066a63a6dd61342503c6438317af6b8ac1ebf3110eaad36943c5ce9ac58d3f23b6a927cd0c2aebab474c9563bd7704a66ceb71bdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000a032c39b8464cd7af6e74a68c015a423ee17228b225ab09f69ff6d95d17ed3e55414e7b500000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000090000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a0600000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            ];
            const target = '0x1d276ee950745444BE5A22A94dC41845CCD21795';
            const t721adminContract = {
                _address: target,
                methods: {
                    refundedExecute: () => ({
                        encodeABI: () => '0x1234',
                    }),
                },
            };
            const spied = spy(context.txsService);

            when(
                context.refractFactoryServiceMock.isController(
                    user.address,
                    signer,
                    anything(),
                ),
            ).thenResolve(true);

            when(
                context.refractFactoryServiceMock.encodeCall(
                    user.address,
                    signer,
                    anything(),
                    anything(),
                    anything(),
                    anything(),
                    anything(),
                ),
            ).thenResolve([target, '0xabcd']);

            when(context.t721AdminService.get()).thenResolve(t721adminContract);

            when(
                spied.estimateGasLimit('admin_0', target, '0x1234'),
            ).thenResolve({
                error: null,
                response: '1000000',
            });

            when(spied.estimateGasPrice('1000000')).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.txsService.mtx(
                payload,
                signature,
                user as UserDto,
            );

            expect(res).toEqual({
                error: 'unexpected_error',
                response: null,
            });

            verify(
                context.refractFactoryServiceMock.isController(
                    user.address,
                    signer,
                    anything(),
                ),
            ).called();
            verify(
                context.refractFactoryServiceMock.encodeCall(
                    user.address,
                    signer,
                    anything(),
                    anything(),
                    anything(),
                    anything(),
                    anything(),
                ),
            ).called();
            verify(context.t721AdminService.get()).called();
            verify(
                spied.estimateGasLimit('admin_0', target, '0x1234'),
            ).called();
            verify(spied.estimateGasPrice('1000000')).called();
        });

        it('should fail on raw transaction broadcast error', async function() {
            const payload = {
                domain: {
                    name: 'Refract Wallet',
                    version: '0',
                    chainId: 2702,
                    verifyingContract:
                        '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                },
                primaryType: 'MetaTransaction',
                types: {
                    MetaTransaction: [
                        {
                            name: 'parameters',
                            type: 'TransactionParameters[]',
                        },
                        {
                            name: 'nonce',
                            type: 'uint256',
                        },
                    ],
                    TransactionParameters: [
                        {
                            type: 'address',
                            name: 'from',
                        },
                        {
                            type: 'address',
                            name: 'to',
                        },
                        {
                            type: 'address',
                            name: 'relayer',
                        },
                        {
                            type: 'uint256',
                            name: 'value',
                        },
                        {
                            type: 'bytes',
                            name: 'data',
                        },
                    ],
                    EIP712Domain: [
                        {
                            name: 'name',
                            type: 'string',
                        },
                        {
                            name: 'version',
                            type: 'string',
                        },
                        {
                            name: 'chainId',
                            type: 'uint256',
                        },
                        {
                            name: 'verifyingContract',
                            type: 'address',
                        },
                    ],
                },
                message: {
                    nonce: 3,
                    parameters: [
                        {
                            from: '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                            to: '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                            relayer:
                                '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                            data:
                                '0xdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                            value: '0',
                        },
                        {
                            from: '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                            to: '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                            relayer:
                                '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                            data:
                                '0xa032c39b8464cd7af6e74a68c015a423ee17228b225ab09f69ff6d95d17ed3e55414e7b500000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000090000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a0600000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                            value: '0',
                        },
                    ],
                },
            };
            const signature =
                '0x4433e0ca220c31ba2d1d020b6c4066a63a6dd61342503c6438317af6b8ac1ebf3110eaad36943c5ce9ac58d3f23b6a927cd0c2aebab474c9563bd7704a66ceb71b';
            const user = {
                id: 'd5a13807-489c-4312-a9e2-58e024ea01e0',
                address: '0x77D751f6dfF3c701c552a24589BEC63caaFaEf5D',
                email: 'tester@test.com',
                locale: 'en',
                role: 'authenticated',
                type: 't721',
                username: 'tester',
                valid: true,
            };
            const signer = '0x9E43ABA62c0b3590e0fC2deF13ba922Ec35283d9';
            const args: [number, string[], string[], string] = [
                3,
                [
                    '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                    '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                    '0x1d276ee950745444BE5A22A94dC41845CCD21795',
                    '0xe9CfF24ea9AB940e9F1041AfA9688805DdD71404',
                ],
                ['0', '100', '0', '1380'],
                '0x4433e0ca220c31ba2d1d020b6c4066a63a6dd61342503c6438317af6b8ac1ebf3110eaad36943c5ce9ac58d3f23b6a927cd0c2aebab474c9563bd7704a66ceb71bdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000a032c39b8464cd7af6e74a68c015a423ee17228b225ab09f69ff6d95d17ed3e55414e7b500000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a0000000000000000000000000000000000000000000000000000000005e4ff040000000000000000000000000000000000000000000000000000000005e5125a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000090000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a060000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd6140000000000000000000000007aacfebdc4aedac8881d0ef52011470a202cd61400000000000000000000000014b1393544ad0788de910c7bb8188c44c72b9a0600000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
            ];
            const target = '0x1d276ee950745444BE5A22A94dC41845CCD21795';
            const t721adminContract = {
                _address: target,
                methods: {
                    refundedExecute: () => ({
                        encodeABI: () => '0x1234',
                    }),
                },
            };
            const spied = spy(context.txsService);

            when(
                context.refractFactoryServiceMock.isController(
                    user.address,
                    signer,
                    anything(),
                ),
            ).thenResolve(true);

            when(
                context.refractFactoryServiceMock.encodeCall(
                    user.address,
                    signer,
                    anything(),
                    anything(),
                    anything(),
                    anything(),
                    anything(),
                ),
            ).thenResolve([target, '0xabcd']);

            when(context.t721AdminService.get()).thenResolve(t721adminContract);

            when(
                spied.estimateGasLimit('admin_0', target, '0x1234'),
            ).thenResolve({
                error: null,
                response: '1000000',
            });

            when(spied.estimateGasPrice('1000000')).thenResolve({
                error: null,
                response: '150000000',
            });

            when(
                spied.sendRawTransaction(
                    'admin_0',
                    target,
                    '0',
                    '0x1234',
                    '150000000',
                    '1000000',
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.txsService.mtx(
                payload,
                signature,
                user as UserDto,
            );

            expect(res).toEqual({
                error: 'unexpected_error',
                response: null,
            });

            verify(
                context.refractFactoryServiceMock.isController(
                    user.address,
                    signer,
                    anything(),
                ),
            ).called();
            verify(
                context.refractFactoryServiceMock.encodeCall(
                    user.address,
                    signer,
                    anything(),
                    anything(),
                    anything(),
                    anything(),
                    anything(),
                ),
            ).called();
            verify(context.t721AdminService.get()).called();
            verify(
                spied.estimateGasLimit('admin_0', target, '0x1234'),
            ).called();
            verify(spied.estimateGasPrice('1000000')).called();
            verify(
                spied.sendRawTransaction(
                    'admin_0',
                    target,
                    '0',
                    '0x1234',
                    '150000000',
                    '1000000',
                ),
            ).called();
        });
    });

    describe('sendRawTransaction', function() {
        it('should send raw transaction', async function() {
            const transactionHash =
                '0x642d048892f14c556d16dcbbdc5567bafee2d9bae40226d13807e72e097d59b8';
            const txentiy = {
                transaction_hash: transactionHash,
                confirmed: false,
                block_number: 0,
            };
            const from = 'admin_0';
            const to = '0xb722ef11057ef599fb3b34adfee74ee2df6c9f60';
            const value = '0';
            const data = '0xabcdef';
            const gasPrice = '15000000000';
            const gasLimit = '1000000';
            const web3 = {
                eth: {
                    sendSignedTransaction: async () => ({
                        transactionHash,
                    }),
                },
            };

            const spied = spy(context.txsService);

            when(
                context.vaultereumServiceMock.read('ethereum/accounts/admin_0'),
            ).thenResolve({
                error: null,
                response: {},
            });

            when(
                context.vaultereumServiceMock.write(
                    'ethereum/accounts/admin_0/sign-tx',
                    deepEqual({
                        address_to: to,
                        amount: value,
                        gas_price: gasPrice,
                        gas_limit: gasLimit,
                        data: data.slice(2),
                        encoding: 'hex',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    data: {
                        signed_transaction: '0x123456',
                    },
                },
            });

            when(context.web3ServiceMock.get()).thenResolve(web3);

            when(spied.subscribe(transactionHash)).thenResolve({
                error: null,
                response: (txentiy as any) as TxEntity,
            });

            const res = await context.txsService.sendRawTransaction(
                from,
                to,
                value,
                data,
                gasPrice,
                gasLimit,
            );

            expect(res).toEqual({
                error: null,
                response: txentiy,
            });

            verify(
                context.vaultereumServiceMock.read('ethereum/accounts/admin_0'),
            ).called();
            verify(
                context.vaultereumServiceMock.write(
                    'ethereum/accounts/admin_0/sign-tx',
                    deepEqual({
                        address_to: to,
                        amount: value,
                        gas_price: gasPrice,
                        gas_limit: gasLimit,
                        data: data.slice(2),
                        encoding: 'hex',
                    }),
                ),
            ).called();
            verify(context.web3ServiceMock.get()).called();
            verify(spied.subscribe(transactionHash)).called();
        });

        it('should fail on account check error', async function() {
            const transactionHash =
                '0x642d048892f14c556d16dcbbdc5567bafee2d9bae40226d13807e72e097d59b8';
            const txentiy = {
                transaction_hash: transactionHash,
                confirmed: false,
                block_number: 0,
            };
            const from = 'admin_0';
            const to = '0xb722ef11057ef599fb3b34adfee74ee2df6c9f60';
            const value = '0';
            const data = '0xabcdef';
            const gasPrice = '15000000000';
            const gasLimit = '1000000';
            const web3 = {
                eth: {
                    sendSignedTransaction: async () => ({
                        transactionHash,
                    }),
                },
            };

            const spied = spy(context.txsService);

            when(
                context.vaultereumServiceMock.read('ethereum/accounts/admin_0'),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.txsService.sendRawTransaction(
                from,
                to,
                value,
                data,
                gasPrice,
                gasLimit,
            );

            expect(res).toEqual({
                error: 'unexpected_error',
                response: null,
            });

            verify(
                context.vaultereumServiceMock.read('ethereum/accounts/admin_0'),
            ).called();
        });

        it('should fail on tx signature error', async function() {
            const transactionHash =
                '0x642d048892f14c556d16dcbbdc5567bafee2d9bae40226d13807e72e097d59b8';
            const txentiy = {
                transaction_hash: transactionHash,
                confirmed: false,
                block_number: 0,
            };
            const from = 'admin_0';
            const to = '0xb722ef11057ef599fb3b34adfee74ee2df6c9f60';
            const value = '0';
            const data = '0xabcdef';
            const gasPrice = '15000000000';
            const gasLimit = '1000000';
            const web3 = {
                eth: {
                    sendSignedTransaction: async () => ({
                        transactionHash,
                    }),
                },
            };

            const spied = spy(context.txsService);

            when(
                context.vaultereumServiceMock.read('ethereum/accounts/admin_0'),
            ).thenResolve({
                error: null,
                response: {},
            });

            when(
                context.vaultereumServiceMock.write(
                    'ethereum/accounts/admin_0/sign-tx',
                    deepEqual({
                        address_to: to,
                        amount: value,
                        gas_price: gasPrice,
                        gas_limit: gasLimit,
                        data: data.slice(2),
                        encoding: 'hex',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.txsService.sendRawTransaction(
                from,
                to,
                value,
                data,
                gasPrice,
                gasLimit,
            );

            expect(res).toEqual({
                error: 'unexpected_error',
                response: null,
            });

            verify(
                context.vaultereumServiceMock.read('ethereum/accounts/admin_0'),
            ).called();
            verify(
                context.vaultereumServiceMock.write(
                    'ethereum/accounts/admin_0/sign-tx',
                    deepEqual({
                        address_to: to,
                        amount: value,
                        gas_price: gasPrice,
                        gas_limit: gasLimit,
                        data: data.slice(2),
                        encoding: 'hex',
                    }),
                ),
            ).called();
        });

        it('should fail on subscription error', async function() {
            const transactionHash =
                '0x642d048892f14c556d16dcbbdc5567bafee2d9bae40226d13807e72e097d59b8';
            const txentiy = {
                transaction_hash: transactionHash,
                confirmed: false,
                block_number: 0,
            };
            const from = 'admin_0';
            const to = '0xb722ef11057ef599fb3b34adfee74ee2df6c9f60';
            const value = '0';
            const data = '0xabcdef';
            const gasPrice = '15000000000';
            const gasLimit = '1000000';
            const web3 = {
                eth: {
                    sendSignedTransaction: async () => ({
                        transactionHash,
                    }),
                },
            };

            const spied = spy(context.txsService);

            when(
                context.vaultereumServiceMock.read('ethereum/accounts/admin_0'),
            ).thenResolve({
                error: null,
                response: {},
            });

            when(
                context.vaultereumServiceMock.write(
                    'ethereum/accounts/admin_0/sign-tx',
                    deepEqual({
                        address_to: to,
                        amount: value,
                        gas_price: gasPrice,
                        gas_limit: gasLimit,
                        data: data.slice(2),
                        encoding: 'hex',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    data: {
                        signed_transaction: '0x123456',
                    },
                },
            });

            when(context.web3ServiceMock.get()).thenResolve(web3);

            when(spied.subscribe(transactionHash)).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.txsService.sendRawTransaction(
                from,
                to,
                value,
                data,
                gasPrice,
                gasLimit,
            );

            expect(res).toEqual({
                error: 'unexpected_error',
                response: null,
            });

            verify(
                context.vaultereumServiceMock.read('ethereum/accounts/admin_0'),
            ).called();
            verify(
                context.vaultereumServiceMock.write(
                    'ethereum/accounts/admin_0/sign-tx',
                    deepEqual({
                        address_to: to,
                        amount: value,
                        gas_price: gasPrice,
                        gas_limit: gasLimit,
                        data: data.slice(2),
                        encoding: 'hex',
                    }),
                ),
            ).called();
            verify(context.web3ServiceMock.get()).called();
            verify(spied.subscribe(transactionHash)).called();
        });
    });
});
