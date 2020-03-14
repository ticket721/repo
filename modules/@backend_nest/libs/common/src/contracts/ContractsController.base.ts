import { ContractArtifact, ContractsService } from '@lib/common/contracts/Contracts.service';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import Web3 from 'web3';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';

/**
 * Extra Configuration
 */
export interface ContractsControllerBaseConfig {
    /**
     * Specific address of the contract
     */
    address?: string;

    /**
     * Name of the contract
     */
    name?: string;
}

/**
 * Base class for one contract instance service
 */
export class ContractsControllerBase {
    /**
     * Artifact of the instance
     */
    protected _contractData: ContractArtifact;

    /**
     * Web3 Contract instance
     */
    protected _contract: any;

    /**
     * Logger to use
     */
    protected readonly logger: WinstonLoggerService;

    /**
     * Dependency Injection
     *
     * @param contractsService
     * @param web3Service
     * @param shutdownService
     * @param moduleName
     * @param contractName
     * @param options
     */
    constructor(
        protected readonly contractsService: ContractsService,
        protected readonly web3Service: Web3Service,
        protected readonly shutdownService: ShutdownService,
        protected readonly moduleName: string,
        protected readonly contractName: string,
        protected readonly options?: ContractsControllerBaseConfig,
    ) {
        this.logger = new WinstonLoggerService(options && options.name ? options.name : contractName);
    }

    /**
     * Return current Artifact Name
     */
    public getArtifactName(): string {
        return `${this.moduleName}::${this.contractName}`;
    }

    /**
     * Verifies if contract matches code on-chain
     *
     * @param contractCode
     * @param contractAddress
     */
    private async verifyContract(contractCode: string, contractAddress: string): Promise<boolean> {
        const code = await (await this.web3Service.get()).eth.getCode(contractAddress);

        return code.toLowerCase() === contractCode.toLowerCase();
    }

    /**
     * Utility to load contract instance
     */
    async loadContract(): Promise<void> {
        this.logger.log(
            `Initializing ${this.options && this.options.name ? this.options.name : this.contractName} service`,
        );
        this._contractData = (await this.contractsService.getContractArtifacts())[
            `${this.moduleName}::${this.contractName}`
        ];

        if (!this._contractData) {
            const error: Error = new Error(`Cannot recover artifact for instance called ${this.contractName}`);
            this.shutdownService.shutdownWithError(error);
            throw error;
        }

        const web3: Web3 = await this.web3Service.get<Web3>();
        const networkId: number = await this.web3Service.net();

        if (!web3 || (!networkId && networkId !== 0)) {
            const error: Error = new Error(`Unable to recover web3 instance or data for contract ${this.contractName}`);
            this.shutdownService.shutdownWithError(error);
            throw error;
        }

        if (this.options && this.options.address) {
            if (
                this._contractData.deployedBytecode &&
                !(await this.verifyContract(this._contractData.deployedBytecode, this.options.address))
            ) {
                throw new Error(
                    `On-Chain code does not match for dynamically loaded contract address (${this.moduleName}::${this.contractName}@${this.options.address})`,
                );
            }

            this._contract = new web3.eth.Contract(this._contractData.abi, this.options.address);
        } else {
            this._contract = new web3.eth.Contract(
                this._contractData.abi,
                this._contractData.networks[networkId].address,
            );
        }

        this.logger.log(
            `Service ${this.options && this.options.name ? this.options.name : this.contractName} initialized`,
        );
    }

    /**
     * Utility to recover contract instance
     */
    async get(): Promise<any> {
        if (!this._contractData || !this._contract) {
            await this.loadContract();
        }
        return this._contract;
    }
}
