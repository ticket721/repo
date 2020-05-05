import { DynamicModule, Global, Inject, Module, Provider } from '@nestjs/common';
import { RocksideApi, RocksideApiOpts, RocksideNetwork }   from '@rocksideio/rockside-wallet-sdk/lib/api';
import { RocksideMock, RocksideMockOpts }                  from '@lib/common/rockside/Rockside.mock';
import { ConfigService }                                   from '@lib/common/config/Config.service';
import { ContractsControllerBase }                         from '@lib/common/contracts/ContractsController.base';
import { Web3Service }                                     from '@lib/common/web3/Web3.service';
import { FSService }                                       from '@lib/common/fs/FS.service';
import { ShutdownService }                                 from '@lib/common/shutdown/Shutdown.service';
import { ContractsService }                                from '@lib/common/contracts/Contracts.service';
import { RocksideService }                                 from '@lib/common/rockside/Rockside.service';
import { FSModule }                                        from '@lib/common/fs/FS.module';

export type RocksideModuleBuildOptions = RocksideApiOpts;
export type RocksideModuleMockBuildOptions = RocksideMockOpts;

/**
 * Rockside Service to fetch Ethereum Price
 */
@Global()
@Module({})
export class RocksideModule {
    static register(): DynamicModule {

        return {
            module: RocksideModule,
            imports: [
                FSModule
            ],
            providers: [
                {
                    provide: 'ROCKSIDE_OPTS',
                    useFactory: (configService: ConfigService): RocksideModuleBuildOptions => ({
                        baseUrl: configService.get('ROCKSIDE_OPTS_BASE_URL'),
                        token: undefined,
                        apikey: configService.get('ROCKSIDE_OPTS_API_KEY'),
                        network: [parseInt(configService.get('ROCKSIDE_OPTS_NETWORK_ID'), 10) as any, configService.get('ROCKSIDE_OPTS_NETWORK_NAME') as any]
                    } as any),
                    inject: [ConfigService]
                },



                {
                    provide: 'ROCKSIDE_MOCK_OPTS',
                    useFactory: (
                        configService: ConfigService,
                        web3Service: Web3Service,
                        fsService: FSService,
                        shutdownService: ShutdownService,
                        contractsService: ContractsService,
                    ): RocksideModuleMockBuildOptions => {

                        if (configService.get('NODE_ENV') === 'development') {

                            const identitiesMockController = new ContractsControllerBase(
                                contractsService,
                                web3Service,
                                shutdownService,
                                'dev',
                                'IdentitiesMock',
                            );

                            return {
                                orchestratorPrivateKey: configService.get('ROCKSIDE_MOCK_OPTS_ORCHESTRATOR_PRIVATE_KEY'),
                                identitiesMockController,
                                web3Service,
                                fsService,
                            }

                        } else {
                            return null;
                        }
                    },
                    inject: [
                        ConfigService,
                        Web3Service,
                        FSService,
                        ShutdownService,
                        ContractsService,
                    ]
                },



                {
                    provide: RocksideApi,
                    useFactory: (
                        configService: ConfigService,
                        rocksideOpts: RocksideModuleBuildOptions,
                        rocksideMockOpts: RocksideModuleMockBuildOptions
                    ): RocksideApi => {
                        if (configService.get('NODE_ENV') === 'development') {
                            return new RocksideMock(
                                rocksideOpts,
                                rocksideMockOpts
                            ) as any as RocksideApi;
                        } else {
                            return null;
                        }
                    },
                    inject: [
                        ConfigService,
                        'ROCKSIDE_OPTS',
                        'ROCKSIDE_MOCK_OPTS'
                    ]
                },



                RocksideService,
            ],
            exports: [RocksideService],
        };
    }
}
