import { Controller, Get, Injectable } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { StatusCodes, StatusNames } from '@lib/common/utils/codes.value';
import { ServerService } from '@app/server/Server.service';
import { APIInfos } from '@app/server/Server.types';

/**
 * [/ Controller]: Controller containing root routes of the API
 */
@Controller()
@Injectable()
export class ServerController {
    /**
     * Dependency Injection
     *
     * @param appService
     */
    constructor(private readonly appService: ServerService) {}

    /**
     * [GET /] : Recover api infos
     */
    @Get()
    @ApiResponse({
        status: StatusCodes.OK,
        description: StatusNames[StatusCodes.OK],
    })
    getAPIInfos(): APIInfos {
        return this.appService.getAPIInfos();
    }
}
