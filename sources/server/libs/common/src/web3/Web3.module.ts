import { DynamicModule, Module, Type } from '@nestjs/common';
import { Web3Service }                 from '@lib/common/web3/Web3.service';

export interface Web3ModuleOptions {
    Web3: any;
    host: string;
    port: string;
    protocol: string;
}

export interface Web3ModuleAsyncOptions extends Pick<DynamicModule, 'imports'> {
    useFactory: (...args: any[]) => Promise<Web3ModuleOptions> | Web3ModuleOptions;
    inject?: any[];
}

/**
 * Module to build & serve a web3 instance
 */
@Module({})
export class Web3Module {
    static registerAsync(options: Web3ModuleAsyncOptions): DynamicModule {
        return {
            module: Web3Module,
            imports: options.imports,
            providers: [
                {
                    provide: 'WEB3_MODULE_OPTIONS',
                    useFactory: options.useFactory,
                    inject: options.inject
                },
                Web3Service
            ],
            exports: [
                Web3Service,
            ],
        };
    }
}
