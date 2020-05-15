import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpCode, UseFilters, UseGuards } from '@nestjs/common';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { TxEntity } from '@lib/common/txs/entities/Tx.entity';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { UsersMeResponseDto } from '@app/server/controllers/users/dto/UsersMeResponse.dto';

/**
 * Users Controller. Fetch and recover users related information
 */
@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController extends ControllerBasics<TxEntity> {
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
}
