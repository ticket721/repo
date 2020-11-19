import { ControllerBasics }                                                           from '@lib/common/utils/ControllerBasics.base';
import { VenmasEntity }                                                               from '@lib/common/venmas/entities/Venmas.entity';
import { VenmasService }                                                                   from '@lib/common/venmas/Venmas.service';
import { Body, Controller, HttpCode, Injectable, Param, Post, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags }                                                          from '@nestjs/swagger';
import { AuthGuard }                                                                  from '@nestjs/passport';
import { Roles, RolesGuard }                                                          from '@app/server/authentication/guards/RolesGuard.guard';
import { HttpExceptionFilter }                                                        from '@app/server/utils/HttpException.filter';
import { StatusCodes }                                                                from '@lib/common/utils/codes.value';
import { ApiResponses }                                                               from '@app/server/utils/ApiResponses.controller.decorator';
import { User }                                                                       from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto }                                                                    from '@lib/common/users/dto/User.dto';
import { VenmasCreateInputDto }                                                       from '@app/server/controllers/venmas/dto/VenmasCreateInput.dto';

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
    async create(@Body() body: VenmasEntity, @User() user: UserDto) {
        await this._crudCall(this.venmasService.create({
            body
        } as Partial<VenmasEntity>), StatusCodes.InternalServerError, 'cannot_create_venmas_entity');
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
    async update(@Body() body: VenmasEntity, @Param('venmasId') venmasId: string, @User() user: UserDto) {
        await this._crudCall(this.venmasService.update({
            id: venmasId
        }, {
            body
        } as Partial<VenmasEntity>), StatusCodes.InternalServerError, 'cannot_update_venmas_entity');
    }

    /**
     * Remove venmas entity
     *
     * @param venmasId
     * @param user
     */
    @Post('/delete/:venmasId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async delete(@Param('venmasId') venmasId: string, @User() user: UserDto) {
        await this._crudCall(this.venmasService.delete({
            id: venmasId
        }), StatusCodes.InternalServerError, 'cannot_delete_venmas_entity');
    }

    /**
     * Search venmas entity
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
    async search(@Body() body: VenmasCreateInputDto, @User() user: UserDto) {
        const venmas = await this._search(this.venmasService, body);

        return {
            venmas,
        };
    }

}