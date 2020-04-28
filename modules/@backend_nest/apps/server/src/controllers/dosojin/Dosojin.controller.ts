import { Body, Controller, HttpCode, Injectable, Post, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';
import { GemOrdersService } from '@lib/common/gemorders/GemOrders.service';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';
import { RightsService } from '@lib/common/rights/Rights.service';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { DosojinSearchInputDto } from '@app/server/controllers/dosojin/dto/DosojinSearchInput.dto';
import { DosojinSearchResponseDto } from '@app/server/controllers/dosojin/dto/DosojinSearchResponse.dto';

/**
 * Controller Handling Gem Orders
 */
@Injectable()
@ApiBearerAuth()
@ApiTags('dosojin')
@Controller('dosojin')
export class DosojinController extends ControllerBasics<GemOrderEntity> {
    /**
     * Dependency Injection
     *
     * @param gemOrdersService
     * @param rightsService
     */
    constructor(private readonly gemOrdersService: GemOrdersService, private readonly rightsService: RightsService) {
        super();
    }

    /**
     * Fetches Gem Orders
     *
     * @param body
     * @param user
     */
    @Post('/search')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async search(@Body() body: DosojinSearchInputDto, @User() user: UserDto): Promise<DosojinSearchResponseDto> {
        const gemOrders = await this._searchRestricted(this.gemOrdersService, this.rightsService, user, 'id', {
            ...body,
        } as SortablePagedSearch);

        return {
            gemOrders,
        };
    }
}
