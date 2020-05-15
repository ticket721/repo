import { Body, Controller, HttpCode, Injectable, Post, UseFilters, UseGuards } from '@nestjs/common';
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
     */
    constructor(private readonly ticketsService: TicketsService) {
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
}
