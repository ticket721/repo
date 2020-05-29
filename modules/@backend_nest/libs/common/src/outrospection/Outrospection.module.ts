import { DynamicModule, Global, Module } from '@nestjs/common';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import * as os from 'os';

/**
 * Outrospection module for instances to properly know their position
 */
@Global()
@Module({})
export class OutrospectionModule {
    /**
     * Async Registration
     */
    static register(name: string): DynamicModule {
        return {
            module: OutrospectionModule,
            providers: [
                {
                    provide: WinstonLoggerService,
                    useValue: new WinstonLoggerService('outro'),
                },
                {
                    provide: 'OUTROSPECTION_INSTANCE_NAME',
                    useValue: name,
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
