import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import { ContractsService } from '@lib/common/contracts/Contracts.service';
import { Injectable } from '@nestjs/common';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';

@Injectable()
export class T721AdminService extends ContractsControllerBase {
    constructor(
        contractsService: ContractsService,
        web3Service: Web3Service,
        shutdownService: ShutdownService,
    ) {
        super(
            contractsService,
            web3Service,
            shutdownService,
            't721admin',
            'T721Admin',
        );
    }
}
