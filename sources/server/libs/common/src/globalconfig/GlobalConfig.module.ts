import { DynamicModule, Global, Module } from '@nestjs/common';
import {
    GlobalConfigOptions,
    GlobalConfigService,
} from '@lib/common/globalconfig/GlobalConfig.service';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { ScheduleModule } from 'nest-schedule';
import { GlobalEntity } from '@lib/common/globalconfig/entities/Global.entity';
import { GlobalConfigRepository } from '@lib/common/globalconfig/GlobalConfig.repository';
import { GlobalConfigScheduler } from '@lib/common/globalconfig/GlobalConfig.scheduler';

/**
 * Build options for the Contracts Module
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

@Global()
@Module({})
export class GlobalConfigModule {
    static registerAsync(
        options: GlobalConfigModuleAsyncOptions,
    ): DynamicModule {
        return {
            module: GlobalConfigModule,
            imports: [
                ...options.imports,
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
                GlobalConfigScheduler,
            ],
            exports: [GlobalConfigService],
        };
    }
}
