import { Body, Controller, HttpCode, Injectable, Post, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { RightsService } from '@lib/common/rights/Rights.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';
import { RightEntity } from '@lib/common/rights/entities/Right.entity';
import { RightsSearchInputDto } from '@app/server/controllers/rights/dto/RightsSearchInput.dto';
import { RightsSearchResponseDto } from '@app/server/controllers/rights/dto/RightsSearchResponse.dto';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';

/**
 * Controller Handling Gem Orders
 */
@Injectable()
@ApiBearerAuth()
@ApiTags('rights')
@Controller('rights')
export class RightsController extends ControllerBasics<RightEntity> {
    /**
     * Dependency Injection
     *
     * @param rightsService
     * @param rightsService
     */
    constructor(private readonly rightsService: RightsService) {
        super();
    }

    /**
     * Fetches Rights
     *
     * @param body
     * @param user
     */
    @Post('/search')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async search(@Body() body: RightsSearchInputDto, @User() user: UserDto): Promise<RightsSearchResponseDto> {
        const rights: RightEntity[] = await this._search(this.rightsService, {
            ...body,
            grantee_id: {
                $eq: user.id,
            },
        });

        return {
            rights,
        };
    }
}
