import { Controller, Get, Injectable } from '@nestjs/common';
import { ApiResponse }                 from '@nestjs/swagger';
import { StatusCodes, StatusNames }    from '@lib/common/utils/codes.value';
import { InstanceSignature, OutrospectionService } from '@lib/common/outrospection/Outrospection.service';

/**
 * [/ Controller]: Controller containing root routes of the worker
 */
@Controller()
@Injectable()
/* istanbul ignore next */
export class StatusController {
    /**
     * Dependency Injection
     *
     * @param outrospectionService
     */
    constructor(private readonly outrospectionService: OutrospectionService) {}

    /**
     * [GET /] : Recover instance infos
     */
    @Get()
    @ApiResponse({
        status: StatusCodes.OK,
        description: StatusNames[StatusCodes.OK],
    })
    async getInstanceInfos(): Promise<InstanceSignature> {
        return this.outrospectionService.getInstanceSignature();
    }
}
