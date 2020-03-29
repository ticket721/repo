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
import { CurrenciesService } from '@lib/common/currencies/Currencies.service';
import { DatesService } from '@lib/common/dates/Dates.service';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { VaultereumService } from '@lib/common/vaultereum/Vaultereum.service';
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
     * @param vaultereumService
     * @param uuidToolService
     * @param rightsService
     */
    constructor(
        private readonly eventsService: EventsService,
        private readonly actionSetsService: ActionSetsService,
        private readonly configService: ConfigService,
        private readonly currenciesService: CurrenciesService,
        private readonly datesService: DatesService,
        private readonly categoriesService: CategoriesService,
        private readonly vaultereumService: VaultereumService,
        private readonly uuidToolService: UUIDToolService,
        private readonly rightsService: RightsService,
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
     * Starts a preview event and its dates
     *
     * @param body
     * @param user
     */
    @Post('/start')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
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
        await this._authorize(
            this.rightsService,
            this.eventsService,
            user,
            {
                id: body.event,
            },
            'group_id',
            ['owner', 'admin'],
        );

        // 1. Start by fetching the event
        const eventQueryRes = await this.eventsService.search({
            id: body.event,
        });

        // 2. Throw if there is a query error
        if (eventQueryRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: eventQueryRes.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        // 3. Throw if no events matches given id
        if (eventQueryRes.response.length === 0) {
            throw new HttpException(
                {
                    status: StatusCodes.NotFound,
                    message: 'event_not_found',
                },
                StatusCodes.NotFound,
            );
        }

        const eventEntity = eventQueryRes.response[0];

        // 5. If no dates given, use all date, if dates given check them
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
            // 6. For each date, update status to live
            const dateUpdateRes = await this.datesService.update(
                {
                    id: date,
                },
                {
                    status: 'live',
                },
            );

            // 7. Throw if update fails
            if (dateUpdateRes.error) {
                throw new HttpException(
                    {
                        status: StatusCodes.InternalServerError,
                        message: dateUpdateRes.error,
                    },
                    StatusCodes.InternalServerError,
                );
            }
        }

        return {
            event: eventEntity,
        };
    }

    /**
     * Converts a completed actionset into an Event entity. In preview mode.
     *
     * @param body
     * @param user
     */
    @Post('/')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
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
            eventUUID = this.uuidToolService.generate();
            eventsCollision = await this._get<EventEntity>(this.eventsService, {
                id: eventUUID,
            });
        } while (eventsCollision.length !== 0);

        // Create Vault address

        const validatingAddressName = `event-${eventUUID.toLowerCase()}`;
        const validatingAddressRes = await this.vaultereumService.write(`ethereum/accounts/${validatingAddressName}`);

        if (validatingAddressRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: validatingAddressRes.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        const eventAddress = toAcceptedAddressFormat(validatingAddressRes.response.data.address);

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

        for (const dateWithCategories of datesWithCategories) {
            const createdDateWithCategories = await this.datesService.createDateWithCategories(
                dateWithCategories[0],
                dateWithCategories[1],
            );

            if (createdDateWithCategories.error) {
                throw new HttpException(
                    {
                        status: StatusCodes.InternalServerError,
                        message: createdDateWithCategories.error,
                    },
                    StatusCodes.InternalServerError,
                );
            }

            dates.push(createdDateWithCategories.response[0]);
        }

        const createdEventWithCategories = await this.eventsService.createEventWithDatesAndCategories(
            event,
            dates,
            eventCategories,
        );

        if (createdEventWithCategories.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: createdEventWithCategories.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        const ownerRights = await this.rightsService.addRights(user, [
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
        ]);

        if (ownerRights.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: createdEventWithCategories.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        return {
            event: createdEventWithCategories.response[0],
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
    @UseGuards(AuthGuard('jwt'), RolesGuard)
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
            ['owner', 'admin', 'route_update_metadata'],
        );

        await this._edit<EventEntity>(
            this.eventsService,
            {
                id: eventId,
            },
            body,
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
    @UseGuards(AuthGuard('jwt'), RolesGuard)
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
            ['owner', 'admin', 'route_delete_categories'],
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
            const unbindRes = await this.categoriesService.unbind(category);

            if (unbindRes.error) {
                throw new HttpException(
                    {
                        status: StatusCodes.InternalServerError,
                        message: unbindRes.error,
                    },
                    StatusCodes.InternalServerError,
                );
            }
        }

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
    @UseGuards(AuthGuard('jwt'), RolesGuard)
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
            ['owner', 'admin', 'route_add_categories'],
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
            const boundRes = await this.categoriesService.bind(categoryId, 'event', eventId);

            if (boundRes.error) {
                throw new HttpException(
                    {
                        status: StatusCodes.InternalServerError,
                        message: boundRes.error,
                    },
                    StatusCodes.InternalServerError,
                );
            }
        }

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
    @UseGuards(AuthGuard('jwt'), RolesGuard)
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
            ['owner', 'admin', 'route_delete_dates'],
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
            const unbindRes = await this.datesService.unbind(date);

            if (unbindRes.error) {
                throw new HttpException(
                    {
                        status: StatusCodes.InternalServerError,
                        message: unbindRes.error,
                    },
                    StatusCodes.InternalServerError,
                );
            }
        }

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
    @UseGuards(AuthGuard('jwt'), RolesGuard)
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
            ['owner', 'admin', 'route_add_dates'],
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
            const boundRes = await this.datesService.bind(dateId, 'event', eventId);

            if (boundRes.error) {
                throw new HttpException(
                    {
                        status: StatusCodes.InternalServerError,
                        message: boundRes.error,
                    },
                    StatusCodes.InternalServerError,
                );
            }
        }

        return {
            event: eventEntity,
        };
    }
}
