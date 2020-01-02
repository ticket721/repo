import {
    ContractArtifact,
    ContractsService,
} from '@lib/common/contracts/Contracts.service';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import Web3 from 'web3';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';

export class ContractsControllerBase {
    private _contractData: ContractArtifact;
    private _contract: any;
    private readonly logger: WinstonLoggerService;

    constructor(
        private readonly _contractsService: ContractsService,
        private readonly _web3Service: Web3Service,
        private readonly _shutdownService: ShutdownService,
        private readonly contractName: string,
    ) {
        this.logger = new WinstonLoggerService(contractName);
    }

    async loadContract(): Promise<void> {
        this.logger.log(`Initializing ${this.contractName} service`);
        this._contractData = (
            await this._contractsService.getContractArtifacts()
        )[this.contractName];

        if (!this._contractData) {
            const error: Error = new Error(
                `Cannot recover artifact for instance called ${this.contractName}`,
            );
            this._shutdownService.shutdownWithError(error);
            throw error;
        }

        const web3: Web3 = await this._web3Service.get<Web3>();
        const networkId: number = await this._web3Service.net();

        if (!web3 || (!networkId && networkId !== 0)) {
            const error: Error = new Error(
                `Unable to recover web3 instance or data for contract ${this.contractName}`,
            );
            this._shutdownService.shutdownWithError(error);
            throw error;
        }

        this._contract = new web3.eth.Contract(
            this._contractData.abi,
            this._contractData.networks[networkId].address,
        );
        this.logger.log(`Service ${this.contractName} initialized`);
    }

    async get(): Promise<any> {
        if (!this._contractData || !this._contract) {
            await this.loadContract();
        }
        return this._contract;
    }
}
