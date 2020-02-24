import { Inject, Injectable } from '@nestjs/common';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse';
import { BinanceModuleBuildOptions } from '@lib/common/binance/Binance.module';

/**
 * Service to use the Binance API to recover the Ethereum Price
 */
@Injectable()
export class BinanceService {
    /**
     * Dependency Injection
     *
     * @param binanceOptions
     * @param binanceInstance
     */
    constructor(
        @Inject('BINANCE_MODULE_OPTIONS')
        private readonly binanceOptions: BinanceModuleBuildOptions,
        @Inject('BINANCE_INSTANCE')
        private readonly binanceInstance: any,
    ) {}

    /**
     * Method to fetch the latest ETH/EUR price
     */
    async getETHEURPrice(): Promise<ServiceResponse<number>> {
        if (this.binanceOptions.mock) {
            return {
                error: null,
                response: 20000,
            };
        } else {
            try {
                const bprice = await this.binanceInstance.avgPrice({
                    symbol: 'ETHEUR',
                });
                const decimal = parseFloat(bprice.price);
                const final = Math.floor(decimal * 100);

                return {
                    error: null,
                    response: final,
                };
            } catch (e) {
                return {
                    error: 'fetch_error',
                    response: null,
                };
            }
        }
    }
}
