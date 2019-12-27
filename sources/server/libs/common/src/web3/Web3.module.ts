import { DynamicModule, Global, Module }   from '@nestjs/common';
import { Web3Service, Web3ServiceOptions } from '@lib/common/web3/Web3.service';

export interface Web3ModuleAsyncOptions extends Pick<DynamicModule, 'imports'> {
    useFactory: (...args: any[]) => Promise<Web3ServiceOptions> | Web3ServiceOptions;
    inject?: any[];
}

/**
 * Module to build & serve a web3 instance
 */
@Global()
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
                    inject: options.inject,
                },
                Web3Service,
            ],
            exports: [
                Web3Service,
            ],
        };
    }
}
