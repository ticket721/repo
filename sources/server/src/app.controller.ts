import { Controller, Get, Injectable, Param } from '@nestjs/common';
import { AppService }               from './app.service';
import { ApiResponse }              from '@nestjs/swagger';
import { StatusCodes, StatusNames } from './utils/codes';
import { APIInfos }                 from './app.types';

/**
 * [/ Controller]: Controller containing root routes of the API
 */
@Controller()
@Injectable()
export class AppController {

    constructor(private readonly appService: AppService) {}

    /**
     * [GET /] : Recover api infos
     */
    @Get()
    @ApiResponse({ status: StatusCodes.OK, description: StatusNames[StatusCodes.OK]})
    getAPIInfos(): APIInfos {
        return this.appService.getAPIInfos();
    }

}
