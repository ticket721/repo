import { GlobalConfigScheduler } from '@lib/common/globalconfig/GlobalConfig.scheduler';
import { Web3Service } from '@lib/common/web3/Web3.service';
import {
    GlobalConfigOptions,
    GlobalConfigService,
} from '@lib/common/globalconfig/GlobalConfig.service';
import { Schedule } from 'nest-schedule';
import { BinanceService } from '@lib/common/binance/Binance.service';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';

describe('GlobalConfig Scheduler', function() {
    const context: {
        globalConfigScheduler: GlobalConfigScheduler;
        web3ServiceMock: Web3Service;
        globalConfigServiceMock: GlobalConfigService;
        shutdownServiceMock: ShutdownService;
        globalConfigScheduleMock: Schedule;
        globalConfigOptionsMock: GlobalConfigOptions;
        binanceServiceMock: BinanceService;
    } = {
        globalConfigScheduler: null,
        web3ServiceMock: null,
        globalConfigServiceMock: null,
        shutdownServiceMock: null,
        globalConfigScheduleMock: null,
        globalConfigOptionsMock: null,
        binanceServiceMock: null,
    };

    beforeAll(async function() {
        context.web3ServiceMock = mock(Web3Service);
        context.globalConfigServiceMock = mock(GlobalConfigService);
        context.globalConfigScheduleMock = mock(Schedule);
        context.shutdownServiceMock = mock(ShutdownService);
        context.globalConfigOptionsMock = {
            blockNumberFetchingRate: 1000,
            ethereumPriceFetchingRate: 1000,
        };
        context.binanceServiceMock = mock(BinanceService);

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
                    provide: GlobalConfigScheduler,
                    useValue: instance(context.globalConfigScheduleMock),
                },
                {
                    provide: 'GLOBAL_CONFIG_MODULE_OPTIONS',
                    useValue: context.globalConfigOptionsMock,
                },
                {
                    provide: 'NEST_SCHEDULE_PROVIDER',
                    useValue: context.globalConfigScheduleMock,
                },
                {
                    provide: BinanceService,
                    useValue: instance(context.binanceServiceMock),
                },
                GlobalConfigScheduler,
            ],
        }).compile();

        context.globalConfigScheduler = app.get<GlobalConfigScheduler>(
            GlobalConfigScheduler,
        );
    });

    describe('fetchETHEURPrice', function() {
        it('should fetch the price and update the global config', async function() {
            when(context.binanceServiceMock.getETHEURPrice()).thenResolve({
                error: null,
                response: 10000,
            });

            when(
                context.globalConfigServiceMock.update(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        eth_eur_price: 10000,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.globalConfigScheduler.fetchETHEURPrice();

            verify(context.binanceServiceMock.getETHEURPrice()).called();

            verify(
                context.globalConfigServiceMock.update(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        eth_eur_price: 10000,
                    }),
                ),
            ).called();
        });

        it('should intercept price fetching error', async function() {
            when(context.binanceServiceMock.getETHEURPrice()).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await context.globalConfigScheduler.fetchETHEURPrice();

            verify(context.binanceServiceMock.getETHEURPrice()).called();
        });
    });

    describe('fetchBlockNumber', function() {
        it('should properly fetch last ethereum block number and update the global config', async function() {
            const created_at = new Date(Date.now());
            const updated_at = new Date(Date.now());
            const eth_eur_price = 1000;
            const block_number = 999;
            const id = 'global';

            const web3 = {
                eth: {
                    getBlockNumber: async (): Promise<number> => 1000,
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
                response: [
                    {
                        created_at,
                        updated_at,
                        eth_eur_price,
                        block_number,
                        id,
                    },
                ],
            });

            when(context.web3ServiceMock.get()).thenResolve(web3);

            when(
                context.globalConfigServiceMock.update(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        block_number: 1000,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.globalConfigScheduler.fetchBlockNumber();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(context.web3ServiceMock.get()).called();

            verify(
                context.globalConfigServiceMock.update(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        block_number: 1000,
                    }),
                ),
            ).called();
        });

        it('should properly fetch last ethereum block number and not update the global config', async function() {
            const created_at = new Date(Date.now());
            const updated_at = new Date(Date.now());
            const eth_eur_price = 1000;
            const block_number = 999;
            const id = 'global';

            const web3 = {
                eth: {
                    getBlockNumber: async (): Promise<number> => 998,
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
                response: [
                    {
                        created_at,
                        updated_at,
                        eth_eur_price,
                        block_number,
                        id,
                    },
                ],
            });

            when(context.web3ServiceMock.get()).thenResolve(web3);

            await context.globalConfigScheduler.fetchBlockNumber();

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(context.web3ServiceMock.get()).called();

            verify(
                context.globalConfigServiceMock.update(
                    deepEqual({
                        id: 'global',
                    }),
                    deepEqual({
                        block_number: 998,
                    }),
                ),
            ).never();
        });

        it('should fail fetching block number', async function() {
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

            when(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(
                        new Error(
                            'GlobalConfigScheduler::global_document_fetch_error',
                        ),
                    ),
                ),
            ).thenReturn();

            await expect(
                context.globalConfigScheduler.fetchBlockNumber(),
            ).rejects.toEqual(
                new Error('GlobalConfigScheduler::global_document_fetch_error'),
            );

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(
                        new Error(
                            'GlobalConfigScheduler::global_document_fetch_error',
                        ),
                    ),
                ),
            ).called();
        });

        it('should fail fetching no results', async function() {
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

            when(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(
                        new Error(
                            'GlobalConfigScheduler::global_document_fetch_error',
                        ),
                    ),
                ),
            ).thenReturn();

            await expect(
                context.globalConfigScheduler.fetchBlockNumber(),
            ).rejects.toEqual(
                new Error('GlobalConfigScheduler::global_document_fetch_error'),
            );

            verify(
                context.globalConfigServiceMock.search(
                    deepEqual({
                        id: 'global',
                    }),
                ),
            ).called();

            verify(
                context.shutdownServiceMock.shutdownWithError(
                    deepEqual(
                        new Error(
                            'GlobalConfigScheduler::global_document_fetch_error',
                        ),
                    ),
                ),
            ).called();
        });
    });
});
