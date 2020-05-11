import { TxsService, TxsServiceOptions } from '@lib/common/txs/Txs.service';
import { TxsRepository } from '@lib/common/txs/Txs.repository';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { T721AdminService } from '@lib/common/contracts/T721Admin.service';
import { anything, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';
import { TxEntity } from '@lib/common/txs/entities/Tx.entity';
import { GlobalEntity } from '@lib/common/globalconfig/entities/Global.entity';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { RocksideService } from '@lib/common/rockside/Rockside.service';

class TxEntityMock {
    public _properties = null;

    search(options: EsSearchOptionsStatic, callback?: (err: any, ret: any) => void): void {
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
        web3ServiceMock: Web3Service;
        t721AdminService: T721AdminService;
        rocksideService: RocksideService;
    } = {
        txsService: null,
        txsRepositoryMock: null,
        txsEntityMock: null,
        txsOptionsMock: null,
        globalConfigServiceMock: null,
        web3ServiceMock: null,
        t721AdminService: null,
        rocksideService: null,
    };

    beforeEach(async function() {
        context.txsRepositoryMock = mock(TxsRepository);
        context.txsEntityMock = mock(TxEntityMock);
        context.rocksideService = mock(RocksideService);
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
        context.web3ServiceMock = mock(Web3Service);
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
                    provide: Web3Service,
                    useValue: instance(context.web3ServiceMock),
                },
                {
                    provide: T721AdminService,
                    useValue: instance(context.t721AdminService),
                },
                {
                    provide: RocksideService,
                    useValue: instance(context.rocksideService),
                },
                TxsService,
            ],
        }).compile();

        context.txsService = app.get<TxsService>(TxsService);
    });

    describe('subscribe', function() {
        it('should subscribe to a transaction', async function() {
            const transactionHash = '0x642d048892f14c556d16dcbbdc5567bafee2d9bae40226d13807e72e097d59b8';
            const spied = spy(context.txsService);
            const txentiy = {
                transaction_hash: '0x93e56b205c2ca911b754536d2474a75b9823e0b3d2b3537d08457ebd5f8f8cce',
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
            const transactionHash = '0x642d048892f14c556d16dcbbdc5567bafee2d9bae40226d13807e72e097d59b8';
            const spied = spy(context.txsService);
            const txentiy = {
                transaction_hash: '0x93e56b205c2ca911b754536d2474a75b9823e0b3d2b3537d08457ebd5f8f8cce',
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
            const transactionHash = '0x642d048892f14c556d16dcbbdc5567bafee2d9bae40226d13807e72e097d59';
            const spied = spy(context.txsService);
            const txentiy = {
                transaction_hash: '0x93e56b205c2ca911b754536d2474a75b9823e0b3d2b3537d08457ebd5f8f8cce',
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
            const transactionHash = '0x642d048892f14c556d16dcbbdc5567bafee2d9bae40226d13807e72e097d59b8';
            const spied = spy(context.txsService);
            const txentiy = {
                transaction_hash: '0x93e56b205c2ca911b754536d2474a75b9823e0b3d2b3537d08457ebd5f8f8cce',
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
            const transactionHash = '0x642d048892f14c556d16dcbbdc5567bafee2d9bae40226d13807e72e097d59b8';
            const spied = spy(context.txsService);
            const txentiy = {
                transaction_hash: '0x93e56b205c2ca911b754536d2474a75b9823e0b3d2b3537d08457ebd5f8f8cce',
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
});
