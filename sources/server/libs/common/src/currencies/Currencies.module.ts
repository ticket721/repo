import { DynamicModule, Module } from '@nestjs/common';
import { FSModule } from '@lib/common/fs/FS.module';
import { CurrenciesService } from '@lib/common/currencies/Currencies.service';

/**
 * Build options for the Currencies Module
 */
export interface CurrenciesModuleAsyncOptions
    extends Pick<DynamicModule, 'imports'> {
    /**
     * Factory to inject Currencies Service options
     * @param args
     */
    useFactory: (...args: any[]) => Promise<string> | string;

    /**
     * Providers to inject into factory
     */
    inject?: any[];
}

@Module({})
export class CurrenciesModule {
    /**
     * Static async module creation
     *
     * @param options
     */
    static registerAsync(options: CurrenciesModuleAsyncOptions): DynamicModule {
        return {
            module: CurrenciesModule,
            imports: [...options.imports, FSModule],
            providers: [
                {
                    provide: 'CURRENCIES_MODULE_OPTIONS',
                    useFactory: options.useFactory,
                    inject: options.inject,
                },
                CurrenciesService,
            ],
            exports: [CurrenciesService],
        };
    }
}
