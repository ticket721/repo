import { BinanceService } from '@lib/common/binance/Binance.service';
import { BinanceModuleBuildOptions } from '@lib/common/binance/Binance.module';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import { TxsService } from '@lib/common/txs/Txs.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { ContractsService } from '@lib/common/contracts/Contracts.service';
import { TxsController } from '@app/server/controllers/txs/Txs.controller';
import { NestError } from '@lib/common/utils/NestError';

class BinanceSDKMock {
    async avgPrice(arg: any): Promise<any> {
        return null;
    }
}

describe('Binance Service', function() {
    describe('Mock Mode OFF', function() {
        const context: {
            binanceService: BinanceService;
            binanceModuleOptionsMock: BinanceModuleBuildOptions;
            binanceInstanceMock: BinanceSDKMock;
        } = {
            binanceService: null,
            binanceModuleOptionsMock: null,
            binanceInstanceMock: null,
        };

        beforeAll(async function() {
            context.binanceModuleOptionsMock = {
                mock: false,
            };

            context.binanceInstanceMock = mock(BinanceSDKMock);

            const app: TestingModule = await Test.createTestingModule({
                providers: [
                    {
                        provide: 'BINANCE_MODULE_OPTIONS',
                        useValue: context.binanceModuleOptionsMock,
                    },
                    {
                        provide: 'BINANCE_INSTANCE',
                        useValue: instance(context.binanceInstanceMock),
                    },
                    BinanceService,
                ],
            }).compile();

            context.binanceService = app.get<BinanceService>(BinanceService);
        });

        describe('getETHEURPrice', function() {
            it('should get ETHEUR price', async function() {
                when(
                    context.binanceInstanceMock.avgPrice(
                        deepEqual({
                            symbol: 'ETHEUR',
                        }),
                    ),
                ).thenResolve({
                    price: 100.55,
                });

                const res = await context.binanceService.getETHEURPrice();

                expect(res.error).toEqual(null);
                expect(res.response).toEqual(10055);

                verify(
                    context.binanceInstanceMock.avgPrice(
                        deepEqual({
                            symbol: 'ETHEUR',
                        }),
                    ),
                ).called();
            });

            it('should fail fetching price', async function() {
                when(
                    context.binanceInstanceMock.avgPrice(
                        deepEqual({
                            symbol: 'ETHEUR',
                        }),
                    ),
                ).thenReject(new NestError('Unable to fetch from binance'));

                const res = await context.binanceService.getETHEURPrice();

                expect(res.error).toEqual('fetch_error');
                expect(res.response).toEqual(null);

                verify(
                    context.binanceInstanceMock.avgPrice(
                        deepEqual({
                            symbol: 'ETHEUR',
                        }),
                    ),
                ).called();
            });
        });
    });

    describe('Mock Mode ON', function() {
        const context: {
            binanceService: BinanceService;
            binanceModuleOptionsMock: BinanceModuleBuildOptions;
            binanceInstanceMock: BinanceSDKMock;
        } = {
            binanceService: null,
            binanceModuleOptionsMock: null,
            binanceInstanceMock: null,
        };

        beforeAll(async function() {
            context.binanceModuleOptionsMock = {
                mock: true,
            };

            context.binanceInstanceMock = mock(BinanceSDKMock);

            const app: TestingModule = await Test.createTestingModule({
                providers: [
                    {
                        provide: 'BINANCE_MODULE_OPTIONS',
                        useValue: context.binanceModuleOptionsMock,
                    },
                    {
                        provide: 'BINANCE_INSTANCE',
                        useValue: instance(context.binanceInstanceMock),
                    },
                    BinanceService,
                ],
            }).compile();

            context.binanceService = app.get<BinanceService>(BinanceService);
        });

        describe('getETHEURPrice', function() {
            it('should get ETHEUR price', async function() {
                const res = await context.binanceService.getETHEURPrice();

                expect(res.error).toEqual(null);
                expect(res.response).toEqual(20000);

                verify(
                    context.binanceInstanceMock.avgPrice(
                        deepEqual({
                            symbol: 'ETHEUR',
                        }),
                    ),
                ).never();
            });
        });
    });
});
