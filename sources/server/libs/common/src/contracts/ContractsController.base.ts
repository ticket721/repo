import {
    ContractArtifact,
    ContractsService,
} from '@lib/common/contracts/Contracts.service';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import Web3 from 'web3';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';

/**
 * Base class for one contract instance service
 */
export class ContractsControllerBase {
    /**
     * Artifact of the instance
     */
    private _contractData: ContractArtifact;

    /**
     * Web3 Contract instance
     */
    private _contract: any;

    /**
     * Logger to use
     */
    private readonly logger: WinstonLoggerService;

    /**
     * Dependency Injection
     *
     * @param contractsService
     * @param web3Service
     * @param shutdownService
     * @param contractName
     */
    constructor(
        private readonly contractsService: ContractsService,
        private readonly web3Service: Web3Service,
        private readonly shutdownService: ShutdownService,
        private readonly contractName: string,
    ) {
        this.logger = new WinstonLoggerService(contractName);
    }

    /**
     * Utility to load contract instance
     */
    async loadContract(): Promise<void> {
        this.logger.log(`Initializing ${this.contractName} service`);
        this._contractData = (
            await this.contractsService.getContractArtifacts()
        )[this.contractName];

        if (!this._contractData) {
            const error: Error = new Error(
                `Cannot recover artifact for instance called ${this.contractName}`,
            );
            this.shutdownService.shutdownWithError(error);
            throw error;
        }

        const web3: Web3 = await this.web3Service.get<Web3>();
        const networkId: number = await this.web3Service.net();

        if (!web3 || (!networkId && networkId !== 0)) {
            const error: Error = new Error(
                `Unable to recover web3 instance or data for contract ${this.contractName}`,
            );
            this.shutdownService.shutdownWithError(error);
            throw error;
        }

        this._contract = new web3.eth.Contract(
            this._contractData.abi,
            this._contractData.networks[networkId].address,
        );
        this.logger.log(`Service ${this.contractName} initialized`);
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
