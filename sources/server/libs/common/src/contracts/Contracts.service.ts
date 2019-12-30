import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Web3Service } from '@lib/common/web3/Web3.service';
import * as fs from 'fs';
import * as path from 'path';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';

export interface ContractsServiceOptions {
    artifact_path: string;
}

export interface ABIInput {
    name: string;
    type: string;
    components?: ABIInput[];
    indexed?: boolean;
}

export type ABIOutput = ABIInput;

export interface ABISegment {
    type?: 'function' | 'constructor' | 'fallback' | 'event';
    anonymous?: boolean;
    payable?: boolean;
    constant?: boolean;
    name: string;
    inputs: ABIInput[];
    outputs: ABIOutput[];
    stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
}

export interface ContractLink {
    address: string;
    events: string;
}

export interface NetworkInfo {
    address: string;
    events: {
        [key: string]: ABIOutput;
    };
    links: ContractLink[];
    transactionHash: string;
}

export interface CompilerInfo {
    name: string;
    version: string;
}

export interface ContractArtifact {
    contractName: string;
    abi: ABISegment[];
    metadata: string;
    bytecode: string;
    deployedBytecode: string;
    sourceMap: string;
    deployedSourceMap: string;
    source: string;
    sourcePath: string;
    ast: any;
    legacyAST: any;
    compiler: CompilerInfo;
    networks: {
        [key: number]: NetworkInfo;
    };
    schemaVersion: string;
    updatedAt: string;
    devdoc: any;
    userdoc: any;
    moduleName: string;
}

export interface Contracts {
    [key: string]: ContractArtifact;
}

@Injectable()
export class ContractsService {
    constructor(
        @Inject('CONTRACTS_MODULE_OPTIONS')
        private readonly options: ContractsServiceOptions,
        private readonly web3Service: Web3Service,
        private readonly winstonLoggerService: WinstonLoggerService,
        private readonly shutdownService: ShutdownService,
    ) {}

    private contracts: Contracts = null;

    private async verifyContracts(networkId: number): Promise<void> {
        const web3 = this.web3Service.get();
        for (const contract of Object.keys(this.contracts)) {
            const address = this.contracts[contract].networks[networkId]
                .address;
            const code = (await web3.eth.getCode(address)).toLowerCase();
            const registeredCode = this.contracts[
                contract
            ].deployedBytecode.toLowerCase();
            if (code !== registeredCode) {
                const error = new Error(
                    `Failed contract instance verification for ${contract}: network and artifact code do not match !`,
                );
                this.shutdownService.shutdownWithError(error);
                throw error;
            }
            this.winstonLoggerService.log(
                `Contract instance ${contract} matches on-chain code`,
            );
        }
    }

    private async loadContracts(networkId: number): Promise<void> {
        try {
            this.contracts = {};
            const artifactContent: string[] = fs.readdirSync(
                this.options.artifact_path,
            );
            for (const artifact of artifactContent) {
                const contractsModuleDir = path.join(
                    this.options.artifact_path,
                    artifact,
                    'build',
                    'contracts',
                );
                const contractsModuleContent = fs.readdirSync(
                    contractsModuleDir,
                );

                for (const contract of contractsModuleContent) {
                    const contractData: ContractArtifact = JSON.parse(
                        fs
                            .readFileSync(
                                path.join(contractsModuleDir, contract),
                            )
                            .toString(),
                    );
                    if (contractData.networks[networkId] !== undefined) {
                        contractData.moduleName = artifact;
                        const contractName = contract
                            .split('.')
                            .slice(0, -1)
                            .join('.');
                        this.winstonLoggerService.log(
                            `Imported contract instance ${artifact}::${contractName}`,
                        );
                        this.contracts[
                            `${artifact}::${contractName}`
                        ] = contractData;
                    }
                }
            }
        } catch (e) {
            this.shutdownService.shutdownWithError(e);
            throw e;
        }
    }

    private async loadArtifacts(): Promise<Contracts> {
        const networkId: number = await this.web3Service.net();
        this.winstonLoggerService.log(`Starting contract instances import`);
        await this.loadContracts(networkId);
        this.winstonLoggerService.log(`Finished contract instances import`);
        this.winstonLoggerService.log(
            `Starting contract instances verification`,
        );
        await this.verifyContracts(networkId);
        this.winstonLoggerService.log(
            `Finished contract instances verification`,
        );

        return this.contracts;
    }

    public async getContractArtifacts(): Promise<Contracts> {
        return this.contracts || this.loadArtifacts();
    }
}
