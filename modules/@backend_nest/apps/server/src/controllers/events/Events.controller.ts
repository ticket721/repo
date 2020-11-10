import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpException,
    Param,
    Post,
    Put,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
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
import {
    checkDate,
    checkEvent,
    DateCreationPayload,
    getT721ControllerGroupID,
    toAcceptedAddressFormat,
} from '@common/global';
import { DatesService } from '@lib/common/dates/Dates.service';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import { EventsCountInputDto } from '@app/server/controllers/events/dto/EventsCountInput.dto';
import { EventsCountResponseDto } from '@app/server/controllers/events/dto/EventsCountResponse.dto';
import { UUIDToolService } from '@lib/common/toolbox/UUID.tool.service';
import { closestCity } from '@common/geoloc';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { EventsAddDateInputDto } from '@app/server/controllers/events/dto/EventsAddDateInput.dto';
import { EventsAddDateResponseDto } from '@app/server/controllers/events/dto/EventsAddDateResponse.dto';
import { SearchInputType } from '@lib/common/utils/SearchInput.type';
import { EventsEditInputDto } from '@app/server/controllers/events/dto/EventsEditInput.dto';
import { EventsEditResponseDto } from '@app/server/controllers/events/dto/EventsEditResponse.dto';
import { EventsBindStripeInterfaceInputDto } from '@app/server/controllers/events/dto/EventsBindStripeInterfaceInput.dto';
import { EventsBindStripeInterfaceResponseDto } from '@app/server/controllers/events/dto/EventsBindStripeInterfaceResponse.dto';
import { StripeInterfacesService } from '@lib/common/stripeinterface/StripeInterfaces.service';
import { EventsStatusInputDto } from '@app/server/controllers/events/dto/EventsStatusInput.dto';
import { EventsStatusResponseDto } from '@app/server/controllers/events/dto/EventsStatusResponse.dto';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { StripeInterfaceEntity } from '@lib/common/stripeinterface/entities/StripeInterface.entity';
import { EventsOwnerResponseDto } from '@app/server/controllers/events/dto/EventsOwnerResponse.dto';

/**
 * Placeholder address
 */
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

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
     * @param uuidToolsService
     * @param stripeInterfacesService
     */
    constructor(
        private readonly eventsService: EventsService,
        private readonly datesService: DatesService,
        private readonly categoriesService: CategoriesService,
        private readonly uuidToolsService: UUIDToolService,
        private readonly stripeInterfacesService: StripeInterfacesService,
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
        const events = await this._search(this.eventsService, body as SearchInputType<EventEntity>);

        return {
            events,
        };
    }

    /**
     * Recover event owner
     *
     * @param eventId
     */
    @Get('/owner/:event')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized])
    async ownerOf(@Param('event') eventId: string): Promise<EventsOwnerResponseDto> {
        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.InternalServerError);

        return {
            owner: event.owner,
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
        const events = await this._count(this.eventsService, body as SearchInputType<EventEntity>);

        return {
            events,
        };
    }

    /**
     * Internal helper to create event dates
     *
     * @param body
     * @param event
     * @private
     */
    private async createDates(body: EventsBuildInputDto, event: EventEntity): Promise<DateEntity[]> {
        const dates: DateEntity[] = [];

        for (const date of body.eventPayload.datesConfiguration) {
            const dateEntity = await this._crudCall(
                this.datesService.createDate({
                    group_id: event.group_id,
                    status: 'preview',
                    categories: [],
                    online: date.online,
                    online_link: date.online_link,
                    location: date.online
                        ? null
                        : {
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

    /**
     * Internal helper to create categories
     *
     * @param body
     * @param event
     * @param dates
     * @private
     */
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
                    interface: CategoriesService.interfaceFromCurrencyAndPrice(category.currency, category.price),
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

                categoryEntity.dates = [...categoryEntity.dates, dates[dateIdx].id];
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

        const rocksideEOA = {
            address: ZERO_ADDRESS,
        };

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
                signature_colors: body.eventPayload.imagesMetadata.signatureColors,
                controller: eventAddress,
                dates: [],
                custom_static_fee: null,
                custom_percent_fee: null,
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

    /**
     * Internal helper to check if user is event owner
     *
     * @param event
     * @param user
     * @private
     */
    private static isEventOwner(event: EventEntity, user: UserDto): boolean {
        return event.owner === user.id;
    }

    /**
     * Add a date to an event
     *
     * @param body
     * @param user
     * @param eventId
     */
    @Post('/:event/date')
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
    async addDate(
        @Body() body: EventsAddDateInputDto,
        @User() user: UserDto,
        @Param('event') eventId: string,
    ): Promise<EventsAddDateResponseDto> {
        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.NotFound);

        if (!EventsController.isEventOwner(event, user)) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'not_event_owner',
                },
                StatusCodes.Unauthorized,
            );
        }

        const checkResult = checkDate(body.date);

        if (checkResult) {
            return {
                error: checkResult,
            };
        }

        const datePayload: DateCreationPayload = body.date;

        const date = await this._crudCall(
            this.datesService.createDate({
                group_id: event.group_id,
                status: 'preview',
                categories: [],
                online: datePayload.info.online,
                online_link: datePayload.info.online_link,
                location: datePayload.info.online
                    ? null
                    : {
                          location: {
                              lat: datePayload.info.location.lat,
                              lon: datePayload.info.location.lon,
                          },
                          location_label: datePayload.info.location.label,
                          assigned_city: closestCity(datePayload.info.location).id,
                      },
                timestamps: {
                    event_begin: new Date(datePayload.info.eventBegin),
                    event_end: new Date(datePayload.info.eventEnd),
                },
                metadata: {
                    name: datePayload.textMetadata.name,
                    description: datePayload.textMetadata.description,
                    avatar: datePayload.imagesMetadata.avatar,
                    signature_colors: datePayload.imagesMetadata.signatureColors,
                    twitter: datePayload.textMetadata.twitter,
                    spotify: datePayload.textMetadata.spotify,
                    website: datePayload.textMetadata.website,
                    facebook: datePayload.textMetadata.facebook,
                    email: datePayload.textMetadata.email,
                    linked_in: datePayload.textMetadata.linked_in,
                    tiktok: datePayload.textMetadata.tiktok,
                    instagram: datePayload.textMetadata.instagram,
                },
            }),
            StatusCodes.InternalServerError,
        );

        await this._crudCall(this.eventsService.addDate(eventId, date), StatusCodes.InternalServerError);

        return {
            date: {
                ...date,
                event: eventId,
            },
        };
    }

    /**
     * Edit an event
     *
     * @param body
     * @param user
     * @param eventId
     */
    @Put('/:event')
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
        @Body() body: EventsEditInputDto,
        @User() user: UserDto,
        @Param('event') eventId: string,
    ): Promise<EventsEditResponseDto> {
        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.InternalServerError);

        if (!EventsController.isEventOwner(event, user)) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'not_event_owner',
                },
                StatusCodes.Unauthorized,
            );
        }

        await this._crudCall(
            this.eventsService.update(
                {
                    id: eventId,
                },
                {
                    avatar: body.avatar || event.avatar,
                    name: body.name || event.name,
                    description: body.description || event.description,
                    signature_colors: body.signature_colors || event.signature_colors,
                },
            ),
            StatusCodes.InternalServerError,
        );

        return {
            event: {
                ...event,
                ...body,
            },
        };
    }

    /**
     * Bind stripe interface to event
     *
     * @param body
     * @param user
     * @param eventId
     */
    @Put('/:event/bind-stripe-interface')
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
    async bindStripeInterface(
        @Body() body: EventsBindStripeInterfaceInputDto,
        @User() user: UserDto,
        @Param('event') eventId: string,
    ): Promise<EventsBindStripeInterfaceResponseDto> {
        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.InternalServerError);

        if (!EventsController.isEventOwner(event, user)) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'not_event_owner',
                },
                StatusCodes.Unauthorized,
            );
        }

        const callerInterface = await this._serviceCall(
            this.stripeInterfacesService.recoverUserInterface(user),
            StatusCodes.InternalServerError,
        );

        if (callerInterface === null) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'caller_has_no_stripe_interface',
                },
                StatusCodes.Unauthorized,
            );
        }

        if (body.stripe_interface_id !== callerInterface.id) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'stripe_interface_not_owned',
                },
                StatusCodes.Unauthorized,
            );
        }

        await this._crudCall(
            this.eventsService.update(
                {
                    id: eventId,
                },
                {
                    stripe_interface: body.stripe_interface_id,
                },
            ),
            StatusCodes.InternalServerError,
        );

        return {
            event: {
                ...event,
                stripe_interface: body.stripe_interface_id,
            },
        };
    }

    /**
     * Resolve statuses updates
     *
     * @param dates
     * @param categories
     * @param input
     * @private
     */
    private resolveCategoryStatuses(
        dates: DateEntity[],
        categories: CategoryEntity[],
        input: { [key: string]: boolean },
    ): [CategoryEntity[], { [key: string]: boolean }] {
        const ret: { [key: string]: boolean } = {};

        if (!isNil(input)) {
            for (const categoryId of Object.keys(input)) {
                const category = categories.find((cat: CategoryEntity): boolean => cat.id === categoryId);

                if (!category) {
                    throw new HttpException(
                        {
                            status: StatusCodes.BadRequest,
                            message: 'invalid_category_id',
                        },
                        StatusCodes.BadRequest,
                    );
                }

                if (!isNil(input[categoryId])) {
                    if (input[categoryId] === true && category.status === 'preview') {
                        const liveDatesCount = dates.filter(
                            (date: DateEntity): boolean =>
                                category.dates.indexOf(date.id) !== -1 && date.status === 'live',
                        ).length;

                        if (liveDatesCount === 0) {
                            throw new HttpException(
                                {
                                    status: StatusCodes.BadRequest,
                                    message: 'cannot_live_category_with_no_live_dates',
                                },
                                StatusCodes.BadRequest,
                            );
                        }

                        ret[categoryId] = true;
                        category.status = 'live';
                    } else if (input[categoryId] === false && category.status === 'live') {
                        ret[categoryId] = false;
                        category.status = 'preview';
                    }
                }
            }
        }

        for (const category of categories) {
            if (category.status === 'live') {
                const liveDatesCount = dates.filter(
                    (date: DateEntity): boolean => category.dates.indexOf(date.id) !== -1 && date.status === 'live',
                ).length;

                if (liveDatesCount === 0) {
                    ret[category.id] = false;
                    category.status = 'preview';
                }
            }
        }

        return [categories, ret];
    }

    /**
     * Resolves statuses updates
     *
     * @param dates
     * @param input
     * @private
     */
    private resolveDateStatuses(
        dates: DateEntity[],
        input: { [key: string]: boolean },
    ): [DateEntity[], { [key: string]: boolean }] {
        if (isNil(input)) {
            return [dates, {}];
        }

        const ret: { [key: string]: boolean } = {};

        for (const dateId of Object.keys(input)) {
            const dateEntity = dates.find((date: DateEntity): boolean => date.id === dateId);

            if (!dateEntity) {
                throw new HttpException(
                    {
                        status: StatusCodes.BadRequest,
                        message: 'invalid_date_id',
                    },
                    StatusCodes.BadRequest,
                );
            }

            if (!isNil(input[dateId])) {
                if (input[dateId] === true && dateEntity.status === 'preview') {
                    ret[dateId] = true;
                    dateEntity.status = 'live';
                } else if (input[dateId] === false && dateEntity.status === 'live') {
                    ret[dateId] = false;
                    dateEntity.status = 'preview';
                }
            }
        }

        return [dates, ret];
    }

    /**
     * Update event date and category entities statuses
     *
     * @param eventId
     * @param eventStatus
     * @param dateEdits
     * @param categoryEdits
     * @private
     */
    private async updateEntities(
        eventId: string,
        eventStatus: boolean,
        dateEdits: { [key: string]: boolean },
        categoryEdits: { [key: string]: boolean },
    ): Promise<void> {
        if (!isNil(eventStatus)) {
            await this._crudCall(
                this.eventsService.update(
                    {
                        id: eventId,
                    },
                    {
                        status: eventStatus ? 'live' : 'preview',
                    },
                ),
                StatusCodes.InternalServerError,
                'cannot_update_event_status',
            );
        }

        for (const dateId of Object.keys(dateEdits)) {
            await this._crudCall(
                this.datesService.update(
                    {
                        id: dateId,
                    },
                    {
                        status: dateEdits[dateId] ? 'live' : 'preview',
                    },
                ),
                StatusCodes.InternalServerError,
                'cannot_update_date_status',
            );
        }

        for (const categoryId of Object.keys(categoryEdits)) {
            await this._crudCall(
                this.categoriesService.update(
                    {
                        id: categoryId,
                    },
                    {
                        status: categoryEdits[categoryId] ? 'live' : 'preview',
                    },
                ),
                StatusCodes.InternalServerError,
                'cannot_update_category_status',
            );
        }
    }

    /**
     * Check the interfaces required by the event
     *
     * @param event
     * @param categories
     * @private
     */
    private async verifyEventStripeInterfaceNeeds(event: EventEntity, categories: CategoryEntity[]): Promise<void> {
        const stripeInterfaceRequired: boolean =
            categories.filter((cat: CategoryEntity): boolean => cat.interface === 'stripe').length !== 0;

        if (stripeInterfaceRequired) {
            if (isNil(event.stripe_interface)) {
                throw new HttpException(
                    {
                        status: StatusCodes.Unauthorized,
                        message: 'no_stripe_interface_bound',
                    },
                    StatusCodes.Unauthorized,
                );
            }

            const stripeInterfaceRes = await this._crudCall(
                this.stripeInterfacesService.search({
                    id: event.stripe_interface,
                }),
                StatusCodes.InternalServerError,
            );

            if (stripeInterfaceRes.length === 0) {
                throw new HttpException(
                    {
                        status: StatusCodes.InternalServerError,
                        message: 'stripe_interface_not_found',
                    },
                    StatusCodes.InternalServerError,
                );
            }

            const stripeInterface: StripeInterfaceEntity = stripeInterfaceRes[0];

            if (
                isNil(stripeInterface.connect_account_type) ||
                !isNil(stripeInterface.connect_account_disabled_reason)
            ) {
                throw new HttpException(
                    {
                        status: StatusCodes.BadRequest,
                        message: 'stripe_interface_not_ready',
                    },
                    StatusCodes.BadRequest,
                );
            }
        }
    }

    /**
     * Check if event can be published
     *
     * @param event
     * @param dates
     * @param categories
     * @private
     */
    private async verifyEventPublishability(
        event: EventEntity,
        dates: DateEntity[],
        categories: CategoryEntity[],
    ): Promise<void> {
        await this.verifyEventStripeInterfaceNeeds(event, categories);
    }

    /**
     * Updated statuses of the event, its dates and its categories
     *
     * @param body
     * @param user
     * @param eventId
     */
    @Put('/:event/status')
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
    async status(
        @Body() body: EventsStatusInputDto,
        @User() user: UserDto,
        @Param('event') eventId: string,
    ): Promise<EventsStatusResponseDto> {
        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.InternalServerError);

        if (!EventsController.isEventOwner(event, user)) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'not_event_owner',
                },
                StatusCodes.Unauthorized,
            );
        }

        const dates = await this._crudCall(
            this.datesService.findAllByGroupId(event.group_id),
            StatusCodes.InternalServerError,
        );

        const categories = await this._crudCall(
            this.categoriesService.findAllByGroupId(event.group_id),
            StatusCodes.InternalServerError,
        );

        let eventStatus: boolean;

        if (!isNil(body.event)) {
            if (body.event === true && event.status === 'preview') {
                await this.verifyEventPublishability(event, dates, categories);

                eventStatus = true;
                event.status = 'live';
                // Here we check if event can go live
            } else if (body.event === false && event.status === 'live') {
                const clearDateEditsBuilder = {};

                for (const date of dates) {
                    clearDateEditsBuilder[date.id] = false;
                }

                const [clearUpdatedDates, clearDateEdits] = this.resolveDateStatuses(dates, clearDateEditsBuilder);
                const [, clearCategoryEdits] = this.resolveCategoryStatuses(clearUpdatedDates, categories, {});

                await this.updateEntities(eventId, false, clearDateEdits, clearCategoryEdits);

                return {
                    event: {
                        ...event,
                        status: 'preview',
                    },
                };
            }
        }

        if (event.status === 'live') {
            const [updatedDates, dateEdits] = this.resolveDateStatuses(dates, body.dates);
            const [, categoryEdits] = this.resolveCategoryStatuses(updatedDates, categories, body.categories);

            await this.updateEntities(eventId, eventStatus, dateEdits, categoryEdits);

            return {
                event: {
                    ...event,
                    status: isNil(eventStatus) ? event.status : 'live',
                },
            };
        } else {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'event_in_preview',
                },
                StatusCodes.BadRequest,
            );
        }
    }
}
