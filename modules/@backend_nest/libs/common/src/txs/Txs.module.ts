import { DynamicModule, Module }         from '@nestjs/common';
import { TxsService, TxsServiceOptions } from '@lib/common/txs/Txs.service';
import { ExpressCassandraModule }        from '@iaminfinity/express-cassandra';
import { TxEntity }                      from '@lib/common/txs/entities/Tx.entity';
import { TxsRepository }                 from '@lib/common/txs/Txs.repository';
import { ScheduleModule }                from 'nest-schedule';
import { WinstonLoggerService }          from '@lib/common/logger/WinstonLogger.service';
import { TxSequenceAcsetbuilderHelper }  from '@lib/common/txs/acset_builders/TxSequence.acsetbuilder.helper';
import { BullModule, BullModuleOptions } from '@nestjs/bull';
import { ConfigService }                 from '@lib/common/config/Config.service';

/**
 * Build options for the Txs Module
 */
export interface TxsModuleAsyncOptions extends Pick<DynamicModule, 'imports'> {
    /**
     * Factory to inject Txs Service options
     * @param args
     */
    useFactory: (...args: any[]) => Promise<TxsServiceOptions> | TxsServiceOptions;

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
                ...(options.imports ? options.imports : []),
                ExpressCassandraModule.forFeature([TxEntity, TxsRepository]),
                ScheduleModule.register(),
                BullModule.registerQueueAsync({
                    inject: [ConfigService],
                    name: 'tx',
                    useFactory: (configService: ConfigService): BullModuleOptions => ({
                        name: 'tx',
                        redis: {
                            host: configService.get('BULL_REDIS_HOST'),
                            port: parseInt(configService.get('BULL_REDIS_PORT'), 10),
                        },
                    }),
                }),
            ],
            providers: [
                {
                    provide: `ACTION_SET_BUILDER/txseq_processor`,
                    useClass: TxSequenceAcsetbuilderHelper,
                },
                {
                    provide: 'TXS_MODULE_OPTIONS',
                    useFactory: options.useFactory,
                    inject: options.inject,
                },
                TxsService,
                {
                    provide: WinstonLoggerService,
                    useValue: new WinstonLoggerService('txs'),
                },
            ],
            exports: [TxsService, 'TXS_MODULE_OPTIONS'],
        };
    }
}
