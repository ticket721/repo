import { DynamicModule, Global, Module }             from '@nestjs/common';
import { ContractsService, ContractsServiceOptions } from '@lib/common/contracts/Contracts.service';
import { WinstonLoggerService }                      from '@lib/common/logger/WinstonLogger.service';

export interface ContractsModuleAsyncOptions extends Pick<DynamicModule, 'imports'> {
    useFactory: (...args: any[]) => Promise<ContractsServiceOptions> | ContractsServiceOptions;
    inject?: any[];
}

@Global()
@Module({})
export class ContractsModule {
    static registerAsync(options: ContractsModuleAsyncOptions): DynamicModule {
        return {
            module: ContractsModule,
            imports: options.imports,
            providers: [
                {
                    provide: 'CONTRACTS_MODULE_OPTIONS',
                    useFactory: options.useFactory,
                    inject: options.inject,
                },
                ContractsService,
                {
                    provide: WinstonLoggerService,
                    useValue: new WinstonLoggerService('contracts'),
                }
            ],
            exports: [
                ContractsService
            ]
        };
    }
}
