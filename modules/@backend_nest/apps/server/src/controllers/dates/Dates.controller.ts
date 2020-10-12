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
import {
    CategoryCreationPayload,
    checkDate,
    DateCreationPayload,
    DatePayload,
    ImagesMetadata,
    TextMetadata,
} from '@common/global';
import { DatesEditInputDto } from '@app/server/controllers/dates/dto/DatesEditInput.dto';
import { DatesEditResponseDto } from '@app/server/controllers/dates/dto/DatesEditResponse.dto';
import { DatesDeleteResponseDto } from '@app/server/controllers/dates/dto/DatesDeleteResponse.dto';
import { isNil, merge, pickBy } from 'lodash';
import { closestCity } from '@common/geoloc';

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

    /**
     * Edits a date
     *
     * @param body
     * @param user
     * @param dateId
     */
    @Put('/:date')
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
    async edit(
        @Body() body: DatesEditInputDto,
        @User() user: UserDto,
        @Param('date') dateId: string,
    ): Promise<DatesEditResponseDto> {
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

        const existingDateCreationValue: DateCreationPayload = {
            info: {
                online: date.online,
                online_link: date.online_link,
                name: date.metadata.name,
                eventBegin: new Date(date.timestamps.event_begin),
                eventEnd: new Date(date.timestamps.event_end),
                location: date.location
                    ? {
                          label: date.location.location_label,
                          lon: date.location.location.lon,
                          lat: date.location.location.lat,
                      }
                    : null,
            },
            textMetadata: {
                name: date.metadata.name,
                description: date.metadata.description,
                twitter: date.metadata.twitter,
                website: date.metadata.website,
                facebook: date.metadata.facebook,
                email: date.metadata.email,
                linked_in: date.metadata.linked_in,
                tiktok: date.metadata.tiktok,
                instagram: date.metadata.instagram,
                spotify: date.metadata.spotify,
            },
            imagesMetadata: {
                avatar: date.metadata.avatar,
                signatureColors: date.metadata.signature_colors as [string, string],
            },
        };

        const identityNotNil = (val: any): boolean => !isNil(val);

        const dateEditionPayload: DateCreationPayload = merge({}, existingDateCreationValue, body.date);
        dateEditionPayload.info = pickBy(dateEditionPayload.info, identityNotNil) as DatePayload;
        dateEditionPayload.textMetadata = pickBy(dateEditionPayload.textMetadata, identityNotNil) as TextMetadata;
        dateEditionPayload.imagesMetadata = pickBy(dateEditionPayload.imagesMetadata, identityNotNil) as ImagesMetadata;

        const checkResult = checkDate(dateEditionPayload);

        if (checkResult !== null) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'date_payload_validation_error',
                },
                StatusCodes.BadRequest,
            );
        }

        const identityNotUndef = (val: any): boolean => val !== undefined;

        const editPayload = pickBy(
            {
                online: dateEditionPayload.info.online,
                online_link: dateEditionPayload.info.online_link,
                location: dateEditionPayload.info.online
                    ? null
                    : {
                          location: {
                              lat: dateEditionPayload.info.location.lat,
                              lon: dateEditionPayload.info.location.lon,
                          },
                          location_label: dateEditionPayload.info.location.label,
                          assigned_city: closestCity(dateEditionPayload.info.location).id,
                      },
                timestamps: {
                    event_begin: new Date(dateEditionPayload.info.eventBegin),
                    event_end: new Date(dateEditionPayload.info.eventEnd),
                },
                metadata: {
                    name: dateEditionPayload.textMetadata.name,
                    description: dateEditionPayload.textMetadata.name,
                    avatar: dateEditionPayload.imagesMetadata.avatar,
                    signature_colors: dateEditionPayload.imagesMetadata.signatureColors,
                    twitter: dateEditionPayload.textMetadata.twitter,
                    spotify: dateEditionPayload.textMetadata.spotify,
                    website: dateEditionPayload.textMetadata.website,
                    facebook: dateEditionPayload.textMetadata.facebook,
                    email: dateEditionPayload.textMetadata.email,
                    linked_in: dateEditionPayload.textMetadata.linked_in,
                    tiktok: dateEditionPayload.textMetadata.tiktok,
                    instagram: dateEditionPayload.textMetadata.instagram,
                },
            },
            identityNotUndef,
        );

        await this._crudCall(
            this.datesService.update(
                {
                    id: dateId,
                },
                editPayload,
            ),
            StatusCodes.InternalServerError,
        );

        const updatedDate = await this._crudCall(this.datesService.findOne(dateId), StatusCodes.InternalServerError);

        return {
            date: updatedDate,
        };
    }

    /**
     * Attempts to delete a date
     *
     * @param user
     * @param dateId
     */
    @Delete('/:date')
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
    async delete(@User() user: UserDto, @Param('date') dateId: string): Promise<DatesDeleteResponseDto> {
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

        if (date.categories.length > 0) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'cannot_delete_date_with_categories',
                },
                StatusCodes.BadRequest,
            );
        } else {
            const event = await this._crudCall(this.eventsService.findOne(date.event), StatusCodes.NotFound);
            const datesList = event.dates.filter((linkedDateId: string): boolean => linkedDateId !== dateId);

            await this._crudCall(
                this.eventsService.update(
                    {
                        id: event.id,
                    },
                    {
                        dates: datesList,
                    },
                ),
                StatusCodes.InternalServerError,
            );

            await this._crudCall(
                this.datesService.delete({
                    id: dateId,
                }),
                StatusCodes.InternalServerError,
            );
        }

        return {};
    }
}
