import { Inject, Injectable } from '@nestjs/common';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse';
import { BinanceModuleBuildOptions } from '@lib/common/binance/Binance.module';
import Binance from 'binance-api-node';

/**
 * Service to use the Binance API to recover the Ethereum Price
 */
@Injectable()
export class BinanceService {
    /**
     * Binance API Client instance
     */
    private readonly binanceInstance = null;

    /**
     * Dependency Injection
     *
     * @param binanceOptions
     */
    constructor(
        @Inject('BINANCE_MODULE_OPTIONS')
        private readonly binanceOptions: BinanceModuleBuildOptions,
    ) {
        if (!binanceOptions.mock) {
            this.binanceInstance = Binance();
        }
    }

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
            const bprice = await this.binanceInstance.avgPrice({
                symbol: 'ETHEUR',
            });
            const decimal = parseFloat(bprice.price);
            const final = Math.floor(decimal * 100);

            return {
                error: null,
                response: final,
            };
        }
    }
}
