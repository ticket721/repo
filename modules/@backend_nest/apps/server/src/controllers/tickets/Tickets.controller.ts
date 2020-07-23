import {
    Body,
    Controller,
    HttpCode,
    HttpException,
    Injectable,
    Param,
    Post,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';
import { TicketsService } from '@lib/common/tickets/Tickets.service';
import { TicketsSearchInputDto } from '@app/server/controllers/tickets/dto/TicketsSearchInput.dto';
import { TicketsSearchResponseDto } from '@app/server/controllers/tickets/dto/TicketsSearchResponse.dto';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import { TicketsCountInputDto } from '@app/server/controllers/tickets/dto/TicketsCountInput.dto';
import { TicketsCountResponseDto } from '@app/server/controllers/tickets/dto/TicketsCountResponse.dto';
import { TicketsValidateTicketResponseDto } from '@app/server/controllers/tickets/dto/TicketsValidateTicketResponse.dto';
import { TicketsValidateTicketInputDto } from '@app/server/controllers/tickets/dto/TicketsValidateTicketInput.dto';
import { EventsService } from '@lib/common/events/Events.service';
import { RightsService } from '@lib/common/rights/Rights.service';
import { UsersService } from '@lib/common/users/Users.service';
import { toAcceptedAddressFormat } from '@common/global';

/**
 * Controller Handling Tickets
 */
@Injectable()
@ApiBearerAuth()
@ApiTags('tickets')
@Controller('tickets')
export class TicketsController extends ControllerBasics<TicketEntity> {
    /**
     * Dependency Injection
     *
     * @param ticketsService
     * @param eventsService
     * @param rightsService
     * @param usersService
     */
    constructor(
        private readonly ticketsService: TicketsService,
        private readonly eventsService: EventsService,
        private readonly rightsService: RightsService,
        private readonly usersService: UsersService,
    ) {
        super();
    }

    /**
     * Fetches Tickets
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
    async search(@Body() body: TicketsSearchInputDto, @User() user: UserDto): Promise<TicketsSearchResponseDto> {
        const tickets = await this._search(this.ticketsService, body);

        return {
            tickets,
        };
    }

    /**
     * Counts Tickets
     *
     * @param body
     * @param user
     */
    @Post('/count')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async count(@Body() body: TicketsCountInputDto, @User() user: UserDto): Promise<TicketsCountResponseDto> {
        const tickets = await this._count(this.ticketsService, body);

        return {
            tickets,
        };
    }

    /**
     * Validate a ticket ownership linked to an address
     * @param body
     * @param user
     * @param eventId
     */
    @Post('/:eventId/validate-ticket')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError, StatusCodes.BadRequest])
    async validateTicket(
        @Body() body: TicketsValidateTicketInputDto,
        @User() user: UserDto,
        @Param('eventId') eventId: string,
    ): Promise<TicketsValidateTicketResponseDto> {
        const event = await this._authorizeOne(
            this.rightsService,
            this.eventsService,
            user,
            {
                id: eventId,
            },
            'group_id',
            ['admin'],
        );

        const ticket = await this._getOne<TicketEntity>(this.ticketsService, {
            id: body.ticketId,
        });

        if (ticket.group_id !== event.group_id) {
            throw new HttpException(
                {
                    status: StatusCodes.Forbidden,
                    message: 'unauthorized_scan',
                },
                StatusCodes.Forbidden,
            );
        }

        const ticketOwnerRes = await this.usersService.findByAddress(ticket.owner);

        if (ticketOwnerRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'cannot_find_ticket_owner',
                },
                StatusCodes.InternalServerError,
            );
        }

        const ticketOwner = ticketOwnerRes.response;

        if (toAcceptedAddressFormat(ticketOwner.device_address) === toAcceptedAddressFormat(body.address)) {
            return {
                info: {
                    address: ticketOwner.address,
                    username: ticketOwner.username,
                    email: ticketOwner.email,
                    ticket: ticket.id,
                    category: ticket.category,
                },
            };
        } else {
            return {
                info: null,
            };
        }
    }
}
