import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import { ContractsService } from '@lib/common/contracts/Contracts.service';
import { Injectable } from '@nestjs/common';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { T721ControllerV0Service } from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { MetaMarketplaceV0Service } from '@lib/common/contracts/metamarketplace/MetaMarketplace.V0.service';

/**
 * Smart Contract Controller for the Ticketforge contract
 */
@Injectable()
export class TicketforgeService extends ContractsControllerBase {
    /**
     * Dependency Injection
     *
     * @param contractsService
     * @param web3Service
     * @param shutdownService
     * @param t721controllerV0Service
     * @param metaMarketplaceV0Service
     */
    constructor(
        private readonly contractsService: ContractsService,
        private readonly web3Service: Web3Service,
        private readonly shutdownService: ShutdownService,

        private readonly t721controllerV0Service: T721ControllerV0Service,
        private readonly metaMarketplaceV0Service: MetaMarketplaceV0Service,
    ) {
        super(
            contractsService,
            web3Service,
            shutdownService,
            'ticketforge::TicketForge',
        );
    }
}
