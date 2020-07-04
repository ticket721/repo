import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpCode, UseFilters } from '@nestjs/common';
import { Contracts, ContractsService } from '@lib/common/contracts/Contracts.service';
import { StatusCodes } from '@lib/common/utils/codes.value';
import {
    ContractsFetchResponseDto,
    MinimalContractSpec,
} from '@app/server/controllers/contracts/dto/ContractsFetchResponse.dto';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { Web3Service } from '@lib/common/web3/Web3.service';

/**
 * Contracts information controller. Mainly used to recover contract artifacts on frontend
 */
@ApiBearerAuth()
@ApiTags('contracts')
@Controller('contracts')
export class ContractsController {
    /**
     * Dependency Injection
     *
     * @param contractsService
     * @param web3Service
     */
    constructor(private readonly contractsService: ContractsService, private readonly web3Service: Web3Service) {}

    contracts: { [key: string]: MinimalContractSpec } = null;

    /**
     * Recover Contract Artifacts
     */
    @Get('/')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK])
    async getContractArtifacts(): Promise<ContractsFetchResponseDto> {
        const contracts: Contracts = await this.contractsService.getContractArtifacts();
        const net = await this.web3Service.net();

        if (this.contracts === null) {
            const newValue = {};
            for (const contract of Object.keys(contracts)) {
                if (contracts[contract].networks[net]) {
                    newValue[contract] = {
                        address: contracts[contract].networks[net].address,
                        abi: contracts[contract].abi,
                        transactionHash: contracts[contract].networks[net].transactionHash,
                    };
                }
            }
            this.contracts = newValue;
        }

        return {
            contracts: this.contracts,
        };
    }
}
