import { TxsScheduler } from '@app/worker/schedulers/txs/Txs.scheduler';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { TxsService, TxsServiceOptions } from '@lib/common/txs/Txs.service';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { Schedule } from 'nest-schedule';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { GlobalEntity } from '@lib/common/globalconfig/entities/Global.entity';
import { ESSearchReturn } from '@lib/common/utils/ESSearchReturn';
import { TxEntity } from '@lib/common/txs/entities/Tx.entity';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { toAcceptedAddressFormat } from '@ticket721sources/global';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';

describe('Txs Scheduler', function() {
    const context: {
        txsScheduler: TxsScheduler;
        globalConfigServiceMock: GlobalConfigService;
        web3ServiceMock: Web3Service;
        txsServiceMock: TxsService;
        shutdownServiceMock: ShutdownService;
        loggerServiceMock: WinstonLoggerService;
        scheduleMock: Schedule;
        txsServiceOptions: TxsServiceOptions;
        outrospectionService: OutrospectionService;
    } = {
        txsScheduler: null,
        globalConfigServiceMock: null,
        web3ServiceMock: null,
        shutdownServiceMock: null,
        txsServiceMock: null,
        loggerServiceMock: null,
        scheduleMock: null,
        txsServiceOptions: null,
        outrospectionService: null,
    };

    beforeEach(async function() {
        context.web3ServiceMock = mock(Web3Service);
        context.globalConfigServiceMock = mock(GlobalConfigService);
        context.txsServiceMock = mock(TxsService);
        context.shutdownServiceMock = mock(ShutdownService);
        context.loggerServiceMock = mock(WinstonLoggerService);
        context.scheduleMock = mock(Schedule);
        context.txsServiceOptions = {
            blockThreshold: 2,
            blockPollingRefreshRate: 1000,
            ethereumNetworkId: 2702,
            ethereumMtxDomainName: 'Refract Wallet',
            ethereumMtxVersion: '0',
            ethereumMtxRelayAdmin: 'admin_0',
            targetGasPrice: 150,
        };
        context.outrospectionService = mock(OutrospectionService);

        const app: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: Web3Service,
                    useValue: instance(context.web3ServiceMock),
                },
                {
                    provide: GlobalConfigService,
                    useValue: instance(context.globalConfigServiceMock),
                },
                {
                    provide: ShutdownService,
                    useValue: instance(context.shutdownServiceMock),
                },
                {
                    provide: TxsService,
                    useValue: instance(context.txsServiceMock),
                },
                {
                    provide: WinstonLoggerService,
                    useValue: instance(context.loggerServiceMock),
                },
                {
                    provide: 'NEST_SCHEDULE_PROVIDER',
                    useValue: instance(context.scheduleMock),
                },
                {
                    provide: 'TXS_MODULE_OPTIONS',
                    useValue: context.txsServiceOptions,
                },
                {
                    provide: OutrospectionService,
                    useValue: instance(context.outrospectionService),
                },
                TxsScheduler,
            ],
        }).compile();

        context.txsScheduler = app.get<TxsScheduler>(TxsScheduler);
    });

    describe('blockPolling', function() {
        it('should update global config block number', async function() {
            const globalConfig: Partial<GlobalEntity> = {
                id: 'global',
                block_number: 100,
                eth_eur_price: 10000,
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        confirmed: false,
                                    },
                                },
                                {
                                    range: {
                                        block_number: {
                                            gt: 0,
                                        },
                                    },
                                },
                                {
                                    range: {
                                        block_number: {
                                            lte: 98,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esresponse = {
                took: 5,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1.6931472,
                    hits: [
                        {
                            _index: 'ticket721_tx',
                            _type: 'tx',
                            _id: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                            _score: 1.6931472,
                            _source: {
                                gas_price: '7378099047',
                                gas_price_ln: 32.78060201055173,
                                contract_address: null,
                                to_: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                                from_: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                                gas_used: '1007437',
                                gas_used_ln: 19.942258192068078,
                                block_hash: '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                block_number: 38,
                                created_at: '2020-02-19T09:42:20.430Z',
                                cumulative_gas_used_ln: 19.942258192068078,
                                transaction_index: 0,
                                confirmed: false,
                                logs_bloom:
                                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000004000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000040000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000020000000000c000000000000000000000840000000000000020000000000000000000000040000000000010000000060000000000000000000000000100000000000100000088000000000200000000000',
                                updated_at: '2020-02-19T09:42:21.514Z',
                                logs: [
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_751314cb',
                                        log_index: 0,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_3c991066',
                                        log_index: 1,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_31fa861a',
                                        log_index: 2,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_f2a89490',
                                        log_index: 3,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_9b03fb12',
                                        log_index: 4,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39bb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c1551600000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e46640000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e46640000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e466400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000000000000900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_86381013',
                                        log_index: 5,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                ],
                                cumulative_gas_used: '1007437',
                                transaction_hash: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                status: true,
                            },
                        },
                    ],
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

            when(context.txsServiceMock.searchElastic(deepEqual(esquery))).thenResolve({
                error: null,
                response: (esresponse as any) as ESSearchReturn<TxEntity>,
            });

            when(
                context.txsServiceMock.update(
                    deepEqual({
                        transaction_hash: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                    }),
                    deepEqual({
                        confirmed: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.txsScheduler.blockPolling();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(context.txsServiceMock.searchElastic(deepEqual(esquery))).called();

            verify(
                context.txsServiceMock.update(
                    deepEqual({
                        transaction_hash: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                    }),
                    deepEqual({
                        confirmed: true,
                    }),
                ),
            ).called();
        });

        it('should update because block number is higher', async function() {
            (context.txsScheduler as any).lastBlock = 99;

            const globalConfig: Partial<GlobalEntity> = {
                id: 'global',
                block_number: 100,
                eth_eur_price: 10000,
            };
            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        confirmed: false,
                                    },
                                },
                                {
                                    range: {
                                        block_number: {
                                            gt: 0,
                                        },
                                    },
                                },
                                {
                                    range: {
                                        block_number: {
                                            lte: 98,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esresponse = {
                took: 5,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1.6931472,
                    hits: [
                        {
                            _index: 'ticket721_tx',
                            _type: 'tx',
                            _id: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                            _score: 1.6931472,
                            _source: {
                                gas_price: '7378099047',
                                gas_price_ln: 32.78060201055173,
                                contract_address: null,
                                to_: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                                from_: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                                gas_used: '1007437',
                                gas_used_ln: 19.942258192068078,
                                block_hash: '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                block_number: 38,
                                created_at: '2020-02-19T09:42:20.430Z',
                                cumulative_gas_used_ln: 19.942258192068078,
                                transaction_index: 0,
                                confirmed: false,
                                logs_bloom:
                                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000004000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000040000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000020000000000c000000000000000000000840000000000000020000000000000000000000040000000000010000000060000000000000000000000000100000000000100000088000000000200000000000',
                                updated_at: '2020-02-19T09:42:21.514Z',
                                logs: [
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_751314cb',
                                        log_index: 0,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_3c991066',
                                        log_index: 1,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_31fa861a',
                                        log_index: 2,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_f2a89490',
                                        log_index: 3,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_9b03fb12',
                                        log_index: 4,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39bb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c1551600000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e46640000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e46640000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e466400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000000000000900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_86381013',
                                        log_index: 5,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                ],
                                cumulative_gas_used: '1007437',
                                transaction_hash: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                status: true,
                            },
                        },
                    ],
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

            when(context.txsServiceMock.searchElastic(deepEqual(esquery))).thenResolve({
                error: null,
                response: (esresponse as any) as ESSearchReturn<TxEntity>,
            });

            when(
                context.txsServiceMock.update(
                    deepEqual({
                        transaction_hash: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                    }),
                    deepEqual({
                        confirmed: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.txsScheduler.blockPolling();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(context.txsServiceMock.searchElastic(deepEqual(esquery))).called();

            verify(
                context.txsServiceMock.update(
                    deepEqual({
                        transaction_hash: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                    }),
                    deepEqual({
                        confirmed: true,
                    }),
                ),
            ).called();
        });

        it('should not update because block number is lower', async function() {
            (context.txsScheduler as any).lastBlock = 101;

            const globalConfig: Partial<GlobalEntity> = {
                id: 'global',
                block_number: 100,
                eth_eur_price: 10000,
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        confirmed: false,
                                    },
                                },
                                {
                                    range: {
                                        block_number: {
                                            gt: 0,
                                        },
                                    },
                                },
                                {
                                    range: {
                                        block_number: {
                                            lte: 98,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esresponse = {
                took: 5,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1.6931472,
                    hits: [
                        {
                            _index: 'ticket721_tx',
                            _type: 'tx',
                            _id: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                            _score: 1.6931472,
                            _source: {
                                gas_price: '7378099047',
                                gas_price_ln: 32.78060201055173,
                                contract_address: null,
                                to_: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                                from_: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                                gas_used: '1007437',
                                gas_used_ln: 19.942258192068078,
                                block_hash: '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                block_number: 38,
                                created_at: '2020-02-19T09:42:20.430Z',
                                cumulative_gas_used_ln: 19.942258192068078,
                                transaction_index: 0,
                                confirmed: false,
                                logs_bloom:
                                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000004000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000040000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000020000000000c000000000000000000000840000000000000020000000000000000000000040000000000010000000060000000000000000000000000100000000000100000088000000000200000000000',
                                updated_at: '2020-02-19T09:42:21.514Z',
                                logs: [
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_751314cb',
                                        log_index: 0,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_3c991066',
                                        log_index: 1,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_31fa861a',
                                        log_index: 2,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_f2a89490',
                                        log_index: 3,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_9b03fb12',
                                        log_index: 4,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39bb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c1551600000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e46640000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e46640000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e466400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000000000000900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_86381013',
                                        log_index: 5,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                ],
                                cumulative_gas_used: '1007437',
                                transaction_hash: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                status: true,
                            },
                        },
                    ],
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

            await context.txsScheduler.blockPolling();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(context.txsServiceMock.searchElastic(deepEqual(esquery))).never();

            verify(
                context.txsServiceMock.update(
                    deepEqual({
                        transaction_hash: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                    }),
                    deepEqual({
                        confirmed: true,
                    }),
                ),
            ).never();
        });

        it('should not update because no transactions', async function() {
            (context.txsScheduler as any).lastBlock = 99;

            const globalConfig: Partial<GlobalEntity> = {
                id: 'global',
                block_number: 100,
                eth_eur_price: 10000,
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        confirmed: false,
                                    },
                                },
                                {
                                    range: {
                                        block_number: {
                                            gt: 0,
                                        },
                                    },
                                },
                                {
                                    range: {
                                        block_number: {
                                            lte: 98,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esresponse = {
                took: 5,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 0,
                    max_score: 1.6931472,
                    hits: [],
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

            when(context.txsServiceMock.searchElastic(deepEqual(esquery))).thenResolve({
                error: null,
                response: (esresponse as any) as ESSearchReturn<TxEntity>,
            });

            await context.txsScheduler.blockPolling();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(context.txsServiceMock.searchElastic(deepEqual(esquery))).called();
        });

        it('should fail on global config fetch error', async function() {
            const globalConfig: Partial<GlobalEntity> = {
                id: 'global',
                block_number: 100,
                eth_eur_price: 10000,
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        confirmed: false,
                                    },
                                },
                                {
                                    range: {
                                        block_number: {
                                            gt: 0,
                                        },
                                    },
                                },
                                {
                                    range: {
                                        block_number: {
                                            lte: 98,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esresponse = {
                took: 5,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1.6931472,
                    hits: [
                        {
                            _index: 'ticket721_tx',
                            _type: 'tx',
                            _id: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                            _score: 1.6931472,
                            _source: {
                                gas_price: '7378099047',
                                gas_price_ln: 32.78060201055173,
                                contract_address: null,
                                to_: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                                from_: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                                gas_used: '1007437',
                                gas_used_ln: 19.942258192068078,
                                block_hash: '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                block_number: 38,
                                created_at: '2020-02-19T09:42:20.430Z',
                                cumulative_gas_used_ln: 19.942258192068078,
                                transaction_index: 0,
                                confirmed: false,
                                logs_bloom:
                                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000004000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000040000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000020000000000c000000000000000000000840000000000000020000000000000000000000040000000000010000000060000000000000000000000000100000000000100000088000000000200000000000',
                                updated_at: '2020-02-19T09:42:21.514Z',
                                logs: [
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_751314cb',
                                        log_index: 0,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_3c991066',
                                        log_index: 1,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_31fa861a',
                                        log_index: 2,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_f2a89490',
                                        log_index: 3,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_9b03fb12',
                                        log_index: 4,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39bb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c1551600000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e46640000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e46640000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e466400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000000000000900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_86381013',
                                        log_index: 5,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                ],
                                cumulative_gas_used: '1007437',
                                transaction_hash: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                status: true,
                            },
                        },
                    ],
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

            await context.txsScheduler.blockPolling();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new Error('TxsScheduler::blockPolling unable to recover global config')),
                ),
            ).called();
        });

        it('should fail on empty global config table', async function() {
            const globalConfig: Partial<GlobalEntity> = {
                id: 'global',
                block_number: 100,
                eth_eur_price: 10000,
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        confirmed: false,
                                    },
                                },
                                {
                                    range: {
                                        block_number: {
                                            gt: 0,
                                        },
                                    },
                                },
                                {
                                    range: {
                                        block_number: {
                                            lte: 98,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esresponse = {
                took: 5,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1.6931472,
                    hits: [
                        {
                            _index: 'ticket721_tx',
                            _type: 'tx',
                            _id: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                            _score: 1.6931472,
                            _source: {
                                gas_price: '7378099047',
                                gas_price_ln: 32.78060201055173,
                                contract_address: null,
                                to_: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                                from_: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                                gas_used: '1007437',
                                gas_used_ln: 19.942258192068078,
                                block_hash: '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                block_number: 38,
                                created_at: '2020-02-19T09:42:20.430Z',
                                cumulative_gas_used_ln: 19.942258192068078,
                                transaction_index: 0,
                                confirmed: false,
                                logs_bloom:
                                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000004000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000040000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000020000000000c000000000000000000000840000000000000020000000000000000000000040000000000010000000060000000000000000000000000100000000000100000088000000000200000000000',
                                updated_at: '2020-02-19T09:42:21.514Z',
                                logs: [
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_751314cb',
                                        log_index: 0,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_3c991066',
                                        log_index: 1,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_31fa861a',
                                        log_index: 2,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_f2a89490',
                                        log_index: 3,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_9b03fb12',
                                        log_index: 4,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39bb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c1551600000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e46640000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e46640000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e466400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000000000000900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_86381013',
                                        log_index: 5,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                ],
                                cumulative_gas_used: '1007437',
                                transaction_hash: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                status: true,
                            },
                        },
                    ],
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

            await context.txsScheduler.blockPolling();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new Error('TxsScheduler::blockPolling unable to recover global config')),
                ),
            ).called();
        });

        it('should fail on transaction fetch error', async function() {
            (context.txsScheduler as any).lastBlock = 99;

            const globalConfig: Partial<GlobalEntity> = {
                id: 'global',
                block_number: 100,
                eth_eur_price: 10000,
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        confirmed: false,
                                    },
                                },
                                {
                                    range: {
                                        block_number: {
                                            gt: 0,
                                        },
                                    },
                                },
                                {
                                    range: {
                                        block_number: {
                                            lte: 98,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esresponse = {
                took: 5,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1.6931472,
                    hits: [
                        {
                            _index: 'ticket721_tx',
                            _type: 'tx',
                            _id: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                            _score: 1.6931472,
                            _source: {
                                gas_price: '7378099047',
                                gas_price_ln: 32.78060201055173,
                                contract_address: null,
                                to_: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                                from_: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                                gas_used: '1007437',
                                gas_used_ln: 19.942258192068078,
                                block_hash: '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                block_number: 38,
                                created_at: '2020-02-19T09:42:20.430Z',
                                cumulative_gas_used_ln: 19.942258192068078,
                                transaction_index: 0,
                                confirmed: false,
                                logs_bloom:
                                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000004000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000040000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000020000000000c000000000000000000000840000000000000020000000000000000000000040000000000010000000060000000000000000000000000100000000000100000088000000000200000000000',
                                updated_at: '2020-02-19T09:42:21.514Z',
                                logs: [
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_751314cb',
                                        log_index: 0,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_3c991066',
                                        log_index: 1,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_31fa861a',
                                        log_index: 2,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_f2a89490',
                                        log_index: 3,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_9b03fb12',
                                        log_index: 4,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39bb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c1551600000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e46640000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e46640000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e466400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000000000000900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_86381013',
                                        log_index: 5,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                ],
                                cumulative_gas_used: '1007437',
                                transaction_hash: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                status: true,
                            },
                        },
                    ],
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

            when(context.txsServiceMock.searchElastic(deepEqual(esquery))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await context.txsScheduler.blockPolling();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(context.txsServiceMock.searchElastic(deepEqual(esquery))).called();
            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new Error('TxsScheduler::blockPolling error while fetching txs')),
                ),
            ).called();
        });

        it('should fail on transaction update error', async function() {
            (context.txsScheduler as any).lastBlock = 99;

            const globalConfig: Partial<GlobalEntity> = {
                id: 'global',
                block_number: 100,
                eth_eur_price: 10000,
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        confirmed: false,
                                    },
                                },
                                {
                                    range: {
                                        block_number: {
                                            gt: 0,
                                        },
                                    },
                                },
                                {
                                    range: {
                                        block_number: {
                                            lte: 98,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esresponse = {
                took: 5,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1.6931472,
                    hits: [
                        {
                            _index: 'ticket721_tx',
                            _type: 'tx',
                            _id: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                            _score: 1.6931472,
                            _source: {
                                gas_price: '7378099047',
                                gas_price_ln: 32.78060201055173,
                                contract_address: null,
                                to_: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                                from_: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                                gas_used: '1007437',
                                gas_used_ln: 19.942258192068078,
                                block_hash: '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                block_number: 38,
                                created_at: '2020-02-19T09:42:20.430Z',
                                cumulative_gas_used_ln: 19.942258192068078,
                                transaction_index: 0,
                                confirmed: false,
                                logs_bloom:
                                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000004000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000040000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000020000000000c000000000000000000000840000000000000020000000000000000000000040000000000010000000060000000000000000000000000100000000000100000088000000000200000000000',
                                updated_at: '2020-02-19T09:42:21.514Z',
                                logs: [
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_751314cb',
                                        log_index: 0,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_3c991066',
                                        log_index: 1,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_31fa861a',
                                        log_index: 2,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_f2a89490',
                                        log_index: 3,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                                        data: '0x',
                                        removed: false,
                                        topics: [
                                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                                            '0xb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c15516',
                                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_9b03fb12',
                                        log_index: 4,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                    {
                                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                                        data:
                                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39bb7d5ba30fcde3bad12f0e617eccb739c68b889fc69d2714d755cfc8e50c1551600000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e46640000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e46640000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e4664000000000000000000000000000000000000000000000000000000005e4d1104000000000000000000000000000000000000000000000000000000005e4e466400000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000000000000900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de900000000000000000000000030199ec7ad0622c159cda3409a1f22a6dfe61de9000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                                        removed: false,
                                        topics: [
                                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                                        ],
                                        block_hash:
                                            '0xd29f1befb266e4ee33c42c66a77dc29bb18c35516f178059f811d557e77262e4',
                                        block_number: 38,
                                        transaction_index: 0,
                                        id: 'log_86381013',
                                        log_index: 5,
                                        transaction_hash:
                                            '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                    },
                                ],
                                cumulative_gas_used: '1007437',
                                transaction_hash: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                                status: true,
                            },
                        },
                    ],
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

            when(context.txsServiceMock.searchElastic(deepEqual(esquery))).thenResolve({
                error: null,
                response: (esresponse as any) as ESSearchReturn<TxEntity>,
            });

            when(
                context.txsServiceMock.update(
                    deepEqual({
                        transaction_hash: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                    }),
                    deepEqual({
                        confirmed: true,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await context.txsScheduler.blockPolling();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(context.txsServiceMock.searchElastic(deepEqual(esquery))).called();

            verify(
                context.txsServiceMock.update(
                    deepEqual({
                        transaction_hash: '0x6d15a232182479181fe7f523b5400142f18744ad1117a1e580730f43eb75b84e',
                    }),
                    deepEqual({
                        confirmed: true,
                    }),
                ),
            ).called();
            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new Error('TxsScheduler::blockPolling error while updating tx: unexpected_error')),
                ),
            ).called();
        });
    });

    describe('transactionInitialization', function() {
        it('should initialize transaction', async function() {
            const globalConfig: Partial<GlobalEntity> = {
                id: 'global',
                block_number: 100,
                eth_eur_price: 10000,
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        confirmed: false,
                                    },
                                },
                                {
                                    term: {
                                        block_number: 0,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esresponse = {
                took: 3,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1.3566749,
                    hits: [
                        {
                            _index: 'ticket721_tx',
                            _type: 'tx',
                            _id: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                            _score: 1.3566749,
                            _source: {
                                updated_at: '2020-02-20T14:30:17.175Z',
                                block_number: 0,
                                created_at: '2020-02-20T14:30:17.175Z',
                                confirmed: false,
                                transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                            },
                        },
                    ],
                },
            };

            const transactionHash = '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16';

            const txReceipt = {
                transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                transactionIndex: 0,
                blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                blockNumber: 36,
                from: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                to: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                gasUsed: 1007501,
                cumulativeGasUsed: 1007501,
                contractAddress: null,
                logs: [
                    {
                        logIndex: 0,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                        topics: [
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                        ],
                        type: 'mined',
                        id: 'log_f109be91',
                    },
                    {
                        logIndex: 1,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        type: 'mined',
                        id: 'log_cfcd645b',
                    },
                    {
                        logIndex: 2,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                        ],
                        type: 'mined',
                        id: 'log_0d71664c',
                    },
                    {
                        logIndex: 3,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                        ],
                        type: 'mined',
                        id: 'log_f13c8af4',
                    },
                    {
                        logIndex: 4,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                        ],
                        type: 'mined',
                        id: 'log_0f018f21',
                    },
                    {
                        logIndex: 5,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        type: 'mined',
                        id: 'log_68eb01d1',
                    },
                ],
                status: true,
                logsBloom:
                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000000000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000041000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000000000000000c000000000000000000000800000000000000020000000000000000000000040000000000010000000060000000000000000000004000100000000000100000088000000004200000000000',
                v: '0x153f',
                r: '0x9a02c6a6e2d021e6dc5e168337e3fb8949f58e9bceadbaa6fdf0906489854409',
                s: '0x23bc2af5f9c684f77bff0325976f76a4c634eb4dd76a81bdc42a990fd3d2065d',
            };

            const txInfos = {
                hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                nonce: 3,
                blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                blockNumber: 36,
                transactionIndex: 0,
                from: '0xea51bF51CDd20b0b7a65623992eCf516bB03A082',
                to: '0x1eadac420E7599a355813e63E94250C3384Cc27d',
                value: '0',
                gas: 1016586,
                gasPrice: '7377634553',
                input:
                    '0x631a75a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000080451f0637800000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000040000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a80000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a80000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000564000000000000000000000000000000000000000000000000000000000000060959e904b58b6deea4146198f878f5b1576470b78eab9be3fe9f83a345ffa3d72557979f63903d6ec3c0689f321f3ba122f617c1f21b5ca27ee70617892f2efdec1cdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                v: '0x153f',
                r: '0x9a02c6a6e2d021e6dc5e168337e3fb8949f58e9bceadbaa6fdf0906489854409',
                s: '0x23bc2af5f9c684f77bff0325976f76a4c634eb4dd76a81bdc42a990fd3d2065d',
            };

            const txentity = {
                updated_at: '2020-02-20T14:30:17.175Z',
                block_number: 36,
                created_at: '2020-02-20T14:30:17.175Z',
                confirmed: true,
                status: true,
                block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                contract_address: null,
                cumulative_gas_used: '1007501',
                cumulative_gas_used_ln: 19.942349840032083,
                gas_used: '1007501',
                gas_used_ln: 19.942349840032083,
                gas_price: '7377634553',
                gas_price_ln: 32.78051118169717,
                from_: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                to_: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                transaction_index: 0,
                logs_bloom:
                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000000000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000041000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000000000000000c000000000000000000000800000000000000020000000000000000000000040000000000010000000060000000000000000000004000100000000000100000088000000004200000000000',
                logs: [
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                        log_index: 0,
                        removed: false,
                        topics: [
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_f109be91',
                    },
                    {
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        log_index: 1,
                        removed: false,
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_cfcd645b',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 2,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_0d71664c',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 3,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_f13c8af4',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 4,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_0f018f21',
                    },
                    {
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        log_index: 5,
                        removed: false,
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_68eb01d1',
                    },
                ],
            };

            const web3 = {
                eth: {
                    getTransactionReceipt: async (txhash: string): Promise<any> => txReceipt,
                    getTransaction: async (txhash: string): Promise<any> => txInfos,
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

            when(context.txsServiceMock.searchElastic(deepEqual(esquery))).thenResolve({
                error: null,
                response: esresponse as any,
            });

            when(context.web3ServiceMock.get()).thenResolve(web3);

            when(
                context.txsServiceMock.update(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                    deepEqual((txentity as any) as TxEntity),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.txsScheduler.transactionInitialization();

            verify(context.globalConfigServiceMock.search(deepEqual({ id: 'global' }))).called();
            verify(context.txsServiceMock.searchElastic(deepEqual(esquery))).called();
            verify(context.web3ServiceMock.get()).called();
            verify(
                context.txsServiceMock.update(
                    deepEqual({ transaction_hash: transactionHash }),
                    deepEqual((txentity as any) as TxEntity),
                ),
            ).called();
        });

        it('should initialize transaction with contract creation', async function() {
            const globalConfig: Partial<GlobalEntity> = {
                id: 'global',
                block_number: 100,
                eth_eur_price: 10000,
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        confirmed: false,
                                    },
                                },
                                {
                                    term: {
                                        block_number: 0,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esresponse = {
                took: 3,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1.3566749,
                    hits: [
                        {
                            _index: 'ticket721_tx',
                            _type: 'tx',
                            _id: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                            _score: 1.3566749,
                            _source: {
                                updated_at: '2020-02-20T14:30:17.175Z',
                                block_number: 0,
                                created_at: '2020-02-20T14:30:17.175Z',
                                confirmed: false,
                                transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                            },
                        },
                    ],
                },
            };

            const transactionHash = '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16';

            const txReceipt = {
                transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                transactionIndex: 0,
                blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                blockNumber: 36,
                from: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                to: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                gasUsed: 1007501,
                cumulativeGasUsed: 1007501,
                contractAddress: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                logs: [
                    {
                        logIndex: 0,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                        topics: [
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                        ],
                        type: 'mined',
                        id: 'log_f109be91',
                    },
                    {
                        logIndex: 1,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        type: 'mined',
                        id: 'log_cfcd645b',
                    },
                    {
                        logIndex: 2,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                        ],
                        type: 'mined',
                        id: 'log_0d71664c',
                    },
                    {
                        logIndex: 3,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                        ],
                        type: 'mined',
                        id: 'log_f13c8af4',
                    },
                    {
                        logIndex: 4,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                        ],
                        type: 'mined',
                        id: 'log_0f018f21',
                    },
                    {
                        logIndex: 5,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        type: 'mined',
                        id: 'log_68eb01d1',
                    },
                ],
                status: true,
                logsBloom:
                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000000000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000041000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000000000000000c000000000000000000000800000000000000020000000000000000000000040000000000010000000060000000000000000000004000100000000000100000088000000004200000000000',
                v: '0x153f',
                r: '0x9a02c6a6e2d021e6dc5e168337e3fb8949f58e9bceadbaa6fdf0906489854409',
                s: '0x23bc2af5f9c684f77bff0325976f76a4c634eb4dd76a81bdc42a990fd3d2065d',
            };

            const txInfos = {
                hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                nonce: 3,
                blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                blockNumber: 36,
                transactionIndex: 0,
                from: '0xea51bF51CDd20b0b7a65623992eCf516bB03A082',
                to: '0x1eadac420E7599a355813e63E94250C3384Cc27d',
                value: '0',
                gas: 1016586,
                gasPrice: '7377634553',
                input:
                    '0x631a75a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000080451f0637800000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000040000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a80000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a80000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000564000000000000000000000000000000000000000000000000000000000000060959e904b58b6deea4146198f878f5b1576470b78eab9be3fe9f83a345ffa3d72557979f63903d6ec3c0689f321f3ba122f617c1f21b5ca27ee70617892f2efdec1cdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                v: '0x153f',
                r: '0x9a02c6a6e2d021e6dc5e168337e3fb8949f58e9bceadbaa6fdf0906489854409',
                s: '0x23bc2af5f9c684f77bff0325976f76a4c634eb4dd76a81bdc42a990fd3d2065d',
            };

            const txentity = {
                updated_at: '2020-02-20T14:30:17.175Z',
                block_number: 36,
                created_at: '2020-02-20T14:30:17.175Z',
                confirmed: true,
                status: true,
                block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                contract_address: toAcceptedAddressFormat('0xea51bf51cdd20b0b7a65623992ecf516bb03a082'),
                cumulative_gas_used: '1007501',
                cumulative_gas_used_ln: 19.942349840032083,
                gas_used: '1007501',
                gas_used_ln: 19.942349840032083,
                gas_price: '7377634553',
                gas_price_ln: 32.78051118169717,
                from_: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                to_: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                transaction_index: 0,
                logs_bloom:
                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000000000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000041000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000000000000000c000000000000000000000800000000000000020000000000000000000000040000000000010000000060000000000000000000004000100000000000100000088000000004200000000000',
                logs: [
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                        log_index: 0,
                        removed: false,
                        topics: [
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_f109be91',
                    },
                    {
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        log_index: 1,
                        removed: false,
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_cfcd645b',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 2,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_0d71664c',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 3,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_f13c8af4',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 4,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_0f018f21',
                    },
                    {
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        log_index: 5,
                        removed: false,
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_68eb01d1',
                    },
                ],
            };

            const web3 = {
                eth: {
                    getTransactionReceipt: async (txhash: string): Promise<any> => txReceipt,
                    getTransaction: async (txhash: string): Promise<any> => txInfos,
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

            when(context.txsServiceMock.searchElastic(deepEqual(esquery))).thenResolve({
                error: null,
                response: esresponse as any,
            });

            when(context.web3ServiceMock.get()).thenResolve(web3);

            when(
                context.txsServiceMock.update(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                    deepEqual((txentity as any) as TxEntity),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.txsScheduler.transactionInitialization();

            verify(context.globalConfigServiceMock.search(deepEqual({ id: 'global' }))).called();
            verify(context.txsServiceMock.searchElastic(deepEqual(esquery))).called();
            verify(context.web3ServiceMock.get()).called();
            verify(
                context.txsServiceMock.update(
                    deepEqual({ transaction_hash: transactionHash }),
                    deepEqual((txentity as any) as TxEntity),
                ),
            ).called();
        });

        it('should initialize unconfirmed transaction', async function() {
            const globalConfig: Partial<GlobalEntity> = {
                id: 'global',
                block_number: 100,
                eth_eur_price: 10000,
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        confirmed: false,
                                    },
                                },
                                {
                                    term: {
                                        block_number: 0,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esresponse = {
                took: 3,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1.3566749,
                    hits: [
                        {
                            _index: 'ticket721_tx',
                            _type: 'tx',
                            _id: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                            _score: 1.3566749,
                            _source: {
                                updated_at: '2020-02-20T14:30:17.175Z',
                                block_number: 0,
                                created_at: '2020-02-20T14:30:17.175Z',
                                confirmed: false,
                                transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                            },
                        },
                    ],
                },
            };

            const transactionHash = '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16';

            const txReceipt = {
                transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                transactionIndex: 0,
                blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                blockNumber: 100,
                from: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                to: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                gasUsed: 1007501,
                cumulativeGasUsed: 1007501,
                contractAddress: null,
                logs: [
                    {
                        logIndex: 0,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                        topics: [
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                        ],
                        type: 'mined',
                        id: 'log_f109be91',
                    },
                    {
                        logIndex: 1,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        type: 'mined',
                        id: 'log_cfcd645b',
                    },
                    {
                        logIndex: 2,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                        ],
                        type: 'mined',
                        id: 'log_0d71664c',
                    },
                    {
                        logIndex: 3,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                        ],
                        type: 'mined',
                        id: 'log_f13c8af4',
                    },
                    {
                        logIndex: 4,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                        ],
                        type: 'mined',
                        id: 'log_0f018f21',
                    },
                    {
                        logIndex: 5,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        type: 'mined',
                        id: 'log_68eb01d1',
                    },
                ],
                status: true,
                logsBloom:
                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000000000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000041000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000000000000000c000000000000000000000800000000000000020000000000000000000000040000000000010000000060000000000000000000004000100000000000100000088000000004200000000000',
                v: '0x153f',
                r: '0x9a02c6a6e2d021e6dc5e168337e3fb8949f58e9bceadbaa6fdf0906489854409',
                s: '0x23bc2af5f9c684f77bff0325976f76a4c634eb4dd76a81bdc42a990fd3d2065d',
            };

            const txInfos = {
                hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                nonce: 3,
                blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                blockNumber: 100,
                transactionIndex: 0,
                from: '0xea51bF51CDd20b0b7a65623992eCf516bB03A082',
                to: '0x1eadac420E7599a355813e63E94250C3384Cc27d',
                value: '0',
                gas: 1016586,
                gasPrice: '7377634553',
                input:
                    '0x631a75a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000080451f0637800000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000040000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a80000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a80000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000564000000000000000000000000000000000000000000000000000000000000060959e904b58b6deea4146198f878f5b1576470b78eab9be3fe9f83a345ffa3d72557979f63903d6ec3c0689f321f3ba122f617c1f21b5ca27ee70617892f2efdec1cdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                v: '0x153f',
                r: '0x9a02c6a6e2d021e6dc5e168337e3fb8949f58e9bceadbaa6fdf0906489854409',
                s: '0x23bc2af5f9c684f77bff0325976f76a4c634eb4dd76a81bdc42a990fd3d2065d',
            };

            const txentity = {
                updated_at: '2020-02-20T14:30:17.175Z',
                block_number: 100,
                created_at: '2020-02-20T14:30:17.175Z',
                confirmed: false,
                status: true,
                block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                contract_address: null,
                cumulative_gas_used: '1007501',
                cumulative_gas_used_ln: 19.942349840032083,
                gas_used: '1007501',
                gas_used_ln: 19.942349840032083,
                gas_price: '7377634553',
                gas_price_ln: 32.78051118169717,
                from_: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                to_: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                transaction_index: 0,
                logs_bloom:
                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000000000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000041000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000000000000000c000000000000000000000800000000000000020000000000000000000000040000000000010000000060000000000000000000004000100000000000100000088000000004200000000000',
                logs: [
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                        log_index: 0,
                        removed: false,
                        topics: [
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_f109be91',
                    },
                    {
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        log_index: 1,
                        removed: false,
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_cfcd645b',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 2,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_0d71664c',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 3,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_f13c8af4',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 4,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_0f018f21',
                    },
                    {
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        log_index: 5,
                        removed: false,
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_68eb01d1',
                    },
                ],
            };

            const web3 = {
                eth: {
                    getTransactionReceipt: async (txhash: string): Promise<any> => txReceipt,
                    getTransaction: async (txhash: string): Promise<any> => txInfos,
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

            when(context.txsServiceMock.searchElastic(deepEqual(esquery))).thenResolve({
                error: null,
                response: esresponse as any,
            });

            when(context.web3ServiceMock.get()).thenResolve(web3);

            when(
                context.txsServiceMock.update(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                    deepEqual((txentity as any) as TxEntity),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.txsScheduler.transactionInitialization();

            verify(context.globalConfigServiceMock.search(deepEqual({ id: 'global' }))).called();
            verify(context.txsServiceMock.searchElastic(deepEqual(esquery))).called();
            verify(context.web3ServiceMock.get()).called();
            verify(
                context.txsServiceMock.update(
                    deepEqual({ transaction_hash: transactionHash }),
                    deepEqual((txentity as any) as TxEntity),
                ),
            ).called();
        });

        it('should not initialize as none is fetched', async function() {
            const globalConfig: Partial<GlobalEntity> = {
                id: 'global',
                block_number: 100,
                eth_eur_price: 10000,
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        confirmed: false,
                                    },
                                },
                                {
                                    term: {
                                        block_number: 0,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esresponse = {
                took: 3,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 0,
                    max_score: 1.3566749,
                    hits: [],
                },
            };

            const transactionHash = '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16';

            const txReceipt = {
                transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                transactionIndex: 0,
                blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                blockNumber: 36,
                from: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                to: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                gasUsed: 1007501,
                cumulativeGasUsed: 1007501,
                contractAddress: null,
                logs: [
                    {
                        logIndex: 0,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                        topics: [
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                        ],
                        type: 'mined',
                        id: 'log_f109be91',
                    },
                    {
                        logIndex: 1,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        type: 'mined',
                        id: 'log_cfcd645b',
                    },
                    {
                        logIndex: 2,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                        ],
                        type: 'mined',
                        id: 'log_0d71664c',
                    },
                    {
                        logIndex: 3,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                        ],
                        type: 'mined',
                        id: 'log_f13c8af4',
                    },
                    {
                        logIndex: 4,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                        ],
                        type: 'mined',
                        id: 'log_0f018f21',
                    },
                    {
                        logIndex: 5,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        type: 'mined',
                        id: 'log_68eb01d1',
                    },
                ],
                status: true,
                logsBloom:
                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000000000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000041000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000000000000000c000000000000000000000800000000000000020000000000000000000000040000000000010000000060000000000000000000004000100000000000100000088000000004200000000000',
                v: '0x153f',
                r: '0x9a02c6a6e2d021e6dc5e168337e3fb8949f58e9bceadbaa6fdf0906489854409',
                s: '0x23bc2af5f9c684f77bff0325976f76a4c634eb4dd76a81bdc42a990fd3d2065d',
            };

            const txInfos = {
                hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                nonce: 3,
                blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                blockNumber: 36,
                transactionIndex: 0,
                from: '0xea51bF51CDd20b0b7a65623992eCf516bB03A082',
                to: '0x1eadac420E7599a355813e63E94250C3384Cc27d',
                value: '0',
                gas: 1016586,
                gasPrice: '7377634553',
                input:
                    '0x631a75a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000080451f0637800000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000040000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a80000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a80000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000564000000000000000000000000000000000000000000000000000000000000060959e904b58b6deea4146198f878f5b1576470b78eab9be3fe9f83a345ffa3d72557979f63903d6ec3c0689f321f3ba122f617c1f21b5ca27ee70617892f2efdec1cdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                v: '0x153f',
                r: '0x9a02c6a6e2d021e6dc5e168337e3fb8949f58e9bceadbaa6fdf0906489854409',
                s: '0x23bc2af5f9c684f77bff0325976f76a4c634eb4dd76a81bdc42a990fd3d2065d',
            };

            const txentity = {
                updated_at: '2020-02-20T14:30:17.175Z',
                block_number: 36,
                created_at: '2020-02-20T14:30:17.175Z',
                confirmed: true,
                status: true,
                block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                contract_address: null,
                cumulative_gas_used: '1007501',
                cumulative_gas_used_ln: 19.942349840032083,
                gas_used: '1007501',
                gas_used_ln: 19.942349840032083,
                gas_price: '7377634553',
                gas_price_ln: 32.78051118169717,
                from_: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                to_: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                transaction_index: 0,
                logs_bloom:
                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000000000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000041000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000000000000000c000000000000000000000800000000000000020000000000000000000000040000000000010000000060000000000000000000004000100000000000100000088000000004200000000000',
                logs: [
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                        log_index: 0,
                        removed: false,
                        topics: [
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_f109be91',
                    },
                    {
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        log_index: 1,
                        removed: false,
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_cfcd645b',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 2,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_0d71664c',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 3,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_f13c8af4',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 4,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_0f018f21',
                    },
                    {
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        log_index: 5,
                        removed: false,
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_68eb01d1',
                    },
                ],
            };

            const web3 = {
                eth: {
                    getTransactionReceipt: async (txhash: string): Promise<any> => txReceipt,
                    getTransaction: async (txhash: string): Promise<any> => txInfos,
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

            when(context.txsServiceMock.searchElastic(deepEqual(esquery))).thenResolve({
                error: null,
                response: esresponse as any,
            });

            await context.txsScheduler.transactionInitialization();

            verify(context.globalConfigServiceMock.search(deepEqual({ id: 'global' }))).called();
            verify(context.txsServiceMock.searchElastic(deepEqual(esquery))).called();
        });

        it('should skip for null txReceipt', async function() {
            const globalConfig: Partial<GlobalEntity> = {
                id: 'global',
                block_number: 100,
                eth_eur_price: 10000,
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        confirmed: false,
                                    },
                                },
                                {
                                    term: {
                                        block_number: 0,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esresponse = {
                took: 3,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1.3566749,
                    hits: [
                        {
                            _index: 'ticket721_tx',
                            _type: 'tx',
                            _id: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                            _score: 1.3566749,
                            _source: {
                                updated_at: '2020-02-20T14:30:17.175Z',
                                block_number: 0,
                                created_at: '2020-02-20T14:30:17.175Z',
                                confirmed: false,
                                transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                            },
                        },
                    ],
                },
            };

            const transactionHash = '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16';

            const txReceipt = null;

            const txInfos = {
                hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                nonce: 3,
                blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                blockNumber: 36,
                transactionIndex: 0,
                from: '0xea51bF51CDd20b0b7a65623992eCf516bB03A082',
                to: '0x1eadac420E7599a355813e63E94250C3384Cc27d',
                value: '0',
                gas: 1016586,
                gasPrice: '7377634553',
                input:
                    '0x631a75a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000080451f0637800000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000040000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a80000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a80000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000564000000000000000000000000000000000000000000000000000000000000060959e904b58b6deea4146198f878f5b1576470b78eab9be3fe9f83a345ffa3d72557979f63903d6ec3c0689f321f3ba122f617c1f21b5ca27ee70617892f2efdec1cdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                v: '0x153f',
                r: '0x9a02c6a6e2d021e6dc5e168337e3fb8949f58e9bceadbaa6fdf0906489854409',
                s: '0x23bc2af5f9c684f77bff0325976f76a4c634eb4dd76a81bdc42a990fd3d2065d',
            };

            const txentity = {
                updated_at: '2020-02-20T14:30:17.175Z',
                block_number: 36,
                created_at: '2020-02-20T14:30:17.175Z',
                confirmed: true,
                status: true,
                block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                contract_address: null,
                cumulative_gas_used: '1007501',
                cumulative_gas_used_ln: 19.942349840032083,
                gas_used: '1007501',
                gas_used_ln: 19.942349840032083,
                gas_price: '7377634553',
                gas_price_ln: 32.78051118169717,
                from_: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                to_: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                transaction_index: 0,
                logs_bloom:
                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000000000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000041000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000000000000000c000000000000000000000800000000000000020000000000000000000000040000000000010000000060000000000000000000004000100000000000100000088000000004200000000000',
                logs: [
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                        log_index: 0,
                        removed: false,
                        topics: [
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_f109be91',
                    },
                    {
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        log_index: 1,
                        removed: false,
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_cfcd645b',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 2,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_0d71664c',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 3,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_f13c8af4',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 4,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_0f018f21',
                    },
                    {
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        log_index: 5,
                        removed: false,
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_68eb01d1',
                    },
                ],
            };

            const web3 = {
                eth: {
                    getTransactionReceipt: async (txhash: string): Promise<any> => txReceipt,
                    getTransaction: async (txhash: string): Promise<any> => txInfos,
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

            when(context.txsServiceMock.searchElastic(deepEqual(esquery))).thenResolve({
                error: null,
                response: esresponse as any,
            });

            when(context.web3ServiceMock.get()).thenResolve(web3);

            await context.txsScheduler.transactionInitialization();

            verify(context.globalConfigServiceMock.search(deepEqual({ id: 'global' }))).called();
            verify(context.txsServiceMock.searchElastic(deepEqual(esquery))).called();
            verify(context.web3ServiceMock.get()).called();
            verify(
                context.txsServiceMock.update(
                    deepEqual({ transaction_hash: transactionHash }),
                    deepEqual((txentity as any) as TxEntity),
                ),
            ).never();
        });

        it('should skip for null txInfos', async function() {
            const globalConfig: Partial<GlobalEntity> = {
                id: 'global',
                block_number: 100,
                eth_eur_price: 10000,
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        confirmed: false,
                                    },
                                },
                                {
                                    term: {
                                        block_number: 0,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esresponse = {
                took: 3,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1.3566749,
                    hits: [
                        {
                            _index: 'ticket721_tx',
                            _type: 'tx',
                            _id: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                            _score: 1.3566749,
                            _source: {
                                updated_at: '2020-02-20T14:30:17.175Z',
                                block_number: 0,
                                created_at: '2020-02-20T14:30:17.175Z',
                                confirmed: false,
                                transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                            },
                        },
                    ],
                },
            };

            const transactionHash = '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16';

            const txReceipt = {
                transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                transactionIndex: 0,
                blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                blockNumber: 36,
                from: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                to: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                gasUsed: 1007501,
                cumulativeGasUsed: 1007501,
                contractAddress: null,
                logs: [
                    {
                        logIndex: 0,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                        topics: [
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                        ],
                        type: 'mined',
                        id: 'log_f109be91',
                    },
                    {
                        logIndex: 1,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        type: 'mined',
                        id: 'log_cfcd645b',
                    },
                    {
                        logIndex: 2,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                        ],
                        type: 'mined',
                        id: 'log_0d71664c',
                    },
                    {
                        logIndex: 3,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                        ],
                        type: 'mined',
                        id: 'log_f13c8af4',
                    },
                    {
                        logIndex: 4,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                        ],
                        type: 'mined',
                        id: 'log_0f018f21',
                    },
                    {
                        logIndex: 5,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        type: 'mined',
                        id: 'log_68eb01d1',
                    },
                ],
                status: true,
                logsBloom:
                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000000000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000041000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000000000000000c000000000000000000000800000000000000020000000000000000000000040000000000010000000060000000000000000000004000100000000000100000088000000004200000000000',
                v: '0x153f',
                r: '0x9a02c6a6e2d021e6dc5e168337e3fb8949f58e9bceadbaa6fdf0906489854409',
                s: '0x23bc2af5f9c684f77bff0325976f76a4c634eb4dd76a81bdc42a990fd3d2065d',
            };

            const txInfos = null;

            const txentity = {
                updated_at: '2020-02-20T14:30:17.175Z',
                block_number: 36,
                created_at: '2020-02-20T14:30:17.175Z',
                confirmed: true,
                status: true,
                block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                contract_address: null,
                cumulative_gas_used: '1007501',
                cumulative_gas_used_ln: 19.942349840032083,
                gas_used: '1007501',
                gas_used_ln: 19.942349840032083,
                gas_price: '7377634553',
                gas_price_ln: 32.78051118169717,
                from_: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                to_: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                transaction_index: 0,
                logs_bloom:
                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000000000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000041000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000000000000000c000000000000000000000800000000000000020000000000000000000000040000000000010000000060000000000000000000004000100000000000100000088000000004200000000000',
                logs: [
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                        log_index: 0,
                        removed: false,
                        topics: [
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_f109be91',
                    },
                    {
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        log_index: 1,
                        removed: false,
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_cfcd645b',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 2,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_0d71664c',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 3,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_f13c8af4',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 4,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_0f018f21',
                    },
                    {
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        log_index: 5,
                        removed: false,
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_68eb01d1',
                    },
                ],
            };

            const web3 = {
                eth: {
                    getTransactionReceipt: async (txhash: string): Promise<any> => txReceipt,
                    getTransaction: async (txhash: string): Promise<any> => txInfos,
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

            when(context.txsServiceMock.searchElastic(deepEqual(esquery))).thenResolve({
                error: null,
                response: esresponse as any,
            });

            when(context.web3ServiceMock.get()).thenResolve(web3);

            await context.txsScheduler.transactionInitialization();

            verify(context.globalConfigServiceMock.search(deepEqual({ id: 'global' }))).called();
            verify(context.txsServiceMock.searchElastic(deepEqual(esquery))).called();
            verify(context.web3ServiceMock.get()).called();
            verify(
                context.txsServiceMock.update(
                    deepEqual({ transaction_hash: transactionHash }),
                    deepEqual((txentity as any) as TxEntity),
                ),
            ).never();
        });

        it('should fail on global config fetch error', async function() {
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

            await context.txsScheduler.transactionInitialization();

            verify(context.globalConfigServiceMock.search(deepEqual({ id: 'global' }))).called();
            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new Error('TxsScheduler::transactionInitialization unable to recover global config')),
                ),
            ).called();
        });

        it('should fail on empty global config', async function() {
            when(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            await context.txsScheduler.transactionInitialization();

            verify(context.globalConfigServiceMock.search(deepEqual({ id: 'global' }))).called();
            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(new Error('TxsScheduler::transactionInitialization unable to recover global config')),
                ),
            ).called();
        });

        it('should fail on pending tx error', async function() {
            const globalConfig: Partial<GlobalEntity> = {
                id: 'global',
                block_number: 100,
                eth_eur_price: 10000,
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        confirmed: false,
                                    },
                                },
                                {
                                    term: {
                                        block_number: 0,
                                    },
                                },
                            ],
                        },
                    },
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

            when(context.txsServiceMock.searchElastic(deepEqual(esquery))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await context.txsScheduler.transactionInitialization();

            verify(context.globalConfigServiceMock.search(deepEqual({ id: 'global' }))).called();
            verify(context.txsServiceMock.searchElastic(deepEqual(esquery))).called();
            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(
                        new Error('TxsScheduler::transactionInitialization error while fetching txs: unexpected_error'),
                    ),
                ),
            ).called();
        });

        it('should fail on tx update error', async function() {
            const globalConfig: Partial<GlobalEntity> = {
                id: 'global',
                block_number: 100,
                eth_eur_price: 10000,
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        confirmed: false,
                                    },
                                },
                                {
                                    term: {
                                        block_number: 0,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const esresponse = {
                took: 3,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1.3566749,
                    hits: [
                        {
                            _index: 'ticket721_tx',
                            _type: 'tx',
                            _id: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                            _score: 1.3566749,
                            _source: {
                                updated_at: '2020-02-20T14:30:17.175Z',
                                block_number: 0,
                                created_at: '2020-02-20T14:30:17.175Z',
                                confirmed: false,
                                transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                            },
                        },
                    ],
                },
            };

            const transactionHash = '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16';

            const txReceipt = {
                transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                transactionIndex: 0,
                blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                blockNumber: 36,
                from: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                to: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                gasUsed: 1007501,
                cumulativeGasUsed: 1007501,
                contractAddress: null,
                logs: [
                    {
                        logIndex: 0,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                        topics: [
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                        ],
                        type: 'mined',
                        id: 'log_f109be91',
                    },
                    {
                        logIndex: 1,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        type: 'mined',
                        id: 'log_cfcd645b',
                    },
                    {
                        logIndex: 2,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                        ],
                        type: 'mined',
                        id: 'log_0d71664c',
                    },
                    {
                        logIndex: 3,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                        ],
                        type: 'mined',
                        id: 'log_f13c8af4',
                    },
                    {
                        logIndex: 4,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        data: '0x',
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                        ],
                        type: 'mined',
                        id: 'log_0f018f21',
                    },
                    {
                        logIndex: 5,
                        transactionIndex: 0,
                        transactionHash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        blockNumber: 36,
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        type: 'mined',
                        id: 'log_68eb01d1',
                    },
                ],
                status: true,
                logsBloom:
                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000000000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000041000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000000000000000c000000000000000000000800000000000000020000000000000000000000040000000000010000000060000000000000000000004000100000000000100000088000000004200000000000',
                v: '0x153f',
                r: '0x9a02c6a6e2d021e6dc5e168337e3fb8949f58e9bceadbaa6fdf0906489854409',
                s: '0x23bc2af5f9c684f77bff0325976f76a4c634eb4dd76a81bdc42a990fd3d2065d',
            };

            const txInfos = {
                hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                nonce: 3,
                blockHash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                blockNumber: 36,
                transactionIndex: 0,
                from: '0xea51bF51CDd20b0b7a65623992eCf516bB03A082',
                to: '0x1eadac420E7599a355813e63E94250C3384Cc27d',
                value: '0',
                gas: 1016586,
                gasPrice: '7377634553',
                input:
                    '0x631a75a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000080451f0637800000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000000040000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a80000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a80000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000564000000000000000000000000000000000000000000000000000000000000060959e904b58b6deea4146198f878f5b1576470b78eab9be3fe9f83a345ffa3d72557979f63903d6ec3c0689f321f3ba122f617c1f21b5ca27ee70617892f2efdec1cdc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                v: '0x153f',
                r: '0x9a02c6a6e2d021e6dc5e168337e3fb8949f58e9bceadbaa6fdf0906489854409',
                s: '0x23bc2af5f9c684f77bff0325976f76a4c634eb4dd76a81bdc42a990fd3d2065d',
            };

            const txentity = {
                updated_at: '2020-02-20T14:30:17.175Z',
                block_number: 36,
                created_at: '2020-02-20T14:30:17.175Z',
                confirmed: true,
                status: true,
                block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                contract_address: null,
                cumulative_gas_used: '1007501',
                cumulative_gas_used_ln: 19.942349840032083,
                gas_used: '1007501',
                gas_used_ln: 19.942349840032083,
                gas_price: '7377634553',
                gas_price_ln: 32.78051118169717,
                from_: '0xea51bf51cdd20b0b7a65623992ecf516bb03a082',
                to_: '0x1eadac420e7599a355813e63e94250c3384cc27d',
                transaction_index: 0,
                logs_bloom:
                    '0x2400000000800000000000000004000000000000000000040000400000000800000000000000000080010008000000000200010000000000000000002004000000000000000000040000000000000000000004000204020001000000041000000000000002000000000000000000480000000000000000800000000000000000000000000000000000000000000000000000400000000000100000000000000000000000000000000000210000000000000000000c000000000000000000000800000000000000020000000000000000000000040000000000010000000060000000000000000000004000100000000000100000088000000004200000000000',
                logs: [
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                        log_index: 0,
                        removed: false,
                        topics: [
                            '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x0000000000000000000000000cf540a5a6706bc5f24850a8d0778b499fa8700a',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_f109be91',
                    },
                    {
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000064dc2ddcae0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c657300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        log_index: 1,
                        removed: false,
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_cfcd645b',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 2,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x7669705f30000000000000000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000000',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_0d71664c',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 3,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f305f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000001',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_f13c8af4',
                    },
                    {
                        address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data: '0x',
                        log_index: 4,
                        removed: false,
                        topics: [
                            '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                            '0x7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff2',
                            '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                            '0x0000000000000000000000000000000000000000000000000000000000000002',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_0f018f21',
                    },
                    {
                        address: '0x0CF540A5A6706Bc5f24850A8D0778b499fa8700A',
                        block_hash: '0x0c79d5ba34bb38575e461e2c7548fd781dc2e6e798cfadf7341aa5e77aea12e1',
                        block_number: 36,
                        data:
                            '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000564a032c39b7126ab478a23e1939b58ab5563402d0a5e049f8bc6d82e21610a8be04165eff200000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000340000000000000000000000000000000000000000000000000000000000000048000000000000000000000000000000000000000000000000000000000000000150000000000000000000000000000000000000000000000000000000000000064000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb610000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000006400000000000000000000000000000000000000000000000000000000000000c8000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000005e4ea601000000000000000000000000000000000000000000000000000000005e4fdb61000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000009000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000f58b2e4ffad546a13f52faeaafb042da4eacc5a5000000000000000000000000813a9cdaa69b617baa5f220686670b42c6af9edd00000000000000000000000000000000000000000000000000000000000000067669705f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f305f300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000726567756c61725f315f30000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                        log_index: 5,
                        removed: false,
                        topics: [
                            '0xfc26c44ef96b638dd492a334e3a8c80bc855564f135022728462e9078ddd9d87',
                            '0x0000000000000000000000004b2ef35de91d5e4f2941b8a9b0b9e35554f0d8a8',
                            '0x0000000000000000000000001eadac420e7599a355813e63e94250c3384cc27d',
                        ],
                        transaction_hash: '0xa6fac51ba2f29aa909077e27d6ec07584c39280835ab042bd0db7da0db41cc16',
                        transaction_index: 0,
                        id: 'log_68eb01d1',
                    },
                ],
            };

            const web3 = {
                eth: {
                    getTransactionReceipt: async (txhash: string): Promise<any> => txReceipt,
                    getTransaction: async (txhash: string): Promise<any> => txInfos,
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

            when(context.txsServiceMock.searchElastic(deepEqual(esquery))).thenResolve({
                error: null,
                response: esresponse as any,
            });

            when(context.web3ServiceMock.get()).thenResolve(web3);

            when(
                context.txsServiceMock.update(
                    deepEqual({
                        transaction_hash: transactionHash,
                    }),
                    deepEqual((txentity as any) as TxEntity),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await context.txsScheduler.transactionInitialization();

            verify(context.globalConfigServiceMock.search(deepEqual({ id: 'global' }))).called();
            verify(context.txsServiceMock.searchElastic(deepEqual(esquery))).called();
            verify(context.web3ServiceMock.get()).called();
            verify(
                context.txsServiceMock.update(
                    deepEqual({ transaction_hash: transactionHash }),
                    deepEqual((txentity as any) as TxEntity),
                ),
            ).called();
            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(
                        new Error('TxsScheduler::transactionInitialization error while updating tx: unexpected_error'),
                    ),
                ),
            ).called();
        });
    });
});
