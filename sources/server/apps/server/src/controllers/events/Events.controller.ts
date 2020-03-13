import { Body, Controller, Get, HttpCode, HttpException, Param, Post, UseFilters, UseGuards } from '@nestjs/common';
import * as _ from 'lodash';
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
import { RefractMtx, toAcceptedAddressFormat, TransactionParameters, uuidEq } from '@ticket721sources/global';
import { ActionSetToEventEntityConverter } from '@app/server/controllers/events/utils/ActionSet.EventEntity.converter';
import { ConfigService } from '@lib/common/config/Config.service';
import { CurrenciesService } from '@lib/common/currencies/Currencies.service';
import { DatesService } from '@lib/common/dates/Dates.service';
import { Category, DateEntity } from '@lib/common/dates/entities/Date.entity';
import { EventsDeployInputDto } from '@app/server/controllers/events/dto/EventsDeployInput.dto';
import { EventsDeployResponseDto } from '@app/server/controllers/events/dto/EventsDeployResponse.dto';
import { VaultereumService } from '@lib/common/vaultereum/Vaultereum.service';
import { ScopeBinding, TicketforgeService } from '@lib/common/contracts/Ticketforge.service';
import { EventsDeployGeneratePayloadParamsDto } from '@app/server/controllers/events/dto/EventsDeployGeneratePayloadParams.dto';
import { EventsDeployGeneratePayloadResponseDto } from '@app/server/controllers/events/dto/EventsDeployGeneratePayloadResponse.dto';
import { T721AdminService } from '@lib/common/contracts/T721Admin.service';
import { encodeCategories } from '@app/server/controllers/events/utils/encodeCategories';
import { RefractFactoryV0Service } from '@lib/common/contracts/refract/RefractFactory.V0.service';
import { TxsService } from '@lib/common/txs/Txs.service';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { EventsDeploySignPayloadParamsDto } from '@app/server/controllers/events/dto/EventsDeploySignPayloadParams.dto';
import { EventsDeploySignPayloadResponseDto } from '@app/server/controllers/events/dto/EventsDeploySignPayloadResponse.dto';
import { UserTypes } from '@app/server/authentication/guards/UserTypesGuard.guard';

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
     * @param ticketforgeService
     * @param t721AdminService
     * @param refractFactoryService
     * @param txsService
     */
    constructor(
        private readonly eventsService: EventsService,
        private readonly actionSetsService: ActionSetsService,
        private readonly configService: ConfigService,
        private readonly currenciesService: CurrenciesService,
        private readonly datesService: DatesService,
        private readonly vaultereumService: VaultereumService,
        private readonly ticketforgeService: TicketforgeService,
        private readonly t721AdminService: T721AdminService,
        private readonly refractFactoryService: RefractFactoryV0Service,
        private readonly txsService: TxsService,
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
     * Deploys an event on the ethereum blockchain
     *
     * @param body
     * @param user
     */
    @Post('/deploy')
    @ApiResponse({
        status: StatusCodes.InternalServerError,
        description: StatusNames[StatusCodes.InternalServerError],
    })
    @ApiResponse({
        status: StatusCodes.BadRequest,
        description: StatusNames[StatusCodes.BadRequest],
    })
    @ApiResponse({
        status: StatusCodes.NotFound,
        description: StatusNames[StatusCodes.NotFound],
    })
    @ApiResponse({
        status: StatusCodes.OK,
        description: StatusNames[StatusCodes.OK],
    })
    @HttpCode(200)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('authenticated')
    @UseFilters(new HttpExceptionFilter())
    async deploy(@Body() body: EventsDeployInputDto, @User() user: UserDto): Promise<EventsDeployResponseDto> {
        const event = await this.eventsService.search({
            id: body.event,
        });

        if (event.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: event.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        if (event.response.length === 0) {
            throw new HttpException(
                {
                    status: StatusCodes.NotFound,
                    message: 'event_not_found',
                },
                StatusCodes.NotFound,
            );
        }

        const generatedPayload = await this.getPayload(
            {
                event: body.event,
            },
            user,
        );

        if (!_.isEqual(body.payload, generatedPayload.payload)) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_payload',
                },
                StatusCodes.BadRequest,
            );
        }

        const eventEntity = event.response[0];

        const txRes = await this.txsService.mtx(body.payload, body.signature, user);

        if (txRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: txRes.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        const updateRes = await this.eventsService.update(
            {
                id: eventEntity.id,
            },
            {
                group_id: generatedPayload.groupId,
            },
        );

        if (updateRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: updateRes.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        return {
            event: {
                ...eventEntity,
                group_id: generatedPayload.groupId,
            },
        };
    }

    /**
     * Recover MetaTransaction EIP712 payload to sign
     *
     * @param params
     * @param user
     */
    @Get('/genp/deploy/:event')
    @ApiResponse({
        status: StatusCodes.NotFound,
        description: StatusNames[StatusCodes.NotFound],
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
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('authenticated')
    @UseFilters(new HttpExceptionFilter())
    async getPayload(
        @Param() params: EventsDeployGeneratePayloadParamsDto,
        @User() user: UserDto,
    ): Promise<EventsDeployGeneratePayloadResponseDto> {
        const event = await this.eventsService.search({
            id: params.event,
        });

        if (event.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: event.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        if (event.response.length === 0) {
            throw new HttpException(
                {
                    status: StatusCodes.NotFound,
                    message: 'event_not_found',
                },
                StatusCodes.NotFound,
            );
        }

        const eventEntity: EventEntity = event.response[0];
        const scopeContracts: ScopeBinding = this.ticketforgeService.getScopeContracts(
            this.configService.get('TICKETFORGE_SCOPE'),
        );
        if (!scopeContracts) {
            throw new HttpException(
                {
                    status: StatusCodes.NotFound,
                    message: 'scope_contracts_not_found',
                },
                StatusCodes.NotFound,
            );
        }

        const t721controller = await scopeContracts.t721c.get();
        const t721admin = await this.t721AdminService.get();
        let nextId;

        try {
            nextId = (await t721controller.methods.getNextGroupId(user.address).call()).toLowerCase();
        } catch (e) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'cannot_retrieve_group_id',
                },
                StatusCodes.InternalServerError,
            );
        }

        const parameters: TransactionParameters[] = [];

        parameters.push({
            from: user.address,
            to: t721controller._address,
            relayer: t721admin._address,
            data: t721controller.methods.createGroup('@event/modules').encodeABI(),
            value: '0',
        });

        let categories: Category[] = [...eventEntity.categories];

        for (const date of eventEntity.dates) {
            const dateEntityRes = await this.datesService.search({
                id: date,
            });

            if (dateEntityRes.error) {
                throw new HttpException(
                    {
                        status: StatusCodes.InternalServerError,
                        message: dateEntityRes.error,
                    },
                    StatusCodes.InternalServerError,
                );
            }

            if (dateEntityRes.response.length === 0) {
                throw new HttpException(
                    {
                        status: StatusCodes.NotFound,
                        message: 'date_entry_not_found',
                    },
                    StatusCodes.NotFound,
                );
            }

            categories = [...categories, ...dateEntityRes.response[0].categories];
        }

        const registerCategoriesArguments = await encodeCategories(
            eventEntity.address,
            this.currenciesService,
            categories,
        );

        for (const batch of registerCategoriesArguments) {
            parameters.push({
                from: user.address,
                to: t721controller._address,
                relayer: t721admin._address,
                data: t721controller.methods.registerCategories(nextId, batch[0], batch[1], batch[2]).encodeABI(),
                value: '0',
            });
        }

        const rmtx: RefractMtx = new RefractMtx(
            parseInt(this.configService.get('ETHEREUM_NODE_NETWORK_ID'), 10),
            this.configService.get('ETHEREUM_MTX_DOMAIN_NAME'),
            this.configService.get('ETHEREUM_MTX_VERSION'),
            user.address,
        );

        const generatedNonce = await this.refractFactoryService.getNonce(user.address);

        return {
            payload: rmtx.generatePayload(
                {
                    nonce: generatedNonce,
                    parameters,
                },
                'MetaTransaction',
            ),
            groupId: nextId,
        };
    }

    /**
     * Recover MetaTransaction EIP712 payload to sign
     *
     * @param params
     * @param user
     */
    @Get('/signp/deploy/:event')
    @ApiResponse({
        status: StatusCodes.NotFound,
        description: StatusNames[StatusCodes.NotFound],
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
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('authenticated')
    @UserTypes('t721')
    @UseFilters(new HttpExceptionFilter())
    async signPayload(
        @Param() params: EventsDeploySignPayloadParamsDto,
        @User() user: UserDto,
    ): Promise<EventsDeploySignPayloadResponseDto> {
        const generatedPayload: EventsDeployGeneratePayloadResponseDto = await this.getPayload(params, user);

        const rmtx: RefractMtx = new RefractMtx(
            parseInt(this.configService.get('ETHEREUM_NODE_NETWORK_ID'), 10),
            this.configService.get('ETHEREUM_MTX_DOMAIN_NAME'),
            this.configService.get('ETHEREUM_MTX_VERSION'),
            user.address,
        );

        const signature = await rmtx.sign(
            this.vaultereumService.getSigner(`user-${user.id}`),
            generatedPayload.payload,
        );

        return {
            payload: generatedPayload.payload,
            groupId: generatedPayload.groupId,
            signature: signature.hex,
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

        let dates;
        let event;

        try {
            [dates, event] = await ActionSetToEventEntityConverter(
                this.configService.get('TICKETFORGE_SCOPE'),
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

        const validatingAddressName = `event-${eventCreationRes.response.id.toLowerCase()}`;
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

        const eventAddressUpdateRes = await this.eventsService.update(
            {
                id: eventCreationRes.response.id,
            },
            {
                address: eventAddress,
            },
        );

        if (eventAddressUpdateRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: eventAddressUpdateRes.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        const fullEvent = await this.eventsService.search({
            id: eventCreationRes.response.id,
        });

        if (fullEvent.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: fullEvent.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        return {
            event: fullEvent.response[0],
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
