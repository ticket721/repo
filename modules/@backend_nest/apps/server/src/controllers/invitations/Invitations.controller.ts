import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import {
    Body,
    Controller,
    Delete,
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
import { InvitationEntity } from '@lib/common/invitations/entities/Invitation.entity';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { AuthGuard } from '@nestjs/passport';
import { EventsService } from '@lib/common/events/Events.service';
import { InvitationsSearchInputDto } from '@app/server/controllers/invitations/dto/InvitationsSearchInput.dto';
import { InvitationsSearchResponseDto } from '@app/server/controllers/invitations/dto/InvitationsSearchResponse.dto';
import { InvitationsCreateInputDto } from '@app/server/controllers/invitations/dto/InvitationsCreateInput.dto';
import { InvitationsCreateResponseDto } from '@app/server/controllers/invitations/dto/InvitationsCreateResponse.dto';
import { SearchInputType } from '@lib/common/utils/SearchInput.type';
import { InvitationsService } from '@lib/common/invitations/Invitations.service';
import { DatesService } from '@lib/common/dates/Dates.service';
import { InvitationsTransferInputDto } from '@app/server/controllers/invitations/dto/InvitationsTransferInput.dto';
import { InvitationsTransferResponseDto } from '@app/server/controllers/invitations/dto/InvitationsTransferResponse.dto';
import { EmailService } from '@lib/common/email/Email.service';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { UsersService } from '@lib/common/users/Users.service';
import { InvitationsDeleteInputDto } from '@app/server/controllers/invitations/dto/InvitationsDeleteInput.dto';
import { InvitationsDeleteResponseDto } from '@app/server/controllers/invitations/dto/InvitationsDeleteResponse.dto';
import { uuid } from '@iaminfinity/express-cassandra';
import { InvitationsOwnedSearchInputDto } from '@app/server/controllers/invitations/dto/InvitationsOwnedSearchInput.dto';
import { InvitationsOwnedSearchResponseDto } from '@app/server/controllers/invitations/dto/InvitationsOwnedSearchResponse.dto';
import { InvitationsCreateBatchInputDto } from '@app/server/controllers/invitations/dto/InvitationsCreateBatchInput.dto';
import { InvitationsCreateBatchResponseDto } from '@app/server/controllers/invitations/dto/InvitationsCreateBatchResponse.dto';
import { OperationsService } from '@lib/common/operations/Operations.service';

/**
 * Controller exposing routes to manage the Invitations of an user
 */
@Injectable()
@ApiBearerAuth()
@ApiTags('invitation')
@Controller('invitations')
export class InvitationsController extends ControllerBasics<InvitationEntity> {
    /**
     * Dependency Injection
     *
     * @param eventsService
     * @param invitationsService
     * @param emailService
     * @param datesService
     * @param usersService
     * @param operationsService
     */
    constructor(
        private readonly eventsService: EventsService,
        private readonly invitationsService: InvitationsService,
        private readonly emailService: EmailService,
        private readonly datesService: DatesService,
        private readonly usersService: UsersService,
        private readonly operationsService: OperationsService,
    ) {
        super();
    }

    /**
     * Search for owned invitations
     *
     * @param body
     * @param user
     */
    @Post('/search')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async searchOwned(
        @Body() body: InvitationsOwnedSearchInputDto,
        @User() user: UserDto,
    ): Promise<InvitationsOwnedSearchResponseDto> {
        const invitations = await this._search(this.invitationsService, {
            ...body,
            owner: {
                $eq: user.email,
            },
        } as SearchInputType<InvitationEntity>);

        return {
            invitations,
        };
    }

    /**
     * Search for invitations made by owned event
     *
     * @param body
     * @param eventId
     * @param user
     */
    @Post('/:event/search')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async search(
        @Body() body: InvitationsSearchInputDto,
        @Param('event') eventId: string,
        @User() user: UserDto,
    ): Promise<InvitationsSearchResponseDto> {
        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.InternalServerError);

        if (event.owner !== user.id) {
            throw new HttpException(
                {
                    status: StatusCodes.Forbidden,
                    message: 'invalid_event_id',
                },
                StatusCodes.Forbidden,
            );
        }

        const invitations = await this._search(this.invitationsService, {
            ...body,
            group_id: {
                $eq: event.group_id,
            },
        } as SearchInputType<InvitationEntity>);

        const countBody = {
            ...body,
        } as SearchInputType<InvitationEntity>;

        delete countBody.$sort;
        delete countBody.$page_index;
        delete countBody.$page_size;

        const count = await this._count(this.invitationsService, {
            ...countBody,
            group_id: {
                $eq: event.group_id,
            },
        } as SearchInputType<InvitationEntity>);

        return {
            invitations,
            total: count.count,
        };
    }

    /**
     * Transfer owned invitation
     *
     * @param body
     * @param invitationId
     * @param user
     */
    @Put('/transfer/:invitation')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async transfer(
        @Body() body: InvitationsTransferInputDto,
        @Param('invitation') invitationId: string,
        @User() user: UserDto,
    ): Promise<InvitationsTransferResponseDto> {
        const invitation = await this._crudCall(
            this.invitationsService.findOne(invitationId),
            StatusCodes.InternalServerError,
        );

        if (invitation.owner !== user.email) {
            throw new HttpException(
                {
                    status: StatusCodes.Forbidden,
                    message: 'not_invitation_owner',
                },
                StatusCodes.Forbidden,
            );
        }

        if (body.newOwner === user.email) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_transfer',
                },
                StatusCodes.Forbidden,
            );
        }

        await this._crudCall(
            this.invitationsService.update(
                {
                    id: invitationId,
                },
                {
                    owner: body.newOwner,
                },
            ),
            StatusCodes.InternalServerError,
        );

        const updatedInvitation = await this._crudCall(
            this.invitationsService.findOne(invitationId),
            StatusCodes.InternalServerError,
        );

        const dates = await this._crudCall(
            this.datesService.search({
                id: {
                    $in: (updatedInvitation.dates.map(uuid) as unknown) as string[],
                },
            }),
            StatusCodes.InternalServerError,
        );

        const targetUser = await this._serviceCall(
            this.usersService.findAnyTypeByEmail(body.newOwner),
            StatusCodes.InternalServerError,
            'user_verification_error',
        );

        await this._crudCall(
            this.operationsService.create({
                purchase_id: '00000000-0000-0000-0000-000000000000',
                client_id: user.id,
                client_email: user.email,
                currency: 'FREE',
                group_id: invitation.group_id,
                category_id: '00000000-0000-0000-0000-000000000000',
                ticket_ids: [invitation.id, ...dates.map(d => d.id)],
                type: 'invitation',
                status: 'cancelled',
                fee: 0,
                quantity: 1,
                price: 0,
            }),
            StatusCodes.InternalServerError,
        );

        await this._crudCall(
            this.operationsService.create({
                purchase_id: '00000000-0000-0000-0000-000000000000',
                client_id: targetUser.length === 1 ? targetUser[0].id : '00000000-0000-0000-0000-000000000000',
                client_email: body.newOwner,
                group_id: invitation.group_id,
                category_id: '00000000-0000-0000-0000-000000000000',
                ticket_ids: [invitation.id, ...dates.map(d => d.id)],
                type: 'invitation',
                currency: 'FREE',
                status: 'confirmed',
                fee: 0,
                quantity: 1,
                price: 0,
            }),
            StatusCodes.InternalServerError,
        );

        await this._serviceCall(
            this.emailService.sendInvitationsSummary(
                body.newOwner,
                user.locale,
                {
                    invitations: [
                        {
                            amount: 1,
                            dates,
                        },
                    ],
                    hasAccount: targetUser.length > 0,
                },
                body.appUrl,
                body.timezone,
            ),
            StatusCodes.InternalServerError,
            'cannot_generate_summary',
        );

        return {
            invitation: updatedInvitation,
        };
    }

    /**
     * Create new invitations
     *
     * @param body
     * @param eventId
     * @param user
     */
    @Post('/:event/batch')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async createBatch(
        @Body() body: InvitationsCreateBatchInputDto,
        @Param('event') eventId: string,
        @User() user: UserDto,
    ): Promise<InvitationsCreateBatchResponseDto> {
        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.InternalServerError);

        if (event.owner !== user.id) {
            throw new HttpException(
                {
                    status: StatusCodes.Forbidden,
                    message: 'invalid_event_id',
                },
                StatusCodes.Forbidden,
            );
        }

        const dateEntities: DateEntity[] = [];

        for (const invitation of body.invitations) {
            if (invitation.amount < 1) {
                throw new HttpException(
                    {
                        status: StatusCodes.BadRequest,
                        message: 'invalid_amount',
                    },
                    StatusCodes.BadRequest,
                );
            }

            for (const dateId of invitation.dates) {
                const date = await this._crudCall(
                    this.datesService.findOne(dateId),
                    StatusCodes.InternalServerError,
                    'date_verification_error',
                );

                if (date.group_id !== event.group_id) {
                    throw new HttpException(
                        {
                            status: StatusCodes.Forbidden,
                            message: 'invalid_date_id',
                        },
                        StatusCodes.Forbidden,
                    );
                }

                dateEntities.push(date);
            }
        }

        let invitations: InvitationEntity[] = [];
        const invitationsByUsers: {
            [key: string]: {
                amount: number;
                dates: DateEntity[];
                ids: string[];
            }[];
        } = {};

        for (const invitation of body.invitations) {
            const invitationsBatch = [];

            for (let idx = 0; idx < invitation.amount; ++idx) {
                invitationsBatch.push(
                    await this._crudCall(
                        this.invitationsService.create({
                            owner: invitation.owner,
                            dates: invitation.dates,
                            group_id: event.group_id,
                        }),
                        StatusCodes.InternalServerError,
                        'invitation_creation_error',
                    ),
                );
            }

            invitationsByUsers[invitation.owner] = [
                ...(invitationsByUsers[invitation.owner] || []),
                {
                    ids: invitationsBatch.map(i => i.id),
                    amount: invitation.amount,
                    dates: invitation.dates.map(
                        id =>
                            dateEntities[
                                dateEntities.findIndex((d: DateEntity) => d.id.toLowerCase() === id.toLowerCase())
                            ],
                    ),
                },
            ];

            invitations = invitations.concat(invitationsBatch);
        }

        for (const userEmail of Object.keys(invitationsByUsers)) {
            const targetUser = await this._serviceCall(
                this.usersService.findAnyTypeByEmail(userEmail),
                StatusCodes.InternalServerError,
                'user_verification_error',
            );

            for (const invitationBatch of invitationsByUsers[userEmail]) {
                await this._crudCall(
                    this.operationsService.create({
                        purchase_id: '00000000-0000-0000-0000-000000000000',
                        client_id: targetUser.length === 1 ? targetUser[0].id : '00000000-0000-0000-0000-000000000000',
                        client_email: userEmail,
                        group_id: event.group_id,
                        currency: 'FREE',
                        category_id: '00000000-0000-0000-0000-000000000000',
                        ticket_ids: [...invitationBatch.ids, ...invitationBatch.dates.map(d => d.id)],
                        type: 'invitation',
                        status: 'confirmed',
                        fee: 0,
                        quantity: invitationBatch.amount,
                        price: 0,
                    }),
                    StatusCodes.InternalServerError,
                );
            }

            await this._serviceCall(
                this.emailService.sendInvitationsSummary(
                    userEmail,
                    user.locale,
                    {
                        invitations: invitationsByUsers[userEmail],
                        hasAccount: targetUser.length > 0,
                    },
                    body.appUrl,
                    body.timezone,
                ),
                StatusCodes.InternalServerError,
                'cannot_generate_summary',
            );
        }

        return {
            invitations,
        };
    }
    /**
     * Create new invitations
     *
     * @param body
     * @param eventId
     * @param user
     */
    @Post('/:event')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async create(
        @Body() body: InvitationsCreateInputDto,
        @Param('event') eventId: string,
        @User() user: UserDto,
    ): Promise<InvitationsCreateResponseDto> {
        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.InternalServerError);

        if (event.owner !== user.id) {
            throw new HttpException(
                {
                    status: StatusCodes.Forbidden,
                    message: 'invalid_event_id',
                },
                StatusCodes.Forbidden,
            );
        }

        if (body.amount < 1) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_amount',
                },
                StatusCodes.BadRequest,
            );
        }

        const dateEntities: DateEntity[] = [];

        for (const dateId of body.dates) {
            const date = await this._crudCall(
                this.datesService.findOne(dateId),
                StatusCodes.InternalServerError,
                'date_verification_error',
            );

            if (date.group_id !== event.group_id) {
                throw new HttpException(
                    {
                        status: StatusCodes.Forbidden,
                        message: 'invalid_date_id',
                    },
                    StatusCodes.Forbidden,
                );
            }

            dateEntities.push(date);
        }

        const invitations: InvitationEntity[] = [];

        for (let idx = 0; idx < body.amount; ++idx) {
            invitations.push(
                await this._crudCall(
                    this.invitationsService.create({
                        owner: body.owner,
                        dates: body.dates,
                        group_id: event.group_id,
                    }),
                    StatusCodes.InternalServerError,
                    'invitation_creation_error',
                ),
            );
        }

        const targetUser = await this._serviceCall(
            this.usersService.findAnyTypeByEmail(body.owner),
            StatusCodes.InternalServerError,
            'user_verification_error',
        );

        await this._crudCall(
            this.operationsService.create({
                purchase_id: '00000000-0000-0000-0000-000000000000',
                client_id: targetUser.length === 1 ? targetUser[0].id : '00000000-0000-0000-0000-000000000000',
                client_email: body.owner,
                currency: 'FREE',
                group_id: event.group_id,
                category_id: '00000000-0000-0000-0000-000000000000',
                ticket_ids: [...invitations.map(i => i.id), ...dateEntities.map(d => d.id)],
                type: 'invitation',
                status: 'confirmed',
                fee: 0,
                quantity: body.amount,
                price: 0,
            }),
            StatusCodes.InternalServerError,
        );

        await this._serviceCall(
            this.emailService.sendInvitationsSummary(
                body.owner,
                user.locale,
                {
                    invitations: [
                        {
                            amount: body.amount,
                            dates: dateEntities,
                        },
                    ],
                    hasAccount: targetUser.length > 0,
                },
                body.appUrl,
                body.timezone,
            ),
            StatusCodes.InternalServerError,
            'cannot_generate_summary',
        );

        return {
            invitations,
        };
    }

    /**
     * Delete invitations
     *
     * @param body
     * @param eventId
     * @param user
     */
    @Delete('/:event')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async delete(
        @Body() body: InvitationsDeleteInputDto,
        @Param('event') eventId: string,
        @User() user: UserDto,
    ): Promise<InvitationsDeleteResponseDto> {
        const event = await this._crudCall(this.eventsService.findOne(eventId), StatusCodes.InternalServerError);

        if (event.owner !== user.id) {
            throw new HttpException(
                {
                    status: StatusCodes.Forbidden,
                    message: 'invalid_event_id',
                },
                StatusCodes.Forbidden,
            );
        }

        for (const invitationId of body.invitations) {
            const invitation = await this._crudCall(
                this.invitationsService.findOne(invitationId),
                StatusCodes.InternalServerError,
                'invalid_invitation_id',
            );

            if (invitation.group_id !== event.group_id) {
                throw new HttpException(
                    {
                        status: StatusCodes.InternalServerError,
                        message: 'invalid_invitation_id',
                    },
                    StatusCodes.Forbidden,
                );
            }
        }

        for (const invitationId of body.invitations) {
            const invitation = await this._crudCall(
                this.invitationsService.findOne(invitationId),
                StatusCodes.InternalServerError,
                'invalid_invitation_id',
            );

            await this._crudCall(
                this.invitationsService.delete({
                    id: invitationId,
                }),
                StatusCodes.InternalServerError,
                'invitation_deletion_error',
            );

            const dates = await this._crudCall(
                this.datesService.search({
                    id: {
                        $in: (invitation.dates.map(uuid) as unknown) as string[],
                    },
                }),
                StatusCodes.InternalServerError,
            );

            const targetUser = await this._serviceCall(
                this.usersService.findAnyTypeByEmail(invitation.owner),
                StatusCodes.InternalServerError,
                'user_verification_error',
            );

            await this._crudCall(
                this.operationsService.create({
                    purchase_id: '00000000-0000-0000-0000-000000000000',
                    client_id: targetUser.length === 1 ? targetUser[0].id : '00000000-0000-0000-0000-000000000000',
                    client_email: invitation.owner,
                    group_id: invitation.group_id,
                    category_id: '00000000-0000-0000-0000-000000000000',
                    currency: 'FREE',
                    ticket_ids: [invitation.id, ...dates.map(d => d.id)],
                    type: 'invitation',
                    status: 'cancelled',
                    fee: 0,
                    quantity: 1,
                    price: 0,
                }),
                StatusCodes.InternalServerError,
            );
        }

        return {};
    }
}
