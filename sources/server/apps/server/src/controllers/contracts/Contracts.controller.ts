import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpCode, UseFilters } from '@nestjs/common';
import { Contracts, ContractsService } from '@lib/common/contracts/Contracts.service';
import { StatusCodes, StatusNames } from '@lib/common/utils/codes';
import { ContractsFetchResponseDto } from '@app/server/controllers/contracts/dto/ContractsFetchResponse.dto';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';

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
    @ApiResponse({
        status: StatusCodes.OK,
        description: StatusNames[StatusCodes.OK],
    })
    @HttpCode(200)
    @UseFilters(new HttpExceptionFilter())
    async getContractArtifacts(): Promise<ContractsFetchResponseDto> {
        const contracts: Contracts = await this.contractsService.getContractArtifacts();

        return {
            contracts,
        };
    }
}
