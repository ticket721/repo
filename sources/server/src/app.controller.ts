import { Controller, Get } from '@nestjs/common';
import { AppService }      from './app.service';
import { ApiResponse }     from '@nestjs/swagger';

/**
 * [/ Controller]: Controller containing root routes of the API
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

    /**
     * [GET /] : Recover a welcome message
     */
  @Get()
  @ApiResponse({ status: 200, description: 'The response was succesful'})
  getHello(): string {
    return this.appService.getHello();
  }
}
