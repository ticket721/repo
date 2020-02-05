import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpCode } from '@nestjs/common';
import {
    Contracts,
    ContractsService,
} from '@lib/common/contracts/Contracts.service';
import { StatusCodes, StatusNames } from '@lib/common/utils/codes';
import { ContractsFetchResponseDto } from '@app/server/controllers/contracts/dto/ContractsFetchResponse.dto';

@ApiBearerAuth()
@ApiTags('contracts')
@Controller('contracts')
export class ContractsController {
    constructor(private readonly contractsService: ContractsService) {}

    /**
     * Search for dates
     *
     * @param body
     * @param user
     */
    @Get('/')
    @ApiResponse({
        status: StatusCodes.OK,
        description: StatusNames[StatusCodes.OK],
    })
    @HttpCode(200)
    async getContractArtifacts(): Promise<ContractsFetchResponseDto> {
        const contracts: Contracts = await this.contractsService.getContractArtifacts();

        return {
            contracts,
        };
    }
}
