import { DynamicModule, Global, Module } from '@nestjs/common';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import {
    VaultereumOptions,
    VaultereumService,
} from '@lib/common/vaultereum/Vaultereum.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';

/**
 * Build options for the Vaultereum Module
 */
export interface VaultereumModuleAsyncOptions
    extends Pick<DynamicModule, 'imports'> {
    /**
     * Factory to inject Vaultereum Service options
     * @param args
     */
    useFactory: (
        ...args: any[]
    ) => Promise<VaultereumOptions> | VaultereumOptions;

    /**
     * Providers to inject into factory
     */
    inject?: any[];
}

/**
 * Vaultereum Module
 */
@Global()
@Module({})
export class VaultereumModule {
    /**
     * Static async module creation
     *
     * @param options
     */
    static registerAsync(options: VaultereumModuleAsyncOptions): DynamicModule {
        return {
            module: VaultereumModule,
            imports: [...(options.imports ? options.imports : [])],
            providers: [
                {
                    provide: 'VAULTEREUM_MODULE_OPTIONS',
                    useFactory: options.useFactory,
                    inject: options.inject,
                },
                VaultereumService,
                {
                    provide: WinstonLoggerService,
                    useValue: new WinstonLoggerService('vaultereum'),
                },
                ShutdownService,
            ],
            exports: [VaultereumService],
        };
    }
}
