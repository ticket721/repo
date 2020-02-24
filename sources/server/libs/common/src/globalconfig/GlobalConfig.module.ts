import { DynamicModule, Global, Module } from '@nestjs/common';
import {
    GlobalConfigOptions,
    GlobalConfigService,
} from '@lib/common/globalconfig/GlobalConfig.service';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { ScheduleModule } from 'nest-schedule';
import { GlobalEntity } from '@lib/common/globalconfig/entities/Global.entity';
import { GlobalConfigRepository } from '@lib/common/globalconfig/GlobalConfig.repository';

/**
 * Build options for the GlobalConfig Module
 */
export interface GlobalConfigModuleAsyncOptions
    extends Pick<DynamicModule, 'imports'> {
    /**
     * Factory to inject GlobalConfig Service options
     * @param args
     */
    useFactory: (
        ...args: any[]
    ) => Promise<GlobalConfigOptions> | GlobalConfigOptions;

    /**
     * Providers to inject into factory
     */
    inject?: any[];
}

/**
 * GlobalConfig Module
 */
@Global()
@Module({})
export class GlobalConfigModule {
    /**
     * Async Builder
     *
     * @param options
     */
    static registerAsync(
        options: GlobalConfigModuleAsyncOptions,
    ): DynamicModule {
        return {
            module: GlobalConfigModule,
            imports: [
                ...(options.imports ? options.imports : []),
                ExpressCassandraModule.forFeature([
                    GlobalEntity,
                    GlobalConfigRepository,
                ]),
                ScheduleModule.register(),
            ],
            providers: [
                {
                    provide: 'GLOBAL_CONFIG_MODULE_OPTIONS',
                    useFactory: options.useFactory,
                    inject: options.inject,
                },
                GlobalConfigService,
            ],
            exports: [GlobalConfigService, 'GLOBAL_CONFIG_MODULE_OPTIONS'],
        };
    }
}
