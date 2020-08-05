import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpCode, UseFilters, UseGuards } from '@nestjs/common';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { FeatureFlagsService, Flags } from '@lib/common/featureflags/FeatureFlags.service';
import { Roles } from '@app/server/authentication/guards/RolesGuard.guard';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { FeatureFlagsGetResponseDto } from '@app/server/controllers/featureflags/dto/FeatureFlagsGetResponse.dto';
import { AuthGuard } from '@nestjs/passport';

/**
 * FeatureFlags controller to create and fetch flags
 */
@ApiBearerAuth()
@ApiTags('feature-flags')
@Controller('feature-flags')
export class FeatureFlagsController extends ControllerBasics<any> {
    /**
     * Dependency Injection
     *
     * @param featureFlagsService
     */
    constructor(private readonly featureFlagsService: FeatureFlagsService) {
        super();
    }

    /**
     * Route to recover feature flags
     * @param user
     */
    @Get('/')
    @UseFilters(new HttpExceptionFilter())
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([
        StatusCodes.OK,
        StatusCodes.NotFound,
        StatusCodes.Unauthorized,
        StatusCodes.BadRequest,
        StatusCodes.InternalServerError,
    ])
    async getFlags(@User() user: UserDto): Promise<FeatureFlagsGetResponseDto> {
        return {
            flags: await this._serviceCall<Flags>(
                this.featureFlagsService.getFlags(user),
                StatusCodes.InternalServerError,
            ),
        };
    }
}
