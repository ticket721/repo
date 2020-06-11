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
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { EventsService } from '@lib/common/events/Events.service';
import { EventsSearchInputDto } from '@app/server/controllers/events/dto/EventsSearchInput.dto';
import { EventsSearchResponseDto } from '@app/server/controllers/events/dto/EventsSearchResponse.dto';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { EventsBuildResponseDto } from '@app/server/controllers/events/dto/EventsBuildResponse.dto';
import { EventsBuildInputDto } from '@app/server/controllers/events/dto/EventsBuildInput.dto';
import { getT721ControllerGroupID, toAcceptedAddressFormat, uuidEq } from '@common/global';
import { ActionSetToEventEntityConverter } from '@app/server/controllers/events/utils/ActionSetToEventEntityConverter.helper';
import { ConfigService } from '@lib/common/config/Config.service';
import { CurrenciesService, ERC20Currency } from '@lib/common/currencies/Currencies.service';
import { DatesService } from '@lib/common/dates/Dates.service';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { UUIDToolService } from '@lib/common/toolbox/UUID.tool.service';
import { EventsStartInputDto } from '@app/server/controllers/events/dto/EventsStartInput.dto';
import { EventsStartResponseDto } from '@app/server/controllers/events/dto/EventsStartResponse.dto';
import { EventsUpdateInputDto } from '@app/server/controllers/events/dto/EventsUpdateInput.dto';
import { EventsUpdateResponseDto } from '@app/server/controllers/events/dto/EventsUpdateResponse.dto';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { EventsAddDatesInputDto } from '@app/server/controllers/events/dto/EventsAddDatesInput.dto';
import { EventsDeleteDatesInputDto } from '@app/server/controllers/events/dto/EventsDeleteDatesInput.dto';
import { EventsAddCategoriesInputDto } from '@app/server/controllers/events/dto/EventsAddCategoriesInput.dto';
import { EventsDeleteCategoriesInputDto } from '@app/server/controllers/events/dto/EventsDeleteCategoriesInput.dto';
import { EventsDeleteCategoriesResponseDto } from '@app/server/controllers/events/dto/EventsDeleteCategoriesResponse.dto';
import { EventsAddCategoriesResponseDto } from '@app/server/controllers/events/dto/EventsAddCategoriesResponse.dto';
import { EventsAddDatesResponseDto } from '@app/server/controllers/events/dto/EventsAddDatesResponse.dto';
import { EventsDeleteDatesResponseDto } from '@app/server/controllers/events/dto/EventsDeleteDatesResponse.dto';
import { RightsService } from '@lib/common/rights/Rights.service';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { MetadatasService } from '@lib/common/metadatas/Metadatas.service';
import { RocksideCreateEOAResponse, RocksideService } from '@lib/common/rockside/Rockside.service';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import { EventsCountInputDto } from '@app/server/controllers/events/dto/EventsCountInput.dto';
import { EventsCountResponseDto } from '@app/server/controllers/events/dto/EventsCountResponse.dto';
import { EventsWithdrawInputDto } from '@app/server/controllers/events/dto/EventsWithdrawInput.dto';
import { EventsWithdrawResponseDto } from '@app/server/controllers/events/dto/EventsWithdrawResponse.dto';
import { contractCallHelper } from '@lib/common/utils/contractCall.helper';
import { T721ControllerV0Service } from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { AuthorizationsService } from '@lib/common/authorizations/Authorizations.service';

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
     * @param actionSetsService
     * @param configService
     * @param currenciesService
     * @param datesService
     * @param categoriesService
     * @param uuidToolService
     * @param rightsService
     * @param metadatasService
     * @param rocksideService
     * @param t721ControllerV0Service
     * @param authorizationsService
     */
    constructor(
        private readonly eventsService: EventsService,
        private readonly actionSetsService: ActionSetsService,
        private readonly configService: ConfigService,
        private readonly currenciesService: CurrenciesService,
        private readonly datesService: DatesService,
        private readonly categoriesService: CategoriesService,
        private readonly uuidToolService: UUIDToolService,
        private readonly rightsService: RightsService,
        private readonly metadatasService: MetadatasService,
        private readonly rocksideService: RocksideService,
        private readonly t721ControllerV0Service: T721ControllerV0Service,
        private readonly authorizationsService: AuthorizationsService,
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

    /**
     * Starts a preview event and its dates
     *
     * @param body
     * @param user
     */
    @Post('/start')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([
        StatusCodes.OK,
        StatusCodes.NotFound,
        StatusCodes.Unauthorized,
        StatusCodes.BadRequest,
        StatusCodes.InternalServerError,
    ])
    async start(@Body() body: EventsStartInputDto, @User() user: UserDto): Promise<EventsStartResponseDto> {
        const eventEntity = await this._authorizeOne(
            this.rightsService,
            this.eventsService,
            user,
            {
                id: body.event,
            },
            'group_id',
            ['admin'],
        );

        if (!body.dates) {
            body.dates = eventEntity.dates;
        } else {
            for (const date of body.dates) {
                if (
                    eventEntity.dates.findIndex((value: string): boolean => {
                        return uuidEq(value, date);
                    }) === -1
                ) {
                    throw new HttpException(
                        {
                            status: StatusCodes.BadRequest,
                            message: 'specified_date_not_in_event',
                        },
                        StatusCodes.BadRequest,
                    );
                }
            }
        }

        for (const date of body.dates) {
            await this._edit<DateEntity>(
                this.datesService,
                {
                    id: date,
                },
                {
                    status: 'live',
                },
            );
        }

        return {
            event: eventEntity,
        };
    }

    /**
     * Generates history metadata for all created entities
     *
     * @param event
     * @param dates
     * @param categories
     * @param user
     */
    private async generateHistoryMetadata(
        event: EventEntity,
        dates: DateEntity[],
        categories: CategoryEntity[],
        user: UserDto,
    ): Promise<void> {
        await this._serviceCall(
            this.metadatasService.attach(
                'history',
                'create',
                [
                    {
                        type: 'event',
                        id: event.id,
                        field: 'id',
                        rightId: event.group_id,
                        rightField: 'group_id',
                    },
                ],
                [
                    {
                        type: 'event',
                        id: event.group_id,
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
                this.eventsService,
            ),
            StatusCodes.InternalServerError,
        );

        for (const date of dates) {
            await this._serviceCall(
                this.metadatasService.attach(
                    'history',
                    'create',
                    [
                        {
                            type: 'date',
                            id: date.id,
                            field: 'id',
                            rightId: date.group_id,
                            rightField: 'group_id',
                        },
                    ],
                    [
                        {
                            type: 'date',
                            id: date.group_id,
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
        }

        for (const category of categories) {
            await this._serviceCall(
                this.metadatasService.attach(
                    'history',
                    'create',
                    [
                        {
                            type: 'category',
                            id: category.id,
                            field: 'id',
                            rightId: category.group_id,
                            rightField: 'group_id',
                        },
                    ],
                    [
                        {
                            type: 'category',
                            id: category.group_id,
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
        }
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
        await this._authorizeGlobal(this.rightsService, this.eventsService, null, null, ['route_create']);

        const actionSetEntity = await this._authorizeOne<ActionSetEntity>(
            this.rightsService,
            this.actionSetsService,
            user,
            {
                id: body.completedActionSet,
            },
            'id',
            ['owner'],
        );

        if (actionSetEntity.current_status !== 'complete') {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'incomplete_action_set',
                },
                StatusCodes.BadRequest,
            );
        }

        // Generate unique identifier
        let eventUUID: string;
        let eventsCollision: EventEntity[];

        // Verify very low probability collision
        do {
            eventUUID = this.uuidToolService.generate().toLowerCase();
            eventsCollision = await this._get<EventEntity>(this.eventsService, {
                id: eventUUID,
            });
        } while (eventsCollision.length !== 0);

        // Create Rockside EOA
        const rocksideEOA = await this._serviceCall<RocksideCreateEOAResponse>(
            this.rocksideService.createEOA(),
            StatusCodes.InternalServerError,
        );

        const eventAddress = toAcceptedAddressFormat(rocksideEOA.address);

        // Generate Group ID

        const groupId = getT721ControllerGroupID(eventUUID, eventAddress);

        // Generate Dates and event entities

        let event;
        let datesWithCategories;
        let eventCategories;

        try {
            [event, datesWithCategories, eventCategories] = await ActionSetToEventEntityConverter(
                this.configService.get('TICKETFORGE_SCOPE'),
                groupId,
                eventUUID,
                eventAddress,
                new ActionSet().load(actionSetEntity),
                this.currenciesService,
                user.id,
                this.uuidToolService.generate,
            );
        } catch (e) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'entity_conversion_fail',
                },
                StatusCodes.InternalServerError,
            );
        }

        const dates: DateEntity[] = [];
        let categories: CategoryEntity[] = [];

        for (const dateWithCategories of datesWithCategories) {
            const createdDateWithCategories = await this._serviceCall<[DateEntity, CategoryEntity[]]>(
                this.datesService.createDateWithCategories(dateWithCategories[0], dateWithCategories[1]),
                StatusCodes.InternalServerError,
            );

            dates.push(createdDateWithCategories[0]);
            categories = [...categories, ...createdDateWithCategories[1]];
        }

        const createdEventWithCategories = await this._serviceCall<[EventEntity, CategoryEntity[]]>(
            this.eventsService.createEventWithDatesAndCategories(event, dates, eventCategories),
            StatusCodes.InternalServerError,
        );

        categories = [...categories, ...createdEventWithCategories[1]];

        await this._crudCall<any>(
            this.rightsService.addRights(user, [
                {
                    entity: 'event',
                    entityValue: groupId,
                    rights: {
                        owner: true,
                    },
                },
                {
                    entity: 'category',
                    entityValue: groupId,
                    rights: {
                        owner: true,
                    },
                },
                {
                    entity: 'date',
                    entityValue: groupId,
                    rights: {
                        owner: true,
                    },
                },
            ]),
            StatusCodes.InternalServerError,
        );

        await this.generateHistoryMetadata(createdEventWithCategories[0], dates, categories, user);

        return {
            event: createdEventWithCategories[0],
        };
    }

    /**
     * Edits an Event Entity
     *
     * @param body
     * @param eventId
     * @param user
     */
    @Put('/:eventId')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.NotFound, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    async update(
        @Body() body: EventsUpdateInputDto,
        @Param('eventId') eventId: string,
        @User() user: UserDto,
    ): Promise<EventsUpdateResponseDto> {
        const event: EventEntity = await this._authorizeOne(
            this.rightsService,
            this.eventsService,
            user,
            {
                id: eventId,
            },
            'group_id',
            ['route_update_metadata'],
        );

        await this._edit<EventEntity>(
            this.eventsService,
            {
                id: eventId,
            },
            body,
        );

        await this._serviceCall(
            this.metadatasService.attach(
                'history',
                'update',
                [
                    {
                        type: 'event',
                        id: event.id,
                        field: 'id',
                        rightId: event.group_id,
                        rightField: 'group_id',
                    },
                ],
                [
                    {
                        type: 'event',
                        id: event.group_id,
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
                this.eventsService,
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
     * Deletes a category from the event
     *
     * @param body
     * @param eventId
     * @param user
     */
    @Delete('/:eventId/categories')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.NotFound, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    async deleteCategories(
        @Body() body: EventsDeleteCategoriesInputDto,
        @Param('eventId') eventId: string,
        @User() user: UserDto,
    ): Promise<EventsDeleteCategoriesResponseDto> {
        const entity: EventEntity = await this._authorizeOne(
            this.rightsService,
            this.eventsService,
            user,
            {
                id: eventId,
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

        await this._edit<EventEntity>(
            this.eventsService,
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
                        type: 'event',
                        id: entity.id,
                        field: 'id',
                        rightId: entity.group_id,
                        rightField: 'group_id',
                    },
                ],
                [
                    {
                        type: 'event',
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
                this.eventsService,
            ),
            StatusCodes.InternalServerError,
        );

        return {
            event: {
                ...entity,
                categories: finalCategories,
            },
        };
    }

    /**
     * Adds a category to the event
     *
     * @param body
     * @param eventId
     * @param user
     */
    @Post('/:eventId/categories')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.Created)
    @Roles('authenticated')
    @ApiResponses([
        StatusCodes.Created,
        StatusCodes.NotFound,
        StatusCodes.Unauthorized,
        StatusCodes.InternalServerError,
    ])
    async addCategories(
        @Body() body: EventsAddCategoriesInputDto,
        @Param('eventId') eventId: string,
        @User() user: UserDto,
    ): Promise<EventsAddCategoriesResponseDto> {
        const eventEntity: EventEntity = await this._authorizeOne(
            this.rightsService,
            this.eventsService,
            user,
            {
                id: eventId,
            },
            'group_id',
            ['route_add_categories'],
        );

        for (const categoryId of body.categories) {
            if (eventEntity.categories.findIndex((ec: string): boolean => uuidEq(ec, categoryId)) !== -1) {
                throw new HttpException(
                    {
                        status: StatusCodes.Conflict,
                        message: 'category_already_in_event',
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

            if (category.group_id !== eventEntity.group_id) {
                throw new HttpException(
                    {
                        status: StatusCodes.BadRequest,
                        message: 'group_id_not_matching',
                    },
                    StatusCodes.BadRequest,
                );
            }

            eventEntity.categories.push(categoryId);
        }

        await this._edit<EventEntity>(
            this.eventsService,
            {
                id: eventId,
            },
            {
                categories: eventEntity.categories,
            },
        );

        for (const categoryId of body.categories) {
            await this._bind<CategoryEntity>(this.categoriesService, categoryId, 'event', eventId);
        }

        await this._serviceCall(
            this.metadatasService.attach(
                'history',
                'add_categories',
                [
                    {
                        type: 'event',
                        id: eventEntity.id,
                        field: 'id',
                        rightId: eventEntity.group_id,
                        rightField: 'group_id',
                    },
                ],
                [
                    {
                        type: 'event',
                        id: eventEntity.group_id,
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
                this.eventsService,
            ),
            StatusCodes.InternalServerError,
        );

        return {
            event: eventEntity,
        };
    }

    /**
     * Deletes a date from an event
     *
     * @param body
     * @param eventId
     * @param user
     */
    @Delete('/:eventId/dates')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.NotFound, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    async deleteDates(
        @Body() body: EventsDeleteDatesInputDto,
        @Param('eventId') eventId: string,
        @User() user: UserDto,
    ): Promise<EventsDeleteDatesResponseDto> {
        const entity: EventEntity = await this._authorizeOne(
            this.rightsService,
            this.eventsService,
            user,
            {
                id: eventId,
            },
            'group_id',
            ['route_delete_dates'],
        );

        const finalDates: string[] = [];

        for (const date of entity.dates) {
            if (body.dates.findIndex((did: string): boolean => uuidEq(did, date)) === -1) {
                finalDates.push(date);
            }
        }

        if (finalDates.length === entity.dates.length) {
            throw new HttpException(
                {
                    status: StatusCodes.NotFound,
                    message: 'dates_not_found',
                },
                StatusCodes.NotFound,
            );
        }

        await this._edit<EventEntity>(
            this.eventsService,
            {
                id: eventId,
            },
            {
                dates: finalDates,
            },
        );

        for (const date of body.dates) {
            await this._unbind<DateEntity>(this.datesService, date);
        }

        await this._serviceCall(
            this.metadatasService.attach(
                'history',
                'delete_dates',
                [
                    {
                        type: 'event',
                        id: entity.id,
                        field: 'id',
                        rightId: entity.group_id,
                        rightField: 'group_id',
                    },
                ],
                [
                    {
                        type: 'event',
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
                this.eventsService,
            ),
            StatusCodes.InternalServerError,
        );

        return {
            event: {
                ...entity,
                dates: finalDates,
            },
        };
    }

    /**
     * Adds a date to the event
     *
     * @param body
     * @param eventId
     * @param user
     */
    @Post('/:eventId/dates')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.Created)
    @Roles('authenticated')
    @ApiResponses([
        StatusCodes.Created,
        StatusCodes.NotFound,
        StatusCodes.Unauthorized,
        StatusCodes.InternalServerError,
    ])
    async addDates(
        @Body() body: EventsAddDatesInputDto,
        @Param('eventId') eventId: string,
        @User() user: UserDto,
    ): Promise<EventsAddDatesResponseDto> {
        const eventEntity: EventEntity = await this._authorizeOne(
            this.rightsService,
            this.eventsService,
            user,
            {
                id: eventId,
            },
            'group_id',
            ['route_add_dates'],
        );

        for (const dateId of body.dates) {
            if (eventEntity.dates.findIndex((ec: string): boolean => uuidEq(ec, dateId)) !== -1) {
                throw new HttpException(
                    {
                        status: StatusCodes.Conflict,
                        message: 'date_already_in_event',
                    },
                    StatusCodes.Conflict,
                );
            }

            const date: DateEntity = await this._getOne<DateEntity>(this.datesService, {
                id: dateId,
            });

            if (this.datesService.isBound(date)) {
                throw new HttpException(
                    {
                        status: StatusCodes.BadRequest,
                        message: 'date_already_bound',
                    },
                    StatusCodes.BadRequest,
                );
            }

            if (date.group_id !== eventEntity.group_id) {
                throw new HttpException(
                    {
                        status: StatusCodes.BadRequest,
                        message: 'group_id_not_matching',
                    },
                    StatusCodes.BadRequest,
                );
            }

            eventEntity.dates.push(dateId);
        }

        await this._edit<EventEntity>(
            this.eventsService,
            {
                id: eventId,
            },
            {
                dates: eventEntity.dates,
            },
        );

        for (const dateId of body.dates) {
            await this._bind<DateEntity>(this.datesService, dateId, 'event', eventId);
        }

        await this._serviceCall(
            this.metadatasService.attach(
                'history',
                'delete_dates',
                [
                    {
                        type: 'event',
                        id: eventEntity.id,
                        field: 'id',
                        rightId: eventEntity.group_id,
                        rightField: 'group_id',
                    },
                ],
                [
                    {
                        type: 'event',
                        id: eventEntity.group_id,
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
                this.eventsService,
            ),
            StatusCodes.InternalServerError,
        );

        return {
            event: eventEntity,
        };
    }

    /**
     * Withdraw tokens from the t721controller
     *
     * @param body
     * @param eventId
     * @param user
     */
    @Post('/:eventId/withdraw')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.Created)
    @Roles('authenticated')
    @ApiResponses([
        StatusCodes.Created,
        StatusCodes.NotFound,
        StatusCodes.Unauthorized,
        StatusCodes.InternalServerError,
    ])
    async withdraw(
        @Body() body: EventsWithdrawInputDto,
        @Param('eventId') eventId: string,
        @User() user: UserDto,
    ): Promise<EventsWithdrawResponseDto> {
        const eventEntity: EventEntity = await this._authorizeOne(
            this.rightsService,
            this.eventsService,
            user,
            {
                id: eventId,
            },
            'group_id',
            ['withdraw'],
        );

        const currency = await this.currenciesService.get(body.currency);

        if (currency === undefined) {
            throw new HttpException(
                {
                    status: StatusCodes.NotFound,
                    message: 'cannot_find_currency',
                },
                StatusCodes.NotFound,
            );
        }

        if (currency.type !== 'erc20') {
            throw new HttpException(
                {
                    status: StatusCodes.Forbidden,
                    message: 'invalid_currency_to_withdraw',
                },
                StatusCodes.Forbidden,
            );
        }

        const erc20Currency: ERC20Currency = currency as ERC20Currency;
        const groupId = eventEntity.group_id;

        const balance = await this._serviceCall(
            contractCallHelper(
                await this.t721ControllerV0Service.get(),
                'balanceOf',
                {},
                groupId,
                erc20Currency.address,
            ),
            StatusCodes.InternalServerError,
            'cannot_retrieve_balance',
        );

        if (BigInt(balance.toString()) < BigInt(body.amount)) {
            throw new HttpException(
                {
                    status: StatusCodes.Forbidden,
                    message: 'requested_amount_too_high',
                },
                StatusCodes.Forbidden,
            );
        }

        const txSeq = await this._serviceCall(
            this.authorizationsService.generateEventWithdrawAuthorizationAndTransactionSequence(
                user,
                eventEntity.address,
                eventEntity.id.toLowerCase(),
                erc20Currency.address,
                body.amount,
            ),
            StatusCodes.InternalServerError,
            'cannot_generate_authorization',
        );

        return {
            txSeqId: txSeq.txSeq.id,
        };
    }
}
