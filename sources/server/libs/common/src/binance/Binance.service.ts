import { Inject, Injectable } from '@nestjs/common';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse';
import { BinanceModuleBuildOptions } from '@lib/common/binance/Binance.module';
import Binance from 'binance-api-node';

@Injectable()
export class BinanceService {
    private readonly binanceInstance = null;

    constructor(
        @Inject('BINANCE_MODULE_OPTIONS')
        private readonly binanceOptions: BinanceModuleBuildOptions,
    ) {
        if (!binanceOptions.mock) {
            this.binanceInstance = Binance();
        }
    }

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
