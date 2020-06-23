import {
    Body,
    Controller,
    HttpCode,
    HttpException,
    Injectable,
    Param,
    Post,
    Put,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { CategoriesSearchInputDto } from '@app/server/controllers/categories/dto/CategoriesSearchInput.dto';
import { CategoriesSearchResponseDto } from '@app/server/controllers/categories/dto/CategoriesSearchResponse.dto';
import { CategoriesCreateInputDto } from '@app/server/controllers/categories/dto/CategoriesCreateInput.dto';
import { CategoriesUpdateInputDto } from '@app/server/controllers/categories/dto/CategoriesUpdateInput.dto';
import { CategoriesCreateResponseDto } from '@app/server/controllers/categories/dto/CategoriesCreateResponse.dto';
import { CategoriesUpdateResponseDto } from '@app/server/controllers/categories/dto/CategoriesUpdateResponse.dto';
import { RightsService } from '@lib/common/rights/Rights.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { serialize } from '@common/global';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';
import { CurrenciesService, Price } from '@lib/common/currencies/Currencies.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { isFutureDateRange } from '@common/global/lib/utils';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { MetadatasService } from '@lib/common/metadatas/Metadatas.service';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import { CategoriesCountInputDto } from '@app/server/controllers/categories/dto/CategoriesCountInput.dto';
import { CategoriesCountResponseDto } from '@app/server/controllers/categories/dto/CategoriesCountResponse.dto';

/**
 * Generic Categories controller. Recover Categories linked to all types of events
 */
@Injectable()
@ApiBearerAuth()
@ApiTags('categories')
@Controller('categories')
export class CategoriesController extends ControllerBasics<CategoryEntity> {
    /**
     * Dependency Injection
     *
     * @param categoriesService
     * @param rightsService
     * @param configService
     * @param currenciesService
     * @param metadatasService
     */
    constructor(
        private readonly categoriesService: CategoriesService,
        private readonly rightsService: RightsService,
        private readonly configService: ConfigService,
        private readonly currenciesService: CurrenciesService,
        private readonly metadatasService: MetadatasService,
    ) {
        super();
    }

    /**
     * Search for categories
     *
     * @param body
     */
    @Post('/search')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized])
    async search(@Body() body: CategoriesSearchInputDto): Promise<CategoriesSearchResponseDto> {
        await this._authorizeGlobal(this.rightsService, this.categoriesService, null, null, ['route_search']);

        const categories = await this._search(this.categoriesService, body);

        return {
            categories,
        };
    }

    /**
     * Count for categories
     *
     * @param body
     */
    @Post('/count')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized])
    async count(@Body() body: CategoriesCountInputDto): Promise<CategoriesCountResponseDto> {
        await this._authorizeGlobal(this.rightsService, this.categoriesService, null, null, ['route_search']);

        const categories = await this._count(this.categoriesService, body);

        return {
            categories,
        };
    }

    /**
     * Create a new Category
     *
     * @param body
     * @param user
     */
    @Post('/')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.Created)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.Created, StatusCodes.Conflict, StatusCodes.BadRequest, StatusCodes.InternalServerError])
    async create(@Body() body: CategoriesCreateInputDto, @User() user: UserDto): Promise<CategoriesCreateResponseDto> {
        await this._authorizeGlobal(this.rightsService, this.categoriesService, user, body.group_id, ['route_create']);

        const scope = this.configService.get('TICKETFORGE_SCOPE');
        const categoryName = serialize(body.display_name);

        const categories = await this._elasticGet<CategoryEntity>(this.categoriesService, {
            group_id: {
                $eq: body.group_id,
            },
            category_name: {
                $eq: categoryName,
            },
        } as SortablePagedSearch);

        if (categories.length !== 0) {
            throw new HttpException(
                {
                    status: StatusCodes.Conflict,
                    message: 'category_name_conflict',
                },
                StatusCodes.Conflict,
            );
        }

        const pricesResolverRes = await this.currenciesService.resolveInputPrices(body.prices);

        if (pricesResolverRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: pricesResolverRes.error,
                },
                StatusCodes.BadRequest,
            );
        }

        if (!isFutureDateRange(new Date(body.sale_begin), new Date(body.sale_end))) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_sale_dates',
                },
                StatusCodes.BadRequest,
            );
        }

        if (!isFutureDateRange(new Date(body.resale_begin), new Date(body.resale_end))) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_resale_dates',
                },
                StatusCodes.BadRequest,
            );
        }

        const categoryEntity: CategoryEntity = await this._new<CategoryEntity>(this.categoriesService, {
            group_id: body.group_id,
            category_name: categoryName,
            display_name: body.display_name,
            sale_begin: body.sale_begin,
            sale_end: body.sale_end,
            resale_begin: body.resale_begin,
            resale_end: body.resale_end,
            scope,
            prices: pricesResolverRes.response,
            seats: body.seats,
            reserved: 0,
        });

        await this._serviceCall(
            this.metadatasService.attach(
                'history',
                'create',
                [
                    {
                        type: 'category',
                        id: categoryEntity.id,
                        field: 'id',
                        rightId: categoryEntity.group_id,
                        rightField: 'group_id',
                    },
                ],
                [
                    {
                        type: 'category',
                        id: body.group_id,
                        field: 'group_id',
                    },
                ],
                [],
                {
                    date: {
                        at: new Date(Date.now()),
                    },
                },
                user,
                this.categoriesService,
            ),
            StatusCodes.InternalServerError,
        );

        return {
            category: categoryEntity,
        };
    }

    /**
     * Update a Category
     *
     * @param body
     * @param categoryId
     * @param user
     */
    @Put('/:categoryId')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([
        StatusCodes.OK,
        StatusCodes.Unauthorized,
        StatusCodes.BadRequest,
        StatusCodes.Conflict,
        StatusCodes.InternalServerError,
    ])
    async update(
        @Body() body: CategoriesUpdateInputDto,
        @Param('categoryId') categoryId: string,
        @User() user: UserDto,
    ): Promise<CategoriesUpdateResponseDto> {
        const categoryEntity: CategoryEntity = await this._authorizeOne(
            this.rightsService,
            this.categoriesService,
            user,
            {
                id: categoryId,
            },
            'group_id',
            ['route_update'],
        );

        if (
            !isFutureDateRange(
                body.sale_begin ? new Date(body.sale_begin) : categoryEntity.sale_begin,
                body.sale_end ? new Date(body.sale_end) : categoryEntity.sale_end,
            )
        ) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_sale_dates',
                },
                StatusCodes.BadRequest,
            );
        }

        if (
            !isFutureDateRange(
                body.resale_begin ? new Date(body.resale_begin) : categoryEntity.resale_begin,
                body.resale_end ? new Date(body.resale_end) : categoryEntity.resale_end,
            )
        ) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_resale_dates',
                },
                StatusCodes.BadRequest,
            );
        }

        let newPrices: Price[] = [];

        if (body.prices) {
            const pricesResolverRes = await this.currenciesService.resolveInputPrices(body.prices);

            if (pricesResolverRes.error) {
                throw new HttpException(
                    {
                        status: StatusCodes.BadRequest,
                        message: pricesResolverRes.error,
                    },
                    StatusCodes.BadRequest,
                );
            }

            newPrices = pricesResolverRes.response;
        }

        await this._edit<CategoryEntity>(
            this.categoriesService,
            {
                id: categoryId,
            },
            {
                ...body,
                prices: body.prices ? newPrices : categoryEntity.prices,
            },
        );

        await this._serviceCall(
            this.metadatasService.attach(
                'history',
                'update',
                [
                    {
                        type: 'category',
                        id: categoryEntity.id,
                        field: 'id',
                        rightId: categoryEntity.group_id,
                        rightField: 'group_id',
                    },
                ],
                [
                    {
                        type: 'category',
                        id: categoryEntity.group_id,
                        field: 'group_id',
                    },
                ],
                [],
                {
                    date: {
                        at: new Date(Date.now()),
                    },
                },
                user,
                this.categoriesService,
            ),
            StatusCodes.InternalServerError,
        );

        return {
            category: {
                ...categoryEntity,
                ...body,
                prices: body.prices ? newPrices : categoryEntity.prices,
            },
        };
    }
}
