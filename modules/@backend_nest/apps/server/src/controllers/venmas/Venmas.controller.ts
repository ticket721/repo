import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { VenmasEntity } from '@lib/common/venmas/entities/Venmas.entity';
import { VenmasService } from '@lib/common/venmas/Venmas.service';
import {
    Body,
    Controller,
    Get,
    HttpCode,
    Injectable,
    Param,
    Post,
    UseFilters,
    UseGuards,
    HttpException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { VenmasSearchInputDto } from '@app/server/controllers/venmas/dto/VenmasSearchInput.dto';
import { VenmasSearchResponseDto } from '@app/server/controllers/venmas/dto/VenmasSearchResponse.dto';
import { VenmasCreateInputDto } from '@app/server/controllers/venmas/dto/VenmasCreateInput.dto';
import { SearchInputType } from '@lib/common/utils/SearchInput.type';
import { UUIDToolService } from '@lib/common/toolbox/UUID.tool.service';
import { VenmasUpdateResponseDto } from '@app/server/controllers/venmas/dto/VenmasUpdateResponse.dto';
import { CategoriesService } from '@lib/common/categories/Categories.service';

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
     * @param uuidToolService
     */
    constructor(private readonly venmasService: VenmasService, private readonly uuidToolService: UUIDToolService) {
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
    async create(@Body() body: VenmasCreateInputDto, @User() user: UserDto) {
        const venmas: Partial<VenmasEntity> = {
            ...body,
            owner: user.id,
        };

        await this._crudCall(
            this.venmasService.create(venmas),
            StatusCodes.InternalServerError,
            'cannot_create_venmas_entity',
        );
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
    async update(
        @Body() body: VenmasEntity,
        @Param('venmasId') venmasId: string,
        @User() user: UserDto,
    ): Promise<VenmasUpdateResponseDto> {
        const venmasToUpdate = await this._crudCall(
            this.venmasService.findOne(venmasId),
            StatusCodes.InternalServerError,
        );

        if (venmasToUpdate.owner !== user.id) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'not_venmas_entity_owner',
                },
                StatusCodes.Unauthorized,
            );
        }

        await this._crudCall(
            this.venmasService.update(
                {
                    id: venmasId,
                },
                {
                    ...body,
                    updated_at: new Date(Date.now()),
                } as Partial<VenmasEntity>,
            ),
            StatusCodes.InternalServerError,
            'cannot_update_venmas_entity',
        );

        const venmasUpdatedEntity = await this._crudCall(
            this.venmasService.findOne(venmasId),
            StatusCodes.InternalServerError,
        );

        return {
            venmas: venmasUpdatedEntity,
        };
    }

    /**
     * Remove venmas entity
     *
     * @param venmasId
     * @param user
     */
    @Get('/delete/:venmasId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async delete(@Param('venmasId') venmasId: string, @User() user: UserDto): Promise<VenmasUpdateResponseDto> {
        const venmasToDelete = await this._crudCall(
            this.venmasService.findOne(venmasId),
            StatusCodes.InternalServerError,
        );

        if (venmasToDelete.owner !== user.id) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'not_venmas_entity_owner',
                },
                StatusCodes.Unauthorized,
            );
        }

        await this._crudCall(
            this.venmasService.delete({
                id: venmasId,
            }),
            StatusCodes.InternalServerError,
            'cannot_delete_venmas_entity',
        );

        const venmasDeletedEntity = await this._crudCall(
            this.venmasService.findOne(venmasId),
            StatusCodes.InternalServerError,
        );

        return {
            venmas: venmasDeletedEntity,
        };
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
    async search(@Body() body: VenmasSearchInputDto, @User() user: UserDto): Promise<VenmasSearchResponseDto> {
        const venmas = await this._search(this.venmasService, {
            ...body,
            owner: {
                $eq: user.id,
            },
        } as SearchInputType<VenmasEntity>);

        return {
            venmas,
        };
    }
}
