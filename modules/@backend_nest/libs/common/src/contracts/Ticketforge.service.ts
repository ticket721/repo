import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import { ContractsService } from '@lib/common/contracts/Contracts.service';
import { Injectable } from '@nestjs/common';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { T721ControllerV0Service } from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { MetaMarketplaceV0Service } from '@lib/common/contracts/metamarketplace/MetaMarketplace.V0.service';

/**
 * A Set of MetaMarketplace + T721Controller
 */
export interface ScopeBinding {
    /**
     * MetaMarketplace
     */
    mm: ContractsControllerBase;

    /**
     * T721Controller
     */
    t721c: ContractsControllerBase;
}

/**
 * All scopes storage
 */
export interface ScopeBindings {
    [key: string]: ScopeBinding;
}

/**
 * Smart Contract Controller for the Ticketforge contract
 */
@Injectable()
export class TicketforgeService extends ContractsControllerBase {
    /**
     * Stored bindings
     */
    private scopeBindings: ScopeBindings = {};

    /**
     * Dependency Injection
     *
     * @param contractsService
     * @param web3Service
     * @param shutdownService
     * @param t721controllerV0
     * @param metaMarketplaceV0
     */
    constructor(
        contractsService: ContractsService,
        web3Service: Web3Service,
        shutdownService: ShutdownService,
        t721controllerV0: T721ControllerV0Service,
        metaMarketplaceV0: MetaMarketplaceV0Service,
    ) {
        super(contractsService, web3Service, shutdownService, 'ticketforge', 'TicketForge');
        this.registerScopeBindings('ticket721_0', metaMarketplaceV0, t721controllerV0);
    }

    /**
     * Add a new scope to registered bindings
     *
     * @param name
     * @param mm
     * @param t721c
     */
    private registerScopeBindings(name: string, mm: ContractsControllerBase, t721c: ContractsControllerBase): void {
        this.scopeBindings[name] = {
            mm,
            t721c,
        };
    }

    /**
     * Recover a MetaMarketplace and T721Controller instance for given scope
     *
     * @param scope
     */
    public getScopeContracts(scope: string): ScopeBinding {
        return this.scopeBindings[scope];
    }
}
