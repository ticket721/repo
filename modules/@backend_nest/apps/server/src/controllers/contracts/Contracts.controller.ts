import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpCode, UseFilters } from '@nestjs/common';
import { Contracts, ContractsService } from '@lib/common/contracts/Contracts.service';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { ContractsFetchResponseDto } from '@app/server/controllers/contracts/dto/ContractsFetchResponse.dto';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';

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
     */
    constructor(private readonly contractsService: ContractsService) {}

    /**
     * Recover Contract Artifacts
     */
    @Get('/')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK])
    async getContractArtifacts(): Promise<ContractsFetchResponseDto> {
        const contracts: Contracts = await this.contractsService.getContractArtifacts();

        return {
            contracts,
        };
    }
}
