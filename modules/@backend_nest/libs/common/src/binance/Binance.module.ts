import { DynamicModule, Global, Module } from '@nestjs/common';
import { BinanceService } from '@lib/common/binance/Binance.service';
import Binance from 'binance-api-node';

/**
 * Build Options to configure the Binance Module
 */
export interface BinanceModuleBuildOptions {
    /**
     * Flag that is valid if not real queries should be performed
     */
    mock: boolean;
}

/**
 * Build options for the Binance Module
 */
export interface BinanceModuleAsyncOptions extends Pick<DynamicModule, 'imports'> {
    /**
     * Factory to inject Binance Service options
     * @param args
     */
    useFactory: (...args: any[]) => Promise<BinanceModuleBuildOptions> | BinanceModuleBuildOptions;

    /**
     * Providers to inject into factory
     */
    inject?: any[];
}

/**
 * Binance Service to fetch Ethereum Price
 */
@Global()
@Module({})
export class BinanceModule {
    /**
     * Async Builder
     * @param options
     */
    static registerAsync(options: BinanceModuleAsyncOptions): DynamicModule {
        return {
            module: BinanceModule,
            imports: [...(options.imports ? options.imports : [])],
            providers: [
                {
                    provide: 'BINANCE_MODULE_OPTIONS',
                    useFactory: options.useFactory,
                    inject: options.inject,
                },
                {
                    provide: 'BINANCE_INSTANCE',
                    useValue: Binance(),
                },
                BinanceService,
            ],
            exports: [BinanceService],
        };
    }
}
