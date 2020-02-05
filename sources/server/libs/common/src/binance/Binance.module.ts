import { DynamicModule, Global, Module } from '@nestjs/common';
import { BinanceService } from '@lib/common/binance/Binance.service';

export interface BinanceModuleBuildOptions {
    mock: boolean;
}

/**
 * Build options for the Currencies Module
 */
export interface BinanceModuleAsyncOptions
    extends Pick<DynamicModule, 'imports'> {
    /**
     * Factory to inject Currencies Service options
     * @param args
     */
    useFactory: (
        ...args: any[]
    ) => Promise<BinanceModuleBuildOptions> | BinanceModuleBuildOptions;

    /**
     * Providers to inject into factory
     */
    inject?: any[];
}

@Global()
@Module({})
export class BinanceModule {
    static registerAsync(options: BinanceModuleAsyncOptions): DynamicModule {
        return {
            module: BinanceModule,
            imports: [...options.imports],
            providers: [
                {
                    provide: 'BINANCE_MODULE_OPTIONS',
                    useFactory: options.useFactory,
                    inject: options.inject,
                },
                BinanceService,
            ],
            exports: [BinanceService],
        };
    }
}
