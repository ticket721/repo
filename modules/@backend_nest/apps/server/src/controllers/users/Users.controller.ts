import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, HttpCode, Put, UseFilters, UseGuards } from '@nestjs/common';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { UsersMeResponseDto } from '@app/server/controllers/users/dto/UsersMeResponse.dto';
import { UsersSetDeviceAddressInputDto } from '@app/server/controllers/users/dto/UsersSetDeviceAddressInput.dto';
import { UsersSetDeviceAddressResponseDto } from '@app/server/controllers/users/dto/UsersSetDeviceAddressResponse.dto';
import { UsersService } from '@lib/common/users/Users.service';
import { UserEntity } from '@lib/common/users/entities/User.entity';

/**
 * Users Controller. Fetch and recover users related information
 */
@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController extends ControllerBasics<UserEntity> {
    /**
     * Dependency Injection
     *
     * @param usersService
     */
    constructor(private readonly usersService: UsersService) {
        super();
    }

    /**
     * Recover Authenticated user infos
     */
    @Get('me')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized])
    async infos(@User() user: UserDto): Promise<UsersMeResponseDto> {
        delete user.password;
        return {
            user,
        };
    }

    /**
     * Recover Authenticated user infos
     */
    @Put('device-address')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized])
    async setDeviceAddress(
        @Body() body: UsersSetDeviceAddressInputDto,
        @User() user: UserDto,
    ): Promise<UsersSetDeviceAddressResponseDto> {
        const updatedUser = await this._serviceCall(
            this.usersService.setDeviceAddress(user.id, body.deviceAddress),
            StatusCodes.InternalServerError,
        );

        return {
            user: updatedUser,
        };
    }
}
