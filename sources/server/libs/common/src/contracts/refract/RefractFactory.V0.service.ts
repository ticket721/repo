import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import { ContractsService } from '@lib/common/contracts/Contracts.service';
import { Injectable } from '@nestjs/common';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';

@Injectable()
export class RefractFactoryV0Service extends ContractsControllerBase {
    constructor(
        private readonly contractsService: ContractsService,
        private readonly web3Service: Web3Service,
        private readonly shutdownService: ShutdownService,
    ) {
        super(
            contractsService,
            web3Service,
            shutdownService,
            'refract::RefractFactory_v0',
        );
    }
}
