import { ContractArtifact, ContractsService, ContractsServiceOptions } from '@lib/common/contracts/Contracts.service';
import * as path                                                       from 'path';
import { Web3Service }                            from '@lib/common/web3/Web3.service';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { WinstonLoggerService }                   from '@lib/common/logger/WinstonLogger.service';
import { ShutdownService }                           from '@lib/common/shutdown/Shutdown.service';
import * as fs                                       from 'fs';

const configureWeb3Service = (web3Service: Web3Service, artifactsPath: string, net_id: number, canceled: number = 0): any[] => {

    const codes = {};
    const data = [];

    const web3 = {
        eth: {
            getCode: async (address: string): Promise<string> => {
                if (!codes[address]) return '0x';
                return codes[address];
            }
        }
    };

    when(web3Service.net()).thenReturn(Promise.resolve(net_id));
    when(web3Service.get<any>()).thenReturn(web3);

    const modules = fs.readdirSync(artifactsPath);
    for (const mod of modules) {
        const artifacts = fs.readdirSync(path.join(artifactsPath, mod, 'build', 'contracts'));
        for (const artifact of artifacts) {
            const artifact_data: ContractArtifact = JSON.parse(fs.readFileSync(path.join(artifactsPath, mod, 'build', 'contracts', artifact)).toString())
            if (artifact_data.networks[net_id] && artifact_data.networks[net_id].address) {
                if (canceled === 0) {
                    codes[artifact_data.networks[net_id].address] = artifact_data.deployedBytecode;
                }
                data.push({
                        name: `${mod}::${artifact.split('.').slice(0, -1).join('.')}`,
                        address: artifact_data.networks[net_id].address
                    }
                );
                if (canceled > 0) {
                    --canceled;
                }
            }
        }
    }

    return data;

};

const artifact_path: string = path.join(__dirname, 'test_material', 'test_artifact');
const network_id: number = 2702;

describe('Contracts Service', function () {

    test('should build and load artifacts', async function() {

        const contractsServiceOptions: ContractsServiceOptions = {
            artifact_path
        };
        const web3ServiceMock: Web3Service = mock(Web3Service);
        const winstonLoggerService: WinstonLoggerService = new WinstonLoggerService('contracts');
        const shutdownServiceMock: ShutdownService = mock(ShutdownService);

        const contracts_data = configureWeb3Service(web3ServiceMock, artifact_path, network_id);

        const contractsService: ContractsService = new ContractsService(
            contractsServiceOptions,
            instance(web3ServiceMock),
            winstonLoggerService,
            instance(shutdownServiceMock)
        );

        const contracts = await contractsService.getContractArtifacts();

        for (const contract_data of contracts_data) {
            expect(contracts[contract_data.name]).toBeDefined();
            expect(contracts[contract_data.name].networks[network_id].address).toEqual(contract_data.address);
        }

    });

    test('should shutdown with error for invalid path', async function() {

        const contractsServiceOptions: ContractsServiceOptions = {
            artifact_path: 'invalid/path'
        };
        const web3ServiceMock: Web3Service = mock(Web3Service);
        const winstonLoggerService: WinstonLoggerService = new WinstonLoggerService('contracts');
        const shutdownServiceMock: ShutdownService = mock(ShutdownService);

        when(shutdownServiceMock.shutdownWithError(anything())).thenReturn(undefined);
        const contractsService: ContractsService = new ContractsService(
            contractsServiceOptions,
            instance(web3ServiceMock),
            winstonLoggerService,
            instance(shutdownServiceMock)
        );

        await expect(contractsService.getContractArtifacts()).rejects.toMatchObject({
            message: 'ENOENT: no such file or directory, scandir \'invalid/path\''
        });

        verify(shutdownServiceMock.shutdownWithError(anything())).called();

    });

    test('should shutdown with error for contract code', async function() {

        const contractsServiceOptions: ContractsServiceOptions = {
            artifact_path
        };
        const web3ServiceMock: Web3Service = mock(Web3Service);
        const winstonLoggerService: WinstonLoggerService = new WinstonLoggerService('contracts');
        const shutdownServiceMock: ShutdownService = mock(ShutdownService);

        when(shutdownServiceMock.shutdownWithError(anything())).thenReturn(undefined);

        configureWeb3Service(web3ServiceMock, artifact_path, network_id, 1);

        const contractsService: ContractsService = new ContractsService(
            contractsServiceOptions,
            instance(web3ServiceMock),
            winstonLoggerService,
            instance(shutdownServiceMock)
        );

        await expect(contractsService.getContractArtifacts()).rejects.toMatchObject({
            message: 'Failed contract instance verification for refract::Migrations: network and artifact code do not match !'
        });

        verify(shutdownServiceMock.shutdownWithError(anything())).called();

    });

});
