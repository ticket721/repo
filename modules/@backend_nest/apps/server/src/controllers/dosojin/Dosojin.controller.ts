import { Body, Controller, HttpCode, Injectable, Post, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StatusCodes, StatusNames } from '@lib/common/utils/codes';
import { User } from '@app/server/authentication/decorators/User.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { search } from '@lib/common/utils/ControllerBasics';
import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';
import { GemOrdersService } from '@lib/common/gemorders/GemOrders.service';
import { GemOrdersSearchInputDto } from '@app/server/controllers/dosojin/dto/GemOrdersSearchInput.dto';
import { GemOrdersSearchResponseDto } from '@app/server/controllers/dosojin/dto/GemOrdersSearchResponse.dto';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch';

/**
 * Controller Handling Gem Orders
 */
@Injectable()
@ApiBearerAuth()
@ApiTags('dosojin')
@Controller('dosojin')
export class DosojinController {
    /**
     * Dependency Injection
     *
     * @param gemOrdersService
     */
    constructor(private readonly gemOrdersService: GemOrdersService) {}

    /**
     * Fetches Gem Orders
     *
     * @param body
     * @param user
     */
    @Post('/search')
    @ApiResponse({
        status: StatusCodes.InternalServerError,
        description: StatusNames[StatusCodes.InternalServerError],
    })
    @ApiResponse({
        status: StatusCodes.BadRequest,
        description: StatusNames[StatusCodes.BadRequest],
    })
    @ApiResponse({
        status: StatusCodes.OK,
        description: StatusNames[StatusCodes.OK],
    })
    @HttpCode(200)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('authenticated')
    @UseFilters(new HttpExceptionFilter())
    /* istanbul ignore next */
    async search(@Body() body: GemOrdersSearchInputDto, @User() user: UserDto): Promise<GemOrdersSearchResponseDto> {
        const gemOrders = await search<GemOrderEntity, GemOrdersService>(this.gemOrdersService, {
            ...body,
            owner: {
                $eq: user.id,
            },
        } as SortablePagedSearch);

        return {
            gemOrders,
        };
    }
}
