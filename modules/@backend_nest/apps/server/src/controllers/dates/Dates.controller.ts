import { Body, Controller, HttpCode, HttpException, Param, Post, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { DatesService } from '@lib/common/dates/Dates.service';
import { DatesSearchResponseDto } from '@app/server/controllers/dates/dto/DatesSearchResponse.dto';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { DatesSearchInputDto } from '@app/server/controllers/dates/dto/DatesSearchInput.dto';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { DatesCountResponseDto } from '@app/server/controllers/dates/dto/DatesCountResponse.dto';
import { DatesCountInputDto } from '@app/server/controllers/dates/dto/DatesCountInput.dto';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { DatesHomeSearchInputDto } from '@app/server/controllers/dates/dto/DatesHomeSearchInput.dto';
import { DatesHomeSearchResponseDto } from '@app/server/controllers/dates/dto/DatesHomeSearchResponse.dto';
import { TimeToolService } from '@lib/common/toolbox/Time.tool.service';
import { HOUR } from '@lib/common/utils/time';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';
import { ESSearchHit } from '@lib/common/utils/ESSearchReturn.type';
import { fromES } from '@lib/common/utils/fromES.helper';
import { DatesFuzzySearchInputDto } from '@app/server/controllers/dates/dto/DatesFuzzySearchInput.dto';
import { DatesFuzzySearchResponseDto } from '@app/server/controllers/dates/dto/DatesFuzzySearchResponse.dto';
import { SearchInputType } from '@lib/common/utils/SearchInput.type';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { AuthGuard } from '@nestjs/passport';
import { DatesAddCategoryInputDto } from '@app/server/controllers/dates/dto/DatesAddCategoryInput.dto';
import { DatesAddCategoryResponseDto } from '@app/server/controllers/dates/dto/DatesAddCategoryResponse.dto';
import { EventsService } from '@lib/common/events/Events.service';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { UUIDToolService } from '@lib/common/toolbox/UUID.tool.service';
import { CategoryCreationPayload } from '@common/global';

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
     * @param timeToolService
     * @param uuidToolService
     * @param eventsService
     * @param categoriesService
     */
    constructor(
        private readonly datesService: DatesService,
        private readonly timeToolService: TimeToolService,
        private readonly uuidToolService: UUIDToolService,
        private readonly eventsService: EventsService,
        private readonly categoriesService: CategoriesService,
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
        const now = this.timeToolService.now().getTime();
        const hour = now - (now % HOUR);

        const query = this._esQueryBuilder<DateEntity>({
            status: {
                $eq: 'live',
            },
            parent_type: {
                $eq: 'event',
            },
        } as SortablePagedSearch);

        query.body.query.bool.must = [
            ...query.body.query.bool.must,
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
                        double time = (doc['timestamps.event_end'].getValue().toInstant().toEpochMilli() - params.now) / 3600000;
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
        const now = this.timeToolService.now().getTime();
        const hour = now - (now % HOUR);

        const query = this._esQueryBuilder<DateEntity>({
            status: {
                $eq: 'live',
            },
            parent_type: {
                $eq: 'event',
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
        const dates = await this._search(this.datesService, (body as unknown) as SearchInputType<DateEntity>);

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
        const dates = await this._count(this.datesService, (body as unknown) as SearchInputType<DateEntity>);

        return {
            dates,
        };
    }

    private async isDateOwner(date: DateEntity, user: UserDto): Promise<boolean> {
        const event = await this._serviceCall(this.eventsService.findOne(date.event), StatusCodes.InternalServerError);

        return event.owner === user.id;
    }

    /**
     * Creates a category for a specific date
     *
     * @param body
     * @param user
     * @param dateId
     */
    @Post('/:date/category')
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
    async addCategory(
        @Body() body: DatesAddCategoryInputDto,
        @User() user: UserDto,
        @Param('date') dateId: string,
    ): Promise<DatesAddCategoryResponseDto> {
        const date = await this._crudCall(this.datesService.findOne(dateId), StatusCodes.NotFound);

        if (!(await this.isDateOwner(date, user))) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'not_date_owner',
                },
                StatusCodes.Unauthorized,
            );
        }

        const category: CategoryCreationPayload = body.category;

        const categoryId = this.uuidToolService.generate();

        const categoryEntity = await this._crudCall(
            this.categoriesService.create({
                id: categoryId,
                group_id: date.group_id,
                category_name: categoryId,
                display_name: category.name,
                sale_begin: category.saleBegin,
                sale_end: category.saleEnd,
                price: category.price,
                currency: category.currency,
                interface: CategoriesService.interfaceFromCurrencyAndPrice(category.currency, category.price),
                seats: category.seats,
                status: 'preview',
            }),
            StatusCodes.InternalServerError,
        );

        await this._crudCall(this.datesService.addCategory(dateId, categoryEntity), StatusCodes.InternalServerError);

        return {
            category: {
                ...categoryEntity,
                dates: [dateId],
            },
        };
    }
}
