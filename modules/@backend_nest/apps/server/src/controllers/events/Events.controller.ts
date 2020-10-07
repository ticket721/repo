import { Body, Controller, HttpCode, Post, UseFilters, UseGuards } from '@nestjs/common';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { EventsService } from '@lib/common/events/Events.service';
import { EventsSearchInputDto } from '@app/server/controllers/events/dto/EventsSearchInput.dto';
import { EventsSearchResponseDto } from '@app/server/controllers/events/dto/EventsSearchResponse.dto';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { EventsBuildResponseDto } from '@app/server/controllers/events/dto/EventsBuildResponse.dto';
import { EventsBuildInputDto } from '@app/server/controllers/events/dto/EventsBuildInput.dto';
import { checkEvent, getT721ControllerGroupID, toAcceptedAddressFormat } from '@common/global';
import { DatesService } from '@lib/common/dates/Dates.service';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { RightsService } from '@lib/common/rights/Rights.service';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import { EventsCountInputDto } from '@app/server/controllers/events/dto/EventsCountInput.dto';
import { EventsCountResponseDto } from '@app/server/controllers/events/dto/EventsCountResponse.dto';
import { UUIDToolService } from '@lib/common/toolbox/UUID.tool.service';
import { RocksideCreateEOAResponse, RocksideService } from '@lib/common/rockside/Rockside.service';
import { closestCity } from '@common/geoloc';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { CategoriesService } from '@lib/common/categories/Categories.service';

/**
 * Events controller to create and fetch events
 */
@ApiBearerAuth()
@ApiTags('events')
@Controller('events')
export class EventsController extends ControllerBasics<EventEntity> {
    /**
     * Dependency Injection
     *
     * @param eventsService
     * @param datesService
     * @param categoriesService
     * @param rightsService
     * @param uuidToolsService
     * @param rocksideService
     */
    constructor(
        private readonly eventsService: EventsService,
        private readonly datesService: DatesService,
        private readonly categoriesService: CategoriesService,
        private readonly rightsService: RightsService,
        private readonly uuidToolsService: UUIDToolService,
        private readonly rocksideService: RocksideService,
    ) {
        super();
    }

    /**
     * Search for events
     *
     * @param body
     */
    @Post('/search')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    async search(@Body() body: EventsSearchInputDto): Promise<EventsSearchResponseDto> {
        await this._authorizeGlobal(this.rightsService, this.eventsService, null, null, ['route_search']);

        const events = await this._search(this.eventsService, body);

        return {
            events,
        };
    }

    /**
     * Count for events
     *
     * @param body
     */
    @Post('/count')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    async count(@Body() body: EventsCountInputDto): Promise<EventsCountResponseDto> {
        await this._authorizeGlobal(this.rightsService, this.eventsService, null, null, ['route_search']);

        const events = await this._count(this.eventsService, body);

        return {
            events,
        };
    }

    // /**
    //  * Starts a preview event and its dates
    //  *
    //  * @param body
    //  * @param user
    //  */
    // @Post('/start')
    // @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    // @UseFilters(new HttpExceptionFilter())
    // @HttpCode(StatusCodes.OK)
    // @Roles('authenticated')
    // @ApiResponses([
    //     StatusCodes.OK,
    //     StatusCodes.NotFound,
    //     StatusCodes.Unauthorized,
    //     StatusCodes.BadRequest,
    //     StatusCodes.InternalServerError,
    // ])
    // async start(@Body() body: EventsStartInputDto, @User() user: UserDto): Promise<EventsStartResponseDto> {
    //     const eventEntity = await this._authorizeOne(
    //         this.rightsService,
    //         this.eventsService,
    //         user,
    //         {
    //             id: body.event,
    //         },
    //         'group_id',
    //         ['admin'],
    //     );
    //
    //     if (!body.dates) {
    //         body.dates = eventEntity.dates;
    //     } else {
    //         for (const date of body.dates) {
    //             if (
    //                 eventEntity.dates.findIndex((value: string): boolean => {
    //                     return uuidEq(value, date);
    //                 }) === -1
    //             ) {
    //                 throw new HttpException(
    //                     {
    //                         status: StatusCodes.BadRequest,
    //                         message: 'specified_date_not_in_event',
    //                     },
    //                     StatusCodes.BadRequest,
    //                 );
    //             }
    //         }
    //     }
    //
    //     for (const date of body.dates) {
    //         await this._edit<DateEntity>(
    //             this.datesService,
    //             {
    //                 id: date,
    //             },
    //             {
    //                 status: 'live',
    //             },
    //         );
    //     }
    //
    //     return {
    //         event: eventEntity,
    //     };
    // }

    private async createDates(body: EventsBuildInputDto, event: EventEntity): Promise<DateEntity[]> {
        const dates: DateEntity[] = [];

        for (const date of body.eventPayload.datesConfiguration) {
            const dateEntity = await this._crudCall(
                this.datesService.createDate({
                    group_id: event.group_id,
                    status: 'preview',
                    categories: [],
                    location: {
                        location: {
                            lat: date.location.lat,
                            lon: date.location.lon,
                        },
                        location_label: date.location.label,
                        assigned_city: closestCity(date.location).id,
                    },
                    timestamps: {
                        event_begin: new Date(date.eventBegin),
                        event_end: new Date(date.eventEnd),
                    },
                    metadata: {
                        name: date.name,
                        description: body.eventPayload.textMetadata.name,
                        avatar: body.eventPayload.imagesMetadata.avatar,
                        signature_colors: body.eventPayload.imagesMetadata.signatureColors,
                        twitter: body.eventPayload.textMetadata.twitter,
                        spotify: body.eventPayload.textMetadata.spotify,
                        website: body.eventPayload.textMetadata.website,
                        facebook: body.eventPayload.textMetadata.facebook,
                        email: body.eventPayload.textMetadata.email,
                        linked_in: body.eventPayload.textMetadata.linked_in,
                        tiktok: body.eventPayload.textMetadata.tiktok,
                        instagram: body.eventPayload.textMetadata.instagram,
                    },
                }),
                StatusCodes.InternalServerError,
            );

            await this._crudCall(this.eventsService.addDate(event.id, dateEntity), StatusCodes.InternalServerError);

            dates.push({
                ...dateEntity,
                event: event.id,
            });
        }

        return dates;
    }

    private static interfaceFromCurrencyAndPrice(currency: string, price: number): 'stripe' | 'none' {
        switch (currency) {
            case 'FREE': {
                return 'none';
            }
            default: {
                return 'stripe';
            }
        }
    }

    private async createCategories(
        body: EventsBuildInputDto,
        event: EventEntity,
        dates: DateEntity[],
    ): Promise<CategoryEntity[]> {
        const categories: CategoryEntity[] = [];

        for (const category of body.eventPayload.categoriesConfiguration) {
            const categoryId = this.uuidToolsService.generate();

            const categoryEntity = await this._crudCall(
                this.categoriesService.create({
                    id: categoryId,
                    group_id: event.group_id,
                    category_name: categoryId,
                    display_name: category.name,
                    sale_begin: category.saleBegin,
                    sale_end: category.saleEnd,
                    price: category.price,
                    currency: category.currency,
                    interface: EventsController.interfaceFromCurrencyAndPrice(category.currency, category.price),
                    seats: category.seats,
                    status: 'preview',
                }),
                StatusCodes.InternalServerError,
            );

            for (const dateIdx of category.dates) {
                await this._crudCall(
                    this.datesService.addCategory(dates[dateIdx].id, categoryEntity),
                    StatusCodes.InternalServerError,
                );
            }

            categories.push({
                ...categoryEntity,
                dates: category.dates.map((idx: number) => dates[idx].id),
            });
        }

        return categories;
    }

    /**
     * Converts a completed actionset into an Event entity. In preview mode.
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
    async create(@Body() body: EventsBuildInputDto, @User() user: UserDto): Promise<EventsBuildResponseDto> {
        const checkResult = checkEvent(body.eventPayload);

        if (checkResult) {
            return {
                error: checkResult,
            };
        }

        // Generate Event ID
        const eventId = this.uuidToolsService.generate();

        // Generate Ethereum Identity
        const rocksideEOA = await this._serviceCall<RocksideCreateEOAResponse>(
            this.rocksideService.createEOA(),
            StatusCodes.InternalServerError,
        );

        // Compute address and groupId
        const eventAddress = toAcceptedAddressFormat(rocksideEOA.address);
        const groupId = getT721ControllerGroupID(eventId, eventAddress);

        const event = await this._crudCall<EventEntity>(
            this.eventsService.create({
                id: eventId,
                status: 'preview',
                group_id: groupId,
                owner: user.id,
                name: body.eventPayload.textMetadata.name,
                avatar: body.eventPayload.imagesMetadata.avatar,
                description: body.eventPayload.textMetadata.description,
                address: eventAddress,
                controller: eventAddress,
                dates: [],
            }),
            StatusCodes.InternalServerError,
        );

        const dates: DateEntity[] = await this.createDates(body, event);
        await this.createCategories(body, event, dates);

        return {
            error: null,
            event: {
                ...event,
                dates: dates.map((date: DateEntity) => date.id),
            },
        };
    }

    // /**
    //  * Edits an Event Entity
    //  *
    //  * @param body
    //  * @param eventId
    //  * @param user
    //  */
    // @Put('/:eventId')
    // @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    // @UseFilters(new HttpExceptionFilter())
    // @HttpCode(StatusCodes.OK)
    // @Roles('authenticated')
    // @ApiResponses([StatusCodes.OK, StatusCodes.NotFound, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    // async update(
    //     @Body() body: EventsUpdateInputDto,
    //     @Param('eventId') eventId: string,
    //     @User() user: UserDto,
    // ): Promise<EventsUpdateResponseDto> {
    //     const event: EventEntity = await this._authorizeOne(
    //         this.rightsService,
    //         this.eventsService,
    //         user,
    //         {
    //             id: eventId,
    //         },
    //         'group_id',
    //         ['route_update_metadata'],
    //     );
    //
    //     await this._edit<EventEntity>(
    //         this.eventsService,
    //         {
    //             id: eventId,
    //         },
    //         body,
    //     );
    //
    //     await this._serviceCall(
    //         this.metadatasService.attach(
    //             'history',
    //             'update',
    //             [
    //                 {
    //                     type: 'event',
    //                     id: event.id,
    //                     field: 'id',
    //                     rightId: event.group_id,
    //                     rightField: 'group_id',
    //                 },
    //             ],
    //             [
    //                 {
    //                     type: 'event',
    //                     id: event.group_id,
    //                     field: 'group_id',
    //                 },
    //             ],
    //             [],
    //             {
    //                 date: {
    //                     at: new Date(Date.now()),
    //                 },
    //             },
    //             user,
    //             this.eventsService,
    //         ),
    //         StatusCodes.InternalServerError,
    //     );
    //
    //     return {
    //         event: {
    //             ...event,
    //             ...body,
    //         },
    //     };
    // }
    //
    // /**
    //  * Deletes a category from the event
    //  *
    //  * @param body
    //  * @param eventId
    //  * @param user
    //  */
    // @Delete('/:eventId/categories')
    // @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    // @UseFilters(new HttpExceptionFilter())
    // @HttpCode(StatusCodes.OK)
    // @Roles('authenticated')
    // @ApiResponses([StatusCodes.OK, StatusCodes.NotFound, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    // async deleteCategories(
    //     @Body() body: EventsDeleteCategoriesInputDto,
    //     @Param('eventId') eventId: string,
    //     @User() user: UserDto,
    // ): Promise<EventsDeleteCategoriesResponseDto> {
    //     const entity: EventEntity = await this._authorizeOne(
    //         this.rightsService,
    //         this.eventsService,
    //         user,
    //         {
    //             id: eventId,
    //         },
    //         'group_id',
    //         ['route_delete_categories'],
    //     );
    //
    //     const finalCategories: string[] = [];
    //
    //     for (const category of entity.categories) {
    //         if (body.categories.findIndex((catToDelete: string): boolean => uuidEq(catToDelete, category)) === -1) {
    //             finalCategories.push(category);
    //         }
    //     }
    //
    //     if (finalCategories.length !== entity.categories.length - body.categories.length) {
    //         throw new HttpException(
    //             {
    //                 status: StatusCodes.NotFound,
    //                 message: 'categories_not_found',
    //             },
    //             StatusCodes.NotFound,
    //         );
    //     }
    //
    //     await this._edit<EventEntity>(
    //         this.eventsService,
    //         {
    //             id: entity.id,
    //         },
    //         {
    //             categories: finalCategories,
    //         },
    //     );
    //
    //     for (const category of body.categories) {
    //         await this._unbind<CategoryEntity>(this.categoriesService, category);
    //     }
    //
    //     await this._serviceCall(
    //         this.metadatasService.attach(
    //             'history',
    //             'delete_categories',
    //             [
    //                 {
    //                     type: 'event',
    //                     id: entity.id,
    //                     field: 'id',
    //                     rightId: entity.group_id,
    //                     rightField: 'group_id',
    //                 },
    //             ],
    //             [
    //                 {
    //                     type: 'event',
    //                     id: entity.group_id,
    //                     field: 'group_id',
    //                 },
    //             ],
    //             [],
    //             {
    //                 date: {
    //                     at: new Date(Date.now()),
    //                 },
    //             },
    //             user,
    //             this.eventsService,
    //         ),
    //         StatusCodes.InternalServerError,
    //     );
    //
    //     return {
    //         event: {
    //             ...entity,
    //             categories: finalCategories,
    //         },
    //     };
    // }
    //
    // /**
    //  * Adds a category to the event
    //  *
    //  * @param body
    //  * @param eventId
    //  * @param user
    //  */
    // @Post('/:eventId/categories')
    // @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    // @UseFilters(new HttpExceptionFilter())
    // @HttpCode(StatusCodes.Created)
    // @Roles('authenticated')
    // @ApiResponses([
    //     StatusCodes.Created,
    //     StatusCodes.NotFound,
    //     StatusCodes.Unauthorized,
    //     StatusCodes.InternalServerError,
    // ])
    // async addCategories(
    //     @Body() body: EventsAddCategoriesInputDto,
    //     @Param('eventId') eventId: string,
    //     @User() user: UserDto,
    // ): Promise<EventsAddCategoriesResponseDto> {
    //     const eventEntity: EventEntity = await this._authorizeOne(
    //         this.rightsService,
    //         this.eventsService,
    //         user,
    //         {
    //             id: eventId,
    //         },
    //         'group_id',
    //         ['route_add_categories'],
    //     );
    //
    //     for (const categoryId of body.categories) {
    //         if (eventEntity.categories.findIndex((ec: string): boolean => uuidEq(ec, categoryId)) !== -1) {
    //             throw new HttpException(
    //                 {
    //                     status: StatusCodes.Conflict,
    //                     message: 'category_already_in_event',
    //                 },
    //                 StatusCodes.Conflict,
    //             );
    //         }
    //
    //         const category: CategoryEntity = await this._getOne<CategoryEntity>(this.categoriesService, {
    //             id: categoryId,
    //         });
    //
    //         if (this.categoriesService.isBound(category)) {
    //             throw new HttpException(
    //                 {
    //                     status: StatusCodes.BadRequest,
    //                     message: 'category_already_bound',
    //                 },
    //                 StatusCodes.BadRequest,
    //             );
    //         }
    //
    //         if (category.group_id !== eventEntity.group_id) {
    //             throw new HttpException(
    //                 {
    //                     status: StatusCodes.BadRequest,
    //                     message: 'group_id_not_matching',
    //                 },
    //                 StatusCodes.BadRequest,
    //             );
    //         }
    //
    //         eventEntity.categories.push(categoryId);
    //     }
    //
    //     await this._edit<EventEntity>(
    //         this.eventsService,
    //         {
    //             id: eventId,
    //         },
    //         {
    //             categories: eventEntity.categories,
    //         },
    //     );
    //
    //     for (const categoryId of body.categories) {
    //         await this._bind<CategoryEntity>(this.categoriesService, categoryId, 'event', eventId);
    //     }
    //
    //     await this._serviceCall(
    //         this.metadatasService.attach(
    //             'history',
    //             'add_categories',
    //             [
    //                 {
    //                     type: 'event',
    //                     id: eventEntity.id,
    //                     field: 'id',
    //                     rightId: eventEntity.group_id,
    //                     rightField: 'group_id',
    //                 },
    //             ],
    //             [
    //                 {
    //                     type: 'event',
    //                     id: eventEntity.group_id,
    //                     field: 'group_id',
    //                 },
    //             ],
    //             [],
    //             {
    //                 date: {
    //                     at: new Date(Date.now()),
    //                 },
    //             },
    //             user,
    //             this.eventsService,
    //         ),
    //         StatusCodes.InternalServerError,
    //     );
    //
    //     return {
    //         event: eventEntity,
    //     };
    // }
    //
    // /**
    //  * Deletes a date from an event
    //  *
    //  * @param body
    //  * @param eventId
    //  * @param user
    //  */
    // @Delete('/:eventId/dates')
    // @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    // @UseFilters(new HttpExceptionFilter())
    // @HttpCode(StatusCodes.OK)
    // @Roles('authenticated')
    // @ApiResponses([StatusCodes.OK, StatusCodes.NotFound, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    // async deleteDates(
    //     @Body() body: EventsDeleteDatesInputDto,
    //     @Param('eventId') eventId: string,
    //     @User() user: UserDto,
    // ): Promise<EventsDeleteDatesResponseDto> {
    //     const entity: EventEntity = await this._authorizeOne(
    //         this.rightsService,
    //         this.eventsService,
    //         user,
    //         {
    //             id: eventId,
    //         },
    //         'group_id',
    //         ['route_delete_dates'],
    //     );
    //
    //     const finalDates: string[] = [];
    //
    //     for (const date of entity.dates) {
    //         if (body.dates.findIndex((did: string): boolean => uuidEq(did, date)) === -1) {
    //             finalDates.push(date);
    //         }
    //     }
    //
    //     if (finalDates.length === entity.dates.length) {
    //         throw new HttpException(
    //             {
    //                 status: StatusCodes.NotFound,
    //                 message: 'dates_not_found',
    //             },
    //             StatusCodes.NotFound,
    //         );
    //     }
    //
    //     await this._edit<EventEntity>(
    //         this.eventsService,
    //         {
    //             id: eventId,
    //         },
    //         {
    //             dates: finalDates,
    //         },
    //     );
    //
    //     for (const date of body.dates) {
    //         await this._unbind<DateEntity>(this.datesService, date);
    //     }
    //
    //     await this._serviceCall(
    //         this.metadatasService.attach(
    //             'history',
    //             'delete_dates',
    //             [
    //                 {
    //                     type: 'event',
    //                     id: entity.id,
    //                     field: 'id',
    //                     rightId: entity.group_id,
    //                     rightField: 'group_id',
    //                 },
    //             ],
    //             [
    //                 {
    //                     type: 'event',
    //                     id: entity.group_id,
    //                     field: 'group_id',
    //                 },
    //             ],
    //             [],
    //             {
    //                 date: {
    //                     at: new Date(Date.now()),
    //                 },
    //             },
    //             user,
    //             this.eventsService,
    //         ),
    //         StatusCodes.InternalServerError,
    //     );
    //
    //     return {
    //         event: {
    //             ...entity,
    //             dates: finalDates,
    //         },
    //     };
    // }
    //
    // /**
    //  * Adds a date to the event
    //  *
    //  * @param body
    //  * @param eventId
    //  * @param user
    //  */
    // @Post('/:eventId/dates')
    // @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    // @UseFilters(new HttpExceptionFilter())
    // @HttpCode(StatusCodes.Created)
    // @Roles('authenticated')
    // @ApiResponses([
    //     StatusCodes.Created,
    //     StatusCodes.NotFound,
    //     StatusCodes.Unauthorized,
    //     StatusCodes.InternalServerError,
    // ])
    // async addDates(
    //     @Body() body: EventsAddDatesInputDto,
    //     @Param('eventId') eventId: string,
    //     @User() user: UserDto,
    // ): Promise<EventsAddDatesResponseDto> {
    //     const eventEntity: EventEntity = await this._authorizeOne(
    //         this.rightsService,
    //         this.eventsService,
    //         user,
    //         {
    //             id: eventId,
    //         },
    //         'group_id',
    //         ['route_add_dates'],
    //     );
    //
    //     for (const dateId of body.dates) {
    //         if (eventEntity.dates.findIndex((ec: string): boolean => uuidEq(ec, dateId)) !== -1) {
    //             throw new HttpException(
    //                 {
    //                     status: StatusCodes.Conflict,
    //                     message: 'date_already_in_event',
    //                 },
    //                 StatusCodes.Conflict,
    //             );
    //         }
    //
    //         const date: DateEntity = await this._getOne<DateEntity>(this.datesService, {
    //             id: dateId,
    //         });
    //
    //         if (this.datesService.isBound(date)) {
    //             throw new HttpException(
    //                 {
    //                     status: StatusCodes.BadRequest,
    //                     message: 'date_already_bound',
    //                 },
    //                 StatusCodes.BadRequest,
    //             );
    //         }
    //
    //         if (date.group_id !== eventEntity.group_id) {
    //             throw new HttpException(
    //                 {
    //                     status: StatusCodes.BadRequest,
    //                     message: 'group_id_not_matching',
    //                 },
    //                 StatusCodes.BadRequest,
    //             );
    //         }
    //
    //         eventEntity.dates.push(dateId);
    //     }
    //
    //     await this._edit<EventEntity>(
    //         this.eventsService,
    //         {
    //             id: eventId,
    //         },
    //         {
    //             dates: eventEntity.dates,
    //         },
    //     );
    //
    //     for (const dateId of body.dates) {
    //         await this._bind<DateEntity>(this.datesService, dateId, 'event', eventId);
    //     }
    //
    //     await this._serviceCall(
    //         this.metadatasService.attach(
    //             'history',
    //             'delete_dates',
    //             [
    //                 {
    //                     type: 'event',
    //                     id: eventEntity.id,
    //                     field: 'id',
    //                     rightId: eventEntity.group_id,
    //                     rightField: 'group_id',
    //                 },
    //             ],
    //             [
    //                 {
    //                     type: 'event',
    //                     id: eventEntity.group_id,
    //                     field: 'group_id',
    //                 },
    //             ],
    //             [],
    //             {
    //                 date: {
    //                     at: new Date(Date.now()),
    //                 },
    //             },
    //             user,
    //             this.eventsService,
    //         ),
    //         StatusCodes.InternalServerError,
    //     );
    //
    //     return {
    //         event: eventEntity,
    //     };
    // }

    // /**
    //  * Withdraw tokens from the t721controller
    //  *
    //  * @param body
    //  * @param eventId
    //  * @param user
    //  */
    // @Post('/:eventId/withdraw')
    // @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    // @UseFilters(new HttpExceptionFilter())
    // @HttpCode(StatusCodes.Created)
    // @Roles('authenticated')
    // @ApiResponses([
    //     StatusCodes.Created,
    //     StatusCodes.NotFound,
    //     StatusCodes.Unauthorized,
    //     StatusCodes.InternalServerError,
    // ])
    // async withdraw(
    //     @Body() body: EventsWithdrawInputDto,
    //     @Param('eventId') eventId: string,
    //     @User() user: UserDto,
    // ): Promise<EventsWithdrawResponseDto> {
    //     const eventEntity: EventEntity = await this._authorizeOne(
    //         this.rightsService,
    //         this.eventsService,
    //         user,
    //         {
    //             id: eventId,
    //         },
    //         'group_id',
    //         ['withdraw'],
    //     );
    //
    //     const currency = await this.currenciesService.get(body.currency);
    //
    //     if (currency === undefined) {
    //         throw new HttpException(
    //             {
    //                 status: StatusCodes.NotFound,
    //                 message: 'cannot_find_currency',
    //             },
    //             StatusCodes.NotFound,
    //         );
    //     }
    //
    //     if (currency.type !== 'erc20') {
    //         throw new HttpException(
    //             {
    //                 status: StatusCodes.Forbidden,
    //                 message: 'invalid_currency_to_withdraw',
    //             },
    //             StatusCodes.Forbidden,
    //         );
    //     }
    //
    //     const erc20Currency: ERC20Currency = currency as ERC20Currency;
    //     const groupId = eventEntity.group_id;
    //
    //     const balance = await this._serviceCall(
    //         contractCallHelper(
    //             await this.t721ControllerV0Service.get(),
    //             'balanceOf',
    //             {},
    //             groupId,
    //             erc20Currency.address,
    //         ),
    //         StatusCodes.InternalServerError,
    //         'cannot_retrieve_balance',
    //     );
    //
    //     if (BigInt(balance.toString()) < BigInt(body.amount)) {
    //         throw new HttpException(
    //             {
    //                 status: StatusCodes.Forbidden,
    //                 message: 'requested_amount_too_high',
    //             },
    //             StatusCodes.Forbidden,
    //         );
    //     }
    //
    //     const txSeq = await this._serviceCall(
    //         this.authorizationsService.generateEventWithdrawAuthorizationAndTransactionSequence(
    //             user,
    //             eventEntity.address,
    //             eventEntity.id.toLowerCase(),
    //             erc20Currency.address,
    //             body.amount,
    //         ),
    //         StatusCodes.InternalServerError,
    //         'cannot_generate_authorization',
    //     );
    //
    //     return {
    //         txSeqId: txSeq.txSeq.id,
    //     };
    // }

    // /**
    //  * Recover guest list for one of multiple dates of an event
    //  *
    //  * @param body
    //  * @param eventId
    //  * @param user
    //  */
    // @Post('/:eventId/guestlist')
    // @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    // @UseFilters(new HttpExceptionFilter())
    // @HttpCode(StatusCodes.Created)
    // @Roles('authenticated')
    // @ApiResponses([
    //     StatusCodes.Created,
    //     StatusCodes.NotFound,
    //     StatusCodes.Unauthorized,
    //     StatusCodes.InternalServerError,
    // ])
    // async guestlist(
    //     @Body() body: EventsGuestlistInputDto,
    //     @Param('eventId') eventId: string,
    //     @User() user: UserDto,
    // ): Promise<EventsGuestlistResponseDto> {
    //     const eventEntity: EventEntity = await this._authorizeOne(
    //         this.rightsService,
    //         this.eventsService,
    //         user,
    //         {
    //             id: eventId,
    //         },
    //         'group_id',
    //         ['owner'],
    //     );
    //
    //     let dateIds: string[];
    //
    //     const dates = await this._search<DateEntity>(this.datesService, {
    //         group_id: {
    //             $eq: eventEntity.group_id,
    //         },
    //         parent_type: {
    //             $eq: 'event',
    //         },
    //         parent_id: {
    //             $eq: eventEntity.id,
    //         },
    //     } as SearchInputType<DateEntity>);
    //
    //     if (body.dateIds.length === 0) {
    //         dateIds = dates.map((d: DateEntity) => d.id);
    //     } else {
    //         for (const date of body.dateIds) {
    //             if (dates.findIndex((d: DateEntity): boolean => d.id === date) === -1) {
    //                 throw new HttpException(
    //                     {
    //                         status: StatusCodes.Forbidden,
    //                         message: 'date_id_not_in_event',
    //                     },
    //                     StatusCodes.Forbidden,
    //                 );
    //             }
    //         }
    //         dateIds = body.dateIds;
    //     }
    //
    //     let ownerships: GuestInfos[] = [];
    //
    //     const dateCategoryEntities = await this._search<CategoryEntity>(this.categoriesService, {
    //         parent_type: {
    //             $eq: 'date',
    //         },
    //         parent_id: {
    //             $in: [...dateIds],
    //         },
    //     } as SearchInputType<CategoryEntity>);
    //
    //     const globalCategoryEntities = await this._search<CategoryEntity>(this.categoriesService, {
    //         parent_type: {
    //             $eq: 'event',
    //         },
    //         parent_id: {
    //             $eq: eventEntity.id,
    //         },
    //     } as SearchInputType<CategoryEntity>);
    //
    //     for (const dateCategory of dateCategoryEntities) {
    //         ownerships = [
    //             ...ownerships,
    //             ...(
    //                 await this._search<MetadataEntity>(this.metadatasService, {
    //                     class_name: {
    //                         $eq: 'ownership',
    //                     },
    //                     type_name: {
    //                         $eq: 'ticket',
    //                     },
    //                     bool_: {
    //                         $eq: {
    //                             valid: true,
    //                         },
    //                     },
    //                     str_: {
    //                         $eq: {
    //                             categoryId: dateCategory.id,
    //                         },
    //                     },
    //                 } as any)
    //             ).map(
    //                 (m: MetadataEntity): GuestInfos => ({
    //                     address: m.str_.address,
    //                     category: m.str_.categoryId,
    //                     username: m.str_.username,
    //                     ticket: m.str_.ticket,
    //                     email: m.str_.email,
    //                 }),
    //             ),
    //         ];
    //     }
    //
    //     for (const globalCategory of globalCategoryEntities) {
    //         ownerships = [
    //             ...ownerships,
    //             ...(
    //                 await this._search<MetadataEntity>(this.metadatasService, {
    //                     class_name: {
    //                         $eq: 'ownership',
    //                     },
    //                     type_name: {
    //                         $eq: 'ticket',
    //                     },
    //                     bool_: {
    //                         $eq: {
    //                             valid: true,
    //                         },
    //                     },
    //                     str_: {
    //                         $eq: {
    //                             categoryId: globalCategory.id,
    //                         },
    //                     },
    //                 } as any)
    //             ).map(
    //                 (m: MetadataEntity): GuestInfos => ({
    //                     address: m.str_.address,
    //                     category: m.str_.categoryId,
    //                     username: m.str_.username,
    //                     ticket: m.str_.ticket,
    //                     email: m.str_.email,
    //                 }),
    //             ),
    //         ];
    //     }
    //
    //     return {
    //         guests: ownerships,
    //     };
    // }
}
