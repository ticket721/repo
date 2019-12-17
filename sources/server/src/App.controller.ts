import { Controller, Get, Injectable, Param } from '@nestjs/common';
import { AppService }               from './App.service';
import { ApiResponse }              from '@nestjs/swagger';
import { StatusCodes, StatusNames } from './utils/codes';
import { APIInfos }                 from './App.types';

/**
 * [/ Controller]: Controller containing root routes of the API
 */
@Controller()
@Injectable()
export class AppController {

    /**
     * Dependency Injection
     *
     * @param usersService
     * @param configService
     */
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
