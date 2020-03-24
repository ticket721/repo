import { Body, Controller, HttpCode, HttpException, Post, UseFilters, UseGuards } from '@nestjs/common';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@app/server/authentication/decorators/User.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { search } from '@lib/common/utils/ControllerBasics';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { EventsCreateInputDto } from '@app/server/controllers/events/dto/EventsCreateInput.dto';
import { EventsCreateResponseDto } from '@app/server/controllers/events/dto/EventsCreateResponse.dto';
import { CRUDResponse } from '@lib/common/crud/CRUD.extension';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { EventsService } from '@lib/common/events/Events.service';
import { EventsSearchInputDto } from '@app/server/controllers/events/dto/EventsSearchInput.dto';
import { EventsSearchResponseDto } from '@app/server/controllers/events/dto/EventsSearchResponse.dto';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet';
import { Action } from '@lib/common/actionsets/helper/Action';
import { StatusCodes, StatusNames } from '@lib/common/utils/codes';
import { EventsBuildResponseDto } from '@app/server/controllers/events/dto/EventsBuildResponse.dto';
import { EventsBuildInputDto } from '@app/server/controllers/events/dto/EventsBuildInput.dto';
import { toAcceptedAddressFormat, uuidEq, getT721ControllerGroupID } from '@common/global';
import { ActionSetToEventEntityConverter } from '@app/server/controllers/events/utils/ActionSet.EventEntity.converter';
import { ConfigService } from '@lib/common/config/Config.service';
import { CurrenciesService } from '@lib/common/currencies/Currencies.service';
import { DatesService } from '@lib/common/dates/Dates.service';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { VaultereumService } from '@lib/common/vaultereum/Vaultereum.service';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { UUIDToolService } from '@lib/common/toolbox/UUID.tool.service';
import { EventsStartInputDto } from '@app/server/controllers/events/dto/EventsStartInput.dto';
import { EventsStartResponseDto } from '@app/server/controllers/events/dto/EventsStartResponse.dto';

/**
 * Events controller to create and fetch events
 */
@ApiBearerAuth()
@ApiTags('events')
@Controller('events')
export class EventsController {
    /**
     * Dependency Injection
     *
     * @param eventsService
     * @param actionSetsService
     * @param configService
     * @param currenciesService
     * @param datesService
     * @param vaultereumService
     * @param uuidToolService
     */
    constructor(
        private readonly eventsService: EventsService,
        private readonly actionSetsService: ActionSetsService,
        private readonly configService: ConfigService,
        private readonly currenciesService: CurrenciesService,
        private readonly datesService: DatesService,
        private readonly vaultereumService: VaultereumService,
        private readonly uuidToolService: UUIDToolService,
    ) {}

    /**
     * Search for events
     *
     * @param body
     * @param user
     */
    @Post('/search')
    @ApiResponse({
        status: StatusCodes.InternalServerError,
        description: StatusNames[StatusCodes.InternalServerError],
    })
    @ApiResponse({
        status: StatusCodes.BadRequest,
        description: StatusNames[StatusCodes.BadRequest],
    })
    @ApiResponse({
        status: StatusCodes.OK,
        description: StatusNames[StatusCodes.OK],
    })
    @HttpCode(200)
    @UseFilters(new HttpExceptionFilter())
    async search(@Body() body: EventsSearchInputDto, @User() user: UserDto): Promise<EventsSearchResponseDto> {
        const events = await search<EventEntity, EventsService>(this.eventsService, body);

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
    @ApiResponse({
        status: StatusCodes.NotFound,
        description: StatusNames[StatusCodes.NotFound],
    })
    @ApiResponse({
        status: StatusCodes.Unauthorized,
        description: StatusNames[StatusCodes.Unauthorized],
    })
    @ApiResponse({
        status: StatusCodes.BadRequest,
        description: StatusNames[StatusCodes.BadRequest],
    })
    @ApiResponse({
        status: StatusCodes.InternalServerError,
        description: StatusNames[StatusCodes.InternalServerError],
    })
    @ApiResponse({
        status: StatusCodes.Created,
        description: StatusNames[StatusCodes.Created],
    })
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('authenticated')
    @UseFilters(new HttpExceptionFilter())
    async start(@Body() body: EventsStartInputDto, @User() user: UserDto): Promise<EventsStartResponseDto> {
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

        // 4. Throw if user is not event owner
        if (!uuidEq(eventEntity.owner, user.id)) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'not_event_owner',
                },
                StatusCodes.Unauthorized,
            );
        }

        // 5. Update event status to live
        const eventUpdateQuery = await this.eventsService.update(
            {
                id: body.event,
            },
            {
                status: 'live',
            },
        );

        // 6. Throw if update failed
        if (eventUpdateQuery.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: eventUpdateQuery.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        // 7. If no dates given, use all date, if dates given check them
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
            // 8. For each date, update status to live
            const dateUpdateRes = await this.datesService.update(
                {
                    id: date,
                },
                {
                    status: 'live',
                },
            );

            // 9. Throw if update fails
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
            event: {
                ...eventEntity,
                status: 'live',
            },
        };
    }

    /**
     * Converts a completed actionset into an Event entity. In preview mode.
     *
     * @param body
     * @param user
     */
    @Post('/build')
    @ApiResponse({
        status: StatusCodes.NotFound,
        description: StatusNames[StatusCodes.NotFound],
    })
    @ApiResponse({
        status: StatusCodes.Unauthorized,
        description: StatusNames[StatusCodes.Unauthorized],
    })
    @ApiResponse({
        status: StatusCodes.BadRequest,
        description: StatusNames[StatusCodes.BadRequest],
    })
    @ApiResponse({
        status: StatusCodes.InternalServerError,
        description: StatusNames[StatusCodes.InternalServerError],
    })
    @ApiResponse({
        status: StatusCodes.Created,
        description: StatusNames[StatusCodes.Created],
    })
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('authenticated')
    @UseFilters(new HttpExceptionFilter())
    async build(@Body() body: EventsBuildInputDto, @User() user: UserDto): Promise<EventsBuildResponseDto> {
        const actionSet = await this.actionSetsService.search({
            id: body.completedActionSet,
        });

        if (actionSet.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: actionSet.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        if (actionSet.response.length === 0) {
            throw new HttpException(
                {
                    status: StatusCodes.NotFound,
                    message: 'actionset_not_found',
                },
                StatusCodes.NotFound,
            );
        }

        const actionSetEntity = actionSet.response[0];

        if (actionSetEntity.current_status !== 'complete') {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'incomplete_action_set',
                },
                StatusCodes.BadRequest,
            );
        }

        if (!uuidEq(actionSetEntity.owner, user.id)) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'not_actionset_owner',
                },
                StatusCodes.Unauthorized,
            );
        }

        // Generate unique identifier
        let eventUUID: string;
        let eventsCollisionRes: CRUDResponse<EventEntity[]>;

        // Verify very low probability collision
        do {
            eventUUID = this.uuidToolService.generate();
            eventsCollisionRes = await this.eventsService.search({
                id: eventUUID,
            });

            if (eventsCollisionRes.error) {
                throw new HttpException(
                    {
                        status: StatusCodes.InternalServerError,
                        message: eventsCollisionRes.error,
                    },
                    StatusCodes.InternalServerError,
                );
            }
        } while (eventsCollisionRes.response.length !== 0);

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

        let dates;
        let event;

        try {
            [dates, event] = await ActionSetToEventEntityConverter(
                this.configService.get('TICKETFORGE_SCOPE'),
                groupId,
                eventUUID,
                eventAddress,
                new ActionSet().load(actionSetEntity),
                this.currenciesService,
                user.id,
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

        // Create Dates

        const datesSavedEntities: DateEntity[] = [];

        for (const date of dates) {
            const dateCreationRes = await this.datesService.create(date);

            if (dateCreationRes.error) {
                throw new HttpException(
                    {
                        status: StatusCodes.InternalServerError,
                        message: dateCreationRes.error,
                    },
                    StatusCodes.InternalServerError,
                );
            }
            datesSavedEntities.push(dateCreationRes.response);
        }

        // Create Event

        event.dates = datesSavedEntities.map((date: DateEntity): string => date.id);

        const eventCreationRes = await this.eventsService.create(event);

        if (eventCreationRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: eventCreationRes.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        return {
            event: eventCreationRes.response,
        };
    }

    /**
     * Creates an event action set
     */
    @Post('/')
    @ApiResponse({
        status: StatusCodes.BadRequest,
        description: StatusNames[StatusCodes.BadRequest],
    })
    @ApiResponse({
        status: StatusCodes.Created,
        description: StatusNames[StatusCodes.Created],
    })
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('authenticated')
    @UseFilters(new HttpExceptionFilter())
    async create(@Body() body: EventsCreateInputDto, @User() user: UserDto): Promise<EventsCreateResponseDto> {
        const actions: Action[] = [
            new Action()
                .setName('@events/textMetadata')
                .setData<EventsCreateInputDto>(body)
                .setType('input')
                .setStatus('in progress'),
            new Action()
                .setName('@events/modulesConfiguration')
                .setType('input')
                .setStatus('in progress'),
            new Action()
                .setName('@events/datesConfiguration')
                .setType('input')
                .setStatus('in progress'),
            new Action()
                .setName('@events/categoriesConfiguration')
                .setType('input')
                .setStatus('in progress'),
            new Action()
                .setName('@events/imagesMetadata')
                .setType('input')
                .setStatus('in progress'),
            new Action()
                .setName('@events/adminsConfiguration')
                .setType('input')
                .setStatus('in progress'),
        ];
        const actionSet: ActionSet = new ActionSet()
            .setName('@events/creation')
            .setActions(actions)
            .setOwner(user)
            .setStatus('input:in progress');

        const response: CRUDResponse<ActionSetEntity> = await this.actionSetsService.create(actionSet.raw);

        if (response.error) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: response.error,
                },
                StatusCodes.BadRequest,
            );
        }

        return {
            actionset: response.response,
        };
    }
}
