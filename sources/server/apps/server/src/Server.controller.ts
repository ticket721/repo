import { Controller, Get, Injectable } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ServerService } from './Server.service';
import { APIInfos } from './Server.types';
import { StatusCodes, StatusNames } from '@lib/common/utils/codes';

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
    constructor /* istanbul ignore next */(
        private readonly appService: ServerService,
    ) {}

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
