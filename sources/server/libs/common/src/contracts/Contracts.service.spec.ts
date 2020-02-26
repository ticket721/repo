import {
    ContractArtifact,
    ContractsService,
    ContractsServiceOptions,
} from '@lib/common/contracts/Contracts.service';
import * as path from 'path';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import * as fs from 'fs';
import { FSService } from '@lib/common/fs/FS.service';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { GlobalEntity } from '@lib/common/globalconfig/entities/Global.entity';

const configureWeb3Service = (
    web3Service: Web3Service,
    artifactsPath: string,
    net_id: number,
    canceled: number = 0,
): any[] => {
    const codes = {};
    const data = [];

    const web3 = {
        eth: {
            getCode: async (address: string): Promise<string> => {
                if (!codes[address]) return '0x';
                return codes[address];
            },
            getBlockNumber: async (): Promise<number> => {
                return 100;
            },
            getTransaction: async (): Promise<any> => ({
                blockNumber: 80,
            }),
        },
    };

    when(web3Service.net()).thenReturn(Promise.resolve(net_id));
    when(web3Service.get<any>()).thenReturn(web3);

    const modules = fs.readdirSync(artifactsPath);
    for (const mod of modules) {
        if (!fs.statSync(path.join(artifactsPath, mod)).isDirectory()) {
            continue;
        }
        const artifacts = fs.readdirSync(
            path.join(artifactsPath, mod, 'build', 'contracts'),
        );
        for (const artifact of artifacts) {
            const artifact_data: ContractArtifact = JSON.parse(
                fs
                    .readFileSync(
                        path.join(
                            artifactsPath,
                            mod,
                            'build',
                            'contracts',
                            artifact,
                        ),
                    )
                    .toString(),
            );
            if (
                artifact_data.networks[net_id] &&
                artifact_data.networks[net_id].address
            ) {
                if (canceled === 0) {
                    codes[artifact_data.networks[net_id].address] =
                        artifact_data.deployedBytecode;
                }
                data.push({
                    name: `${mod}::${artifact
                        .split('.')
                        .slice(0, -1)
                        .join('.')}`,
                    address: artifact_data.networks[net_id].address,
                });
                if (canceled > 0) {
                    --canceled;
                }
            }
        }
    }

    return data;
};

const artifact_path: string = path.join(
    __dirname,
    'test_material',
    'test_artifact',
);
const network_id: number = 2702;

describe('Contracts Service', function() {
    test('should build and load artifacts', async function() {
        const contractsServiceOptions: ContractsServiceOptions = {
            artifact_path,
        };
        const web3ServiceMock: Web3Service = mock(Web3Service);
        const winstonLoggerService: WinstonLoggerService = new WinstonLoggerService(
            'contracts',
        );
        const shutdownServiceMock: ShutdownService = mock(ShutdownService);
        const globalConfigServiceMock: GlobalConfigService = mock(
            GlobalConfigService,
        );

        const contracts_data = configureWeb3Service(
            web3ServiceMock,
            artifact_path,
            network_id,
        );

        const contractsService: ContractsService = new ContractsService(
            contractsServiceOptions,
            instance(web3ServiceMock),
            winstonLoggerService,
            instance(shutdownServiceMock),
            new FSService(),
            instance(globalConfigServiceMock),
        );

        const contracts = await contractsService.getContractArtifacts();

        for (const contract_data of contracts_data) {
            expect(contracts[contract_data.name]).toBeDefined();
            expect(
                contracts[contract_data.name].networks[network_id].address,
            ).toEqual(contract_data.address);
        }
    });

    test('should shutdown with error for invalid path', async function() {
        const contractsServiceOptions: ContractsServiceOptions = {
            artifact_path: 'invalid/path',
        };
        const web3ServiceMock: Web3Service = mock(Web3Service);
        const winstonLoggerService: WinstonLoggerService = new WinstonLoggerService(
            'contracts',
        );
        const shutdownServiceMock: ShutdownService = mock(ShutdownService);
        const globalConfigServiceMock: GlobalConfigService = mock(
            GlobalConfigService,
        );

        when(shutdownServiceMock.shutdownWithError(anything())).thenReturn(
            undefined,
        );
        const contractsService: ContractsService = new ContractsService(
            contractsServiceOptions,
            instance(web3ServiceMock),
            winstonLoggerService,
            instance(shutdownServiceMock),
            new FSService(),
            instance(globalConfigServiceMock),
        );

        await expect(
            contractsService.getContractArtifacts(),
        ).rejects.toMatchObject({
            message:
                "ENOENT: no such file or directory, scandir 'invalid/path'",
        });

        verify(shutdownServiceMock.shutdownWithError(anything())).called();
    });

    test('should shutdown with error for contract code', async function() {
        const contractsServiceOptions: ContractsServiceOptions = {
            artifact_path,
        };
        const web3ServiceMock: Web3Service = mock(Web3Service);
        const winstonLoggerService: WinstonLoggerService = new WinstonLoggerService(
            'contracts',
        );
        const shutdownServiceMock: ShutdownService = mock(ShutdownService);
        const globalConfigServiceMock: GlobalConfigService = mock(
            GlobalConfigService,
        );

        when(shutdownServiceMock.shutdownWithError(anything())).thenReturn(
            undefined,
        );

        configureWeb3Service(web3ServiceMock, artifact_path, network_id, 1);

        const contractsService: ContractsService = new ContractsService(
            contractsServiceOptions,
            instance(web3ServiceMock),
            winstonLoggerService,
            instance(shutdownServiceMock),
            new FSService(),
            instance(globalConfigServiceMock),
        );

        await expect(
            contractsService.getContractArtifacts(),
        ).rejects.toMatchObject({
            message:
                'Failed contract instance verification for refract::Migrations: network and artifact code do not match !',
        });

        verify(shutdownServiceMock.shutdownWithError(anything())).called();
    });

    test('should not initialize processed_block_number', async function() {
        const contractsServiceOptions: ContractsServiceOptions = {
            artifact_path,
        };
        const web3ServiceMock: Web3Service = mock(Web3Service);
        const winstonLoggerService: WinstonLoggerService = new WinstonLoggerService(
            'contracts',
        );
        const shutdownServiceMock: ShutdownService = mock(ShutdownService);
        const globalConfigServiceMock: GlobalConfigService = mock(
            GlobalConfigService,
        );

        when(shutdownServiceMock.shutdownWithError(anything())).thenReturn(
            undefined,
        );

        configureWeb3Service(web3ServiceMock, artifact_path, network_id, 1);

        const contractsService: ContractsService = new ContractsService(
            contractsServiceOptions,
            instance(web3ServiceMock),
            winstonLoggerService,
            instance(shutdownServiceMock),
            new FSService(),
            instance(globalConfigServiceMock),
        );

        const globalConfig: Partial<GlobalEntity> = {
            eth_eur_price: 10000,
            block_number: 100,
            processed_block_number: 100,
        };

        when(
            globalConfigServiceMock.search(
                deepEqual({
                    id: 'global',
                }),
            ),
        ).thenResolve({
            response: [globalConfig as GlobalEntity],
            error: null,
        });

        await contractsService.onModuleInit();

        verify(
            globalConfigServiceMock.search(
                deepEqual({
                    id: 'global',
                }),
            ),
        ).called();
    });

    test('should initialize processed_block_number', async function() {
        const contractsServiceOptions: ContractsServiceOptions = {
            artifact_path,
        };
        const web3ServiceMock: Web3Service = mock(Web3Service);
        const winstonLoggerService: WinstonLoggerService = new WinstonLoggerService(
            'contracts',
        );
        const shutdownServiceMock: ShutdownService = mock(ShutdownService);
        const globalConfigServiceMock: GlobalConfigService = mock(
            GlobalConfigService,
        );

        when(shutdownServiceMock.shutdownWithError(anything())).thenReturn(
            undefined,
        );

        configureWeb3Service(web3ServiceMock, artifact_path, network_id);

        const contractsService: ContractsService = new ContractsService(
            contractsServiceOptions,
            instance(web3ServiceMock),
            winstonLoggerService,
            instance(shutdownServiceMock),
            new FSService(),
            instance(globalConfigServiceMock),
        );

        const globalConfig: Partial<GlobalEntity> = {
            eth_eur_price: 10000,
            block_number: 100,
            processed_block_number: 0,
        };

        when(
            globalConfigServiceMock.search(
                deepEqual({
                    id: 'global',
                }),
            ),
        ).thenResolve({
            response: [globalConfig as GlobalEntity],
            error: null,
        });

        when(
            globalConfigServiceMock.update(
                deepEqual({
                    id: 'global',
                }),
                deepEqual({
                    processed_block_number: 80,
                }),
            ),
        ).thenResolve({
            response: null,
            error: null,
        });

        await contractsService.onModuleInit();

        verify(
            globalConfigServiceMock.search(
                deepEqual({
                    id: 'global',
                }),
            ),
        ).called();

        verify(
            globalConfigServiceMock.update(
                deepEqual({
                    id: 'global',
                }),
                deepEqual({
                    processed_block_number: 80,
                }),
            ),
        ).called();
    });

    test('should fail initialization on global config fetch error', async function() {
        const contractsServiceOptions: ContractsServiceOptions = {
            artifact_path,
        };
        const web3ServiceMock: Web3Service = mock(Web3Service);
        const winstonLoggerService: WinstonLoggerService = new WinstonLoggerService(
            'contracts',
        );
        const shutdownServiceMock: ShutdownService = mock(ShutdownService);
        const globalConfigServiceMock: GlobalConfigService = mock(
            GlobalConfigService,
        );

        when(shutdownServiceMock.shutdownWithError(anything())).thenReturn(
            undefined,
        );

        configureWeb3Service(web3ServiceMock, artifact_path, network_id);

        const contractsService: ContractsService = new ContractsService(
            contractsServiceOptions,
            instance(web3ServiceMock),
            winstonLoggerService,
            instance(shutdownServiceMock),
            new FSService(),
            instance(globalConfigServiceMock),
        );

        const globalConfig: Partial<GlobalEntity> = {
            eth_eur_price: 10000,
            block_number: 100,
            processed_block_number: 0,
        };

        when(
            globalConfigServiceMock.search(
                deepEqual({
                    id: 'global',
                }),
            ),
        ).thenResolve({
            response: null,
            error: 'unexpected_error',
        });

        await expect(contractsService.onModuleInit()).rejects.toMatchObject(
            new Error(
                `ContractsService::onModuleInit | error while fetching global config: unexpected_error`,
            ),
        );

        verify(
            globalConfigServiceMock.search(
                deepEqual({
                    id: 'global',
                }),
            ),
        ).called();
    });

    test('should fail initialization on global config empty fetch', async function() {
        const contractsServiceOptions: ContractsServiceOptions = {
            artifact_path,
        };
        const web3ServiceMock: Web3Service = mock(Web3Service);
        const winstonLoggerService: WinstonLoggerService = new WinstonLoggerService(
            'contracts',
        );
        const shutdownServiceMock: ShutdownService = mock(ShutdownService);
        const globalConfigServiceMock: GlobalConfigService = mock(
            GlobalConfigService,
        );

        when(shutdownServiceMock.shutdownWithError(anything())).thenReturn(
            undefined,
        );

        configureWeb3Service(web3ServiceMock, artifact_path, network_id);

        const contractsService: ContractsService = new ContractsService(
            contractsServiceOptions,
            instance(web3ServiceMock),
            winstonLoggerService,
            instance(shutdownServiceMock),
            new FSService(),
            instance(globalConfigServiceMock),
        );

        const globalConfig: Partial<GlobalEntity> = {
            eth_eur_price: 10000,
            block_number: 100,
            processed_block_number: 0,
        };

        when(
            globalConfigServiceMock.search(
                deepEqual({
                    id: 'global',
                }),
            ),
        ).thenResolve({
            response: [],
            error: null,
        });

        await expect(contractsService.onModuleInit()).rejects.toMatchObject(
            new Error(
                `ContractsService::onModuleInit | error while fetching global config: no initial config`,
            ),
        );

        verify(
            globalConfigServiceMock.search(
                deepEqual({
                    id: 'global',
                }),
            ),
        ).called();
    });

    test('should fail on global config fetch error', async function() {
        const contractsServiceOptions: ContractsServiceOptions = {
            artifact_path,
        };
        const web3ServiceMock: Web3Service = mock(Web3Service);
        const winstonLoggerService: WinstonLoggerService = new WinstonLoggerService(
            'contracts',
        );
        const shutdownServiceMock: ShutdownService = mock(ShutdownService);
        const globalConfigServiceMock: GlobalConfigService = mock(
            GlobalConfigService,
        );

        when(shutdownServiceMock.shutdownWithError(anything())).thenReturn(
            undefined,
        );

        configureWeb3Service(web3ServiceMock, artifact_path, network_id);

        const contractsService: ContractsService = new ContractsService(
            contractsServiceOptions,
            instance(web3ServiceMock),
            winstonLoggerService,
            instance(shutdownServiceMock),
            new FSService(),
            instance(globalConfigServiceMock),
        );

        const globalConfig: Partial<GlobalEntity> = {
            eth_eur_price: 10000,
            block_number: 100,
            processed_block_number: 0,
        };

        when(
            globalConfigServiceMock.search(
                deepEqual({
                    id: 'global',
                }),
            ),
        ).thenResolve({
            response: [globalConfig as GlobalEntity],
            error: null,
        });

        when(
            globalConfigServiceMock.update(
                deepEqual({
                    id: 'global',
                }),
                deepEqual({
                    processed_block_number: 80,
                }),
            ),
        ).thenResolve({
            response: null,
            error: 'unexpected_error',
        });

        await expect(contractsService.onModuleInit()).rejects.toMatchObject(
            new Error(
                `ContractsService::onModuleInit | error while updating global config: unexpected_error`,
            ),
        );

        verify(
            globalConfigServiceMock.search(
                deepEqual({
                    id: 'global',
                }),
            ),
        ).called();

        verify(
            globalConfigServiceMock.update(
                deepEqual({
                    id: 'global',
                }),
                deepEqual({
                    processed_block_number: 80,
                }),
            ),
        ).called();
    });
});
