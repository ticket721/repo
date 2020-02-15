import { DynamicModule, Module } from '@nestjs/common';
import { TxsService, TxsServiceOptions } from '@lib/common/txs/Txs.service';
import { ExpressCassandraModule } from '@iaminfinity/express-cassandra';
import { TxEntity } from '@lib/common/txs/entities/Tx.entity';
import { TxsRepository } from '@lib/common/txs/Txs.repository';
import { ScheduleModule } from 'nest-schedule';
import { TxsScheduler } from '@lib/common/txs/Txs.scheduler';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';

/**
 * Build options for the Txs Module
 */
export interface TxsModuleAsyncOptions extends Pick<DynamicModule, 'imports'> {
    /**
     * Factory to inject Txs Service options
     * @param args
     */
    useFactory: (
        ...args: any[]
    ) => Promise<TxsServiceOptions> | TxsServiceOptions;

    /**
     * Providers to inject into factory
     */
    inject?: any[];
}

/**
 * Txs Module
 */
@Module({})
export class TxsModule {
    /**
     * Static async module creation
     *
     * @param options
     */
    static registerAsync(options: TxsModuleAsyncOptions): DynamicModule {
        return {
            module: TxsModule,
            imports: [
                ...options.imports,
                ExpressCassandraModule.forFeature([TxEntity, TxsRepository]),
                ScheduleModule.register(),
            ],
            providers: [
                {
                    provide: 'TXS_MODULE_OPTIONS',
                    useFactory: options.useFactory,
                    inject: options.inject,
                },
                TxsService,
                TxsScheduler,
                {
                    provide: WinstonLoggerService,
                    useValue: new WinstonLoggerService('txs'),
                },
            ],
            exports: [TxsService],
        };
    }
}
