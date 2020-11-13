import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { VenmasEntity } from '@lib/common/venmas/entities/Venmas.entity';
import { VenmasService }                                                              from '@lib/common/venmas/Venmas.service';
import { Body, Controller, HttpCode, Injectable, Param, Post, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags }                                                     from '@nestjs/swagger';
import { AuthGuard }                                                           from '@nestjs/passport';
import { Roles, RolesGuard }                                                   from '@app/server/authentication/guards/RolesGuard.guard';
import { HttpExceptionFilter }                                                 from '@app/server/utils/HttpException.filter';
import { StatusCodes }                                                         from '@lib/common/utils/codes.value';
import { ApiResponses }                                                        from '@app/server/utils/ApiResponses.controller.decorator';
import { User }                                                                from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto }                                                             from '@lib/common/users/dto/User.dto';
import { SearchInputType }                                                     from '@lib/common/utils/SearchInput.type';
import { VenmasCreateResponseDto }                                             from '@app/server/controllers/venmas/dto/VenmasCreateResponse.dto';
import { VenmasCreateInputDto }                                                from '@app/server/controllers/venmas/dto/VenmasCreateInput.dto';

/**
 * Venmas Controller
 */
@Injectable()
@ApiBearerAuth()
@ApiTags('venmas')
@Controller('venmas')
export class VenmasController extends ControllerBasics<VenmasEntity> {
    /**
     * Dependency Injection
     *
     * @param venmasService
     */
    constructor(private readonly venmasService: VenmasService) {
        super();
    }

    /**
     * Store venmas entity
     *
     * @param body
     * @param user
     */
    @Post('/create')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async create(@Body() body: VenmasCreateInputDto, @User() user: UserDto): Promise<VenmasCreateResponseDto> {
        const venmas = await this._new(this.venmasService, {
            body
        } as Partial<VenmasEntity>);

        return {
            venmas,
        };
    }

    /**
     * Edit venmas entity
     *
     * @param body
     * @param venmasId
     * @param user
     */
    @Post('/update/:venmasId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async update(@Body() body: VenmasCreateInputDto, @Param('venmasId') venmasId: string, @User() user: UserDto): Promise<void> {
        await this._edit(this.venmasService, {
            id: venmasId
        }, {
            body
        } as Partial<VenmasEntity>);
    }

}