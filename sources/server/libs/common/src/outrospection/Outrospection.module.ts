import { DynamicModule, Global, Module } from '@nestjs/common';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import * as os from 'os';

/**
 * Outrospection options to properly fetch position infos
 */
export interface OutrospectionModuleAsyncOptions {
    /**
     * Instance type name
     */
    name: string;
}

/**
 * Outrospection module for instances to properly know their position
 */
@Global()
@Module({})
export class OutrospectionModule {
    /**
     * Async Registration
     *
     * @param options
     */
    static register(options: OutrospectionModuleAsyncOptions): DynamicModule {
        return {
            module: OutrospectionModule,
            providers: [
                {
                    provide: 'OUTROSPECTION_MODULE_OPTIONS',
                    useValue: {
                        name: options.name,
                    },
                },
                {
                    provide: WinstonLoggerService,
                    useValue: new WinstonLoggerService('outro'),
                },
                {
                    provide: 'OUTROSPECTION_HOSTNAME_GETTER',
                    useValue: (): string => os.hostname(),
                },
                OutrospectionService,
            ],
            exports: [OutrospectionService],
        };
    }
}
