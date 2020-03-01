import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import { ContractsService } from '@lib/common/contracts/Contracts.service';
import { Injectable } from '@nestjs/common';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';

/**
 * Smart Contract Controller for the T721Controller_v0 contract
 */
@Injectable()
export class T721ControllerV0Service extends ContractsControllerBase {
    /**
     * Dependency Injection
     *
     * @param contractsService
     * @param web3Service
     * @param shutdownService
     */
    constructor(contractsService: ContractsService, web3Service: Web3Service, shutdownService: ShutdownService) {
        super(contractsService, web3Service, shutdownService, 't721controller', 'T721Controller_v0');
    }
}
