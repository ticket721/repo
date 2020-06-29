import {
    Body,
    Controller,
    Delete,
    HttpCode,
    HttpException,
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
import { DatesService } from '@lib/common/dates/Dates.service';
import { DatesSearchResponseDto } from '@app/server/controllers/dates/dto/DatesSearchResponse.dto';
import { DateEntity, DateLocation } from '@lib/common/dates/entities/Date.entity';
import { DatesSearchInputDto } from '@app/server/controllers/dates/dto/DatesSearchInput.dto';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { DatesCreateInputDto } from '@app/server/controllers/dates/dto/DatesCreateInput.dto';
import { DatesAddCategoriesInputDto } from '@app/server/controllers/dates/dto/DatesAddCategoriesInput.dto';
import { DatesDeleteCategoriesInputDto } from '@app/server/controllers/dates/dto/DatesDeleteCategoriesInput.dto';
import { DatesUpdateInputDto } from '@app/server/controllers/dates/dto/DatesUpdateInput.dto';
import { DatesCreateResponseDto } from '@app/server/controllers/dates/dto/DatesCreateResponse.dto';
import { DatesAddCategoriesResponseDto } from '@app/server/controllers/dates/dto/DatesAddCategoriesResponse.dto';
import { DatesDeleteCategoriesResponseDto } from '@app/server/controllers/dates/dto/DatesDeleteCategoriesResponse.dto';
import { DatesUpdateResponseDto } from '@app/server/controllers/dates/dto/DatesUpdateResponse.dto';
import { DatesCountResponseDto } from '@app/server/controllers/dates/dto/DatesCountResponse.dto';
import { DatesCountInputDto } from '@app/server/controllers/dates/dto/DatesCountInput.dto';
import { RightsService } from '@lib/common/rights/Rights.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { closestCity, uuidEq } from '@common/global';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { isFutureDateRange, isValidDateRange } from '@common/global';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { MetadatasService } from '@lib/common/metadatas/Metadatas.service';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import { DatesHomeSearchInputDto } from '@app/server/controllers/dates/dto/DatesHomeSearchInput.dto';
import { DatesHomeSearchResponseDto } from '@app/server/controllers/dates/dto/DatesHomeSearchResponse.dto';
import { TimeToolService } from '@lib/common/toolbox/Time.tool.service';
import { HOUR } from '@lib/common/utils/time';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';
import { ESSearchHit } from '@lib/common/utils/ESSearchReturn.type';
import { fromES } from '@lib/common/utils/fromES.helper';
import { DatesFuzzySearchInputDto } from '@app/server/controllers/dates/dto/DatesFuzzySearchInput.dto';
import { DatesFuzzySearchResponseDto } from '@app/server/controllers/dates/dto/DatesFuzzySearchResponse.dto';

/**
 * Generic Dates controller. Recover Dates linked to all types of events
 */
@ApiBearerAuth()
@ApiTags('dates')
@Controller('dates')
export class DatesController extends ControllerBasics<DateEntity> {
    /**
     * Dependency Injection
     *
     * @param datesService
     * @param rightsService
     * @param categoriesService
     * @param metadatasService
     * @param timeToolService
     */
    constructor(
        private readonly datesService: DatesService,
        private readonly rightsService: RightsService,
        private readonly categoriesService: CategoriesService,
        private readonly metadatasService: MetadatasService,
        private readonly timeToolService: TimeToolService,
    ) {
        super();
    }

    /**
     * Search for dates
     *
     * @param body
     */
    @Post('/fuzzy-search')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async fuzzySearch(@Body() body: DatesFuzzySearchInputDto): Promise<DatesFuzzySearchResponseDto> {
        await this._authorizeGlobal(this.rightsService, this.datesService, null, null, ['route_search']);

        const now = this.timeToolService.now().getTime();
        const hour = now - (now % HOUR);

        const query = this._esQueryBuilder<DateEntity>({
            status: {
                $eq: 'live',
            },
        } as SortablePagedSearch);

        query.body.query.bool.must = [
            {
                term: query.body.query.bool.must.term,
            },
            {
                multi_match: {
                    fields: ['metadata.name^3', 'metadata.description'],
                    query: body.query,
                    fuzziness: 'AUTO',
                },
            },
        ];

        query.body.sort = [];

        query.body.sort.push({
            _script: {
                script: {
                    source: `
                        double distance = doc['location.location'].arcDistance(params.lat, params.lon) / 1000;
                        double time = (doc['timestamps.event_begin'].getValue().toInstant().toEpochMilli() - params.now) / 3600000;
                        return distance + time;
                    `,
                    params: {
                        now: hour,
                        lon: body.lon,
                        lat: body.lat,
                    },
                    lang: 'painless',
                },
                type: 'number',
                order: 'asc',
            },
        });

        const dates = await this.datesService.searchElastic(query);

        if (dates.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'error_while_fetching_home_dates',
                },
                StatusCodes.InternalServerError,
            );
        }

        const resultDates = dates.response.hits.hits.map(
            (hit: ESSearchHit<DateEntity>): DateEntity => fromES<DateEntity>(hit),
        );

        return {
            dates: resultDates,
        };
    }

    /**
     * Search for dates
     *
     * @param body
     */
    @Post('/home-search')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async homeSearch(@Body() body: DatesHomeSearchInputDto): Promise<DatesHomeSearchResponseDto> {
        await this._authorizeGlobal(this.rightsService, this.datesService, null, null, ['route_search']);

        const now = this.timeToolService.now().getTime();
        const hour = now - (now % HOUR);

        const query = this._esQueryBuilder<DateEntity>({
            status: {
                $eq: 'live',
            },
            'timestamps.event_begin': {
                $gt: hour,
            },
        } as SortablePagedSearch);

        query.body.query.bool.filter = {
            script: {
                script: {
                    source: `
                        double distance = doc['location.location'].arcDistance(params.lat, params.lon) / 1000;
                        return distance < params.maxDistance;
                    `,
                    lang: 'painless',
                    params: {
                        maxDistance: 100,
                        lon: body.lon,
                        lat: body.lat,
                    },
                },
            },
        };

        query.body.sort = [];

        query.body.sort.push({
            _script: {
                script: {
                    source: `
                        double distance = doc['location.location'].arcDistance(params.lat, params.lon) / 1000;
                        double time = (doc['timestamps.event_begin'].getValue().toInstant().toEpochMilli() - params.now) / 3600000;
                        return distance + time;
                    `,
                    params: {
                        now: hour,
                        lon: body.lon,
                        lat: body.lat,
                    },
                    lang: 'painless',
                },
                type: 'number',
                order: 'asc',
            },
        });

        const dates = await this.datesService.searchElastic(query);

        if (dates.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'error_while_fetching_home_dates',
                },
                StatusCodes.InternalServerError,
            );
        }

        const resultDates = dates.response.hits.hits.map(
            (hit: ESSearchHit<DateEntity>): DateEntity => fromES<DateEntity>(hit),
        );

        return {
            dates: resultDates,
        };
    }

    /**
     * Search for dates
     *
     * @param body
     */
    @Post('/search')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async search(@Body() body: DatesSearchInputDto): Promise<DatesSearchResponseDto> {
        await this._authorizeGlobal(this.rightsService, this.datesService, null, null, ['route_search']);

        const dates = await this._search(this.datesService, body);

        return {
            dates,
        };
    }

    /**
     * Count for dates
     *
     * @param body
     */
    @Post('/count')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async count(@Body() body: DatesCountInputDto): Promise<DatesCountResponseDto> {
        await this._authorizeGlobal(this.rightsService, this.datesService, null, null, ['route_search']);

        const dates = await this._count(this.datesService, body);

        return {
            dates,
        };
    }

    /**
     * Creates a Date
     *
     * @param body
     * @param user
     */
    @Post('/')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.Created)
    @Roles('authenticated')
    @ApiResponses([
        StatusCodes.Created,
        StatusCodes.Unauthorized,
        StatusCodes.BadRequest,
        StatusCodes.InternalServerError,
    ])
    async create(@Body() body: DatesCreateInputDto, @User() user: UserDto): Promise<DatesCreateResponseDto> {
        await this._authorizeGlobal(this.rightsService, this.datesService, user, body.group_id, ['route_create']);

        if (!isFutureDateRange(new Date(body.timestamps.event_begin), new Date(body.timestamps.event_end))) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_event_dates',
                },
                StatusCodes.BadRequest,
            );
        }

        const newEntity: DateEntity = await this._new<DateEntity>(this.datesService, {
            ...body,
            location: {
                location: body.location.location,
                location_label: body.location.location_label,
                assigned_city: closestCity(body.location.location).id,
            },
        });

        await this._serviceCall(
            this.metadatasService.attach(
                'history',
                'create',
                [
                    {
                        type: 'date',
                        id: newEntity.id,
                        field: 'id',
                        rightId: newEntity.group_id,
                        rightField: 'group_id',
                    },
                ],
                [
                    {
                        type: 'date',
                        id: newEntity.group_id,
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
                this.datesService,
            ),
            StatusCodes.InternalServerError,
        );

        return {
            date: newEntity,
        };
    }

    /**
     * Adds categories to a Date
     *
     * @param body
     * @param dateId
     * @param user
     */
    @Post('/:dateId/categories')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.Created)
    @Roles('authenticated')
    @ApiResponses([
        StatusCodes.Created,
        StatusCodes.BadRequest,
        StatusCodes.Unauthorized,
        StatusCodes.InternalServerError,
    ])
    async addCategories(
        @Body() body: DatesAddCategoriesInputDto,
        @Param('dateId') dateId: string,
        @User() user: UserDto,
    ): Promise<DatesAddCategoriesResponseDto> {
        const dateEntity: DateEntity = await this._authorizeOne(
            this.rightsService,
            this.datesService,
            user,
            {
                id: dateId,
            },
            'group_id',
            ['route_add_categories'],
        );

        for (const categoryId of body.categories) {
            if (dateEntity.categories.findIndex((ec: string): boolean => uuidEq(ec, categoryId)) !== -1) {
                throw new HttpException(
                    {
                        status: StatusCodes.Conflict,
                        message: 'category_already_in_date',
                    },
                    StatusCodes.Conflict,
                );
            }

            const category: CategoryEntity = await this._getOne<CategoryEntity>(this.categoriesService, {
                id: categoryId,
            });

            if (this.categoriesService.isBound(category)) {
                throw new HttpException(
                    {
                        status: StatusCodes.BadRequest,
                        message: 'category_already_bound',
                    },
                    StatusCodes.BadRequest,
                );
            }

            if (category.group_id !== dateEntity.group_id) {
                throw new HttpException(
                    {
                        status: StatusCodes.BadRequest,
                        message: 'group_id_not_matching',
                    },
                    StatusCodes.BadRequest,
                );
            }

            dateEntity.categories.push(categoryId);
        }

        await this._edit<DateEntity>(
            this.datesService,
            {
                id: dateId,
            },
            {
                categories: dateEntity.categories,
            },
        );

        for (const categoryId of body.categories) {
            await this._bind<CategoryEntity>(this.categoriesService, categoryId, 'date', dateId);
        }

        await this._serviceCall(
            this.metadatasService.attach(
                'history',
                'add_categories',
                [
                    {
                        type: 'date',
                        id: dateEntity.id,
                        field: 'id',
                        rightId: dateEntity.group_id,
                        rightField: 'group_id',
                    },
                ],
                [
                    {
                        type: 'date',
                        id: dateEntity.group_id,
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
                this.datesService,
            ),
            StatusCodes.InternalServerError,
        );

        return {
            date: dateEntity,
        };
    }

    /**
     * Remove Categories from Date
     *
     * @param body
     * @param dateId
     * @param user
     */
    @Delete('/:dateId/categories')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.NotFound, StatusCodes.InternalServerError])
    async deleteCategories(
        @Body() body: DatesDeleteCategoriesInputDto,
        @Param('dateId') dateId: string,
        @User() user: UserDto,
    ): Promise<DatesDeleteCategoriesResponseDto> {
        const entity: DateEntity = await this._authorizeOne(
            this.rightsService,
            this.datesService,
            user,
            {
                id: dateId,
            },
            'group_id',
            ['route_delete_categories'],
        );

        const finalCategories: string[] = [];

        for (const category of entity.categories) {
            if (body.categories.findIndex((catToDelete: string): boolean => uuidEq(catToDelete, category)) === -1) {
                finalCategories.push(category);
            }
        }

        if (finalCategories.length !== entity.categories.length - body.categories.length) {
            throw new HttpException(
                {
                    status: StatusCodes.NotFound,
                    message: 'categories_not_found',
                },
                StatusCodes.NotFound,
            );
        }

        await this._edit<DateEntity>(
            this.datesService,
            {
                id: entity.id,
            },
            {
                categories: finalCategories,
            },
        );

        for (const category of body.categories) {
            await this._unbind<CategoryEntity>(this.categoriesService, category);
        }

        await this._serviceCall(
            this.metadatasService.attach(
                'history',
                'delete_categories',
                [
                    {
                        type: 'date',
                        id: entity.id,
                        field: 'id',
                        rightId: entity.group_id,
                        rightField: 'group_id',
                    },
                ],
                [
                    {
                        type: 'date',
                        id: entity.group_id,
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
                this.datesService,
            ),
            StatusCodes.InternalServerError,
        );

        return {
            date: {
                ...entity,
                categories: finalCategories,
            },
        };
    }

    /**
     * Update Date
     *
     * @param body
     * @param dateId
     * @param user
     */
    @Put('/:dateId')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.BadRequest, StatusCodes.InternalServerError])
    async update(
        @Body() body: DatesUpdateInputDto,
        @Param('dateId') dateId: string,
        @User() user: UserDto,
    ): Promise<DatesUpdateResponseDto> {
        const dateEntity: DateEntity = await this._authorizeOne(
            this.rightsService,
            this.datesService,
            user,
            {
                id: dateId,
            },
            'group_id',
            ['route_update'],
        );

        if (
            !isValidDateRange(
                body.timestamps && body.timestamps.event_begin
                    ? new Date(body.timestamps.event_begin)
                    : dateEntity.timestamps.event_begin,
                body.timestamps && body.timestamps.event_end
                    ? new Date(body.timestamps.event_end)
                    : dateEntity.timestamps.event_end,
            )
        ) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_event_dates',
                },
                StatusCodes.BadRequest,
            );
        }

        if (body.location) {
            body.location = {
                location: body.location.location,
                location_label: body.location.location_label,
                assigned_city: closestCity(body.location.location).id,
            } as DateLocation;
        }

        await this._edit<DateEntity>(
            this.datesService,
            {
                id: dateId,
            },
            {
                ...(body as Partial<Pick<DateEntity, 'timestamps' | 'metadata' | 'location'>>),
            },
        );

        await this._serviceCall(
            this.metadatasService.attach(
                'history',
                'update',
                [
                    {
                        type: 'date',
                        id: dateEntity.id,
                        field: 'id',
                        rightId: dateEntity.group_id,
                        rightField: 'group_id',
                    },
                ],
                [
                    {
                        type: 'date',
                        id: dateEntity.group_id,
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
                this.datesService,
            ),
            StatusCodes.InternalServerError,
        );

        return {
            date: {
                ...dateEntity,
                ...(body as Partial<Pick<DateEntity, 'timestamps' | 'metadata' | 'location'>>),
            },
        };
    }
}
