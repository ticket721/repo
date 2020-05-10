import { DynamicModule, Global, Module } from '@nestjs/common';
import { ContractsService, ContractsServiceOptions } from '@lib/common/contracts/Contracts.service';
import { WinstonLoggerService }     from '@lib/common/logger/WinstonLogger.service';
import { TicketforgeService }       from '@lib/common/contracts/Ticketforge.service';
import { T721ControllerV0Service }  from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { MetaMarketplaceV0Service } from '@lib/common/contracts/metamarketplace/MetaMarketplace.V0.service';
import { FSModule }                 from '@lib/common/fs/FS.module';
import { T721AdminService }         from '@lib/common/contracts/T721Admin.service';
import { ContractsControllerBase }  from '@lib/common/contracts/ContractsController.base';
import { GlobalConfigModule }       from '@lib/common/globalconfig/GlobalConfig.module';
import { T721TokenService }         from '@lib/common/contracts/T721Token.service';
import { ToolBoxModule }            from '@lib/common/toolbox/ToolBox.module';
import { AuthorizationsModule }     from '@lib/common/authorizations/Authorizations.module';

/**
 * Build options for the Contracts Module
 */
export interface ContractsModuleAsyncOptions extends Pick<DynamicModule, 'imports'> {
    /**
     * Factory to inject Contracts Service options
     * @param args
     */
    useFactory: (...args: any[]) => Promise<ContractsServiceOptions> | ContractsServiceOptions;

    /**
     * Providers to inject into factory
     */
    inject?: any[];
}

/**
 * Module to load contracts instance and utilities
 */
@Global()
@Module({})
export class ContractsModule {
    /**
     * Static async module creation
     *
     * @param options
     */
    static registerAsync(options: ContractsModuleAsyncOptions): DynamicModule {
        return {
            module: ContractsModule,
            imports: [
                ...(options.imports ? options.imports : []),
                FSModule,
                GlobalConfigModule,
                ToolBoxModule,
                AuthorizationsModule,
            ],
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
                },
                TicketforgeService,
                T721ControllerV0Service,
                MetaMarketplaceV0Service,
                T721AdminService,
                T721TokenService,
                {
                    provide: 'CONTRACTS_CONTROLLER_BASE_CLASS',
                    useValue: ContractsControllerBase,
                },
            ],
            exports: [
                ContractsService,
                TicketforgeService,
                T721ControllerV0Service,
                MetaMarketplaceV0Service,
                T721AdminService,
                T721TokenService,
            ],
        };
    }
}
