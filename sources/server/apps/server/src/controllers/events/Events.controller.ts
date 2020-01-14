import { Body, Controller, HttpCode, HttpException, Post, UseGuards } from '@nestjs/common';
import {
    Roles,
    RolesGuard,
}                                                                     from '@app/server/authentication/guards/RolesGuard.guard';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard }                from '@nestjs/passport';
import { User }                     from '@app/server/authentication/decorators/User.decorator';
import { UserDto }                  from '@lib/common/users/dto/User.dto';
import { StatusCodes, StatusNames } from '@app/server/utils/codes';
import { search }                  from '@lib/common/utils/ControllerBasics';
import { ActionSetsService }       from '@lib/common/actionsets/ActionSets.service';
import { EventsCreateInputDto }    from '@app/server/controllers/events/dto/EventsCreateInput.dto';
import { EventsCreateResponseDto } from '@app/server/controllers/events/dto/EventsCreateResponse.dto';
import { CRUDResponse }            from '@lib/common/crud/CRUD.extension';
import { ActionSetEntity }         from '@lib/common/actionsets/entities/ActionSet.entity';
import { EventsService }           from '@lib/common/events/Events.service';
import { EventsSearchInputDto }    from '@app/server/controllers/events/dto/EventsSearchInput.dto';
import { EventsSearchResponseDto } from '@app/server/controllers/events/dto/EventsSearchResponse.dto';
import { EventEntity }             from '@lib/common/events/entities/Event.entity';
import { ActionSet }               from '@lib/common/actionsets/helper/ActionSet';
import { Action }                  from '@lib/common/actionsets/helper/Action';

/**
 * Generic Dates controller. Recover Dates linked to all types of events
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
     */
    constructor(
        private readonly eventsService: EventsService,
        private readonly actionSetsService: ActionSetsService,
    ) {}

    /**
     * Search for dates
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
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('authenticated')
    async search(
        @Body() body: EventsSearchInputDto,
        @User() user: UserDto,
    ): Promise<EventsSearchResponseDto> {
        const events = await search<EventEntity, EventsService>(
            this.eventsService,
            body,
        );

        return {
            events,
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
    async create(
        @Body() body: EventsCreateInputDto,
        @User() user: UserDto,
    ): Promise<EventsCreateResponseDto> {

        const actions: Action[] = [
            (new Action())
                .setName('eventTextMetadata')
                .setData<EventsCreateInputDto>(body)
                .setType('input')
                .setStatus('in progress'),
        ];
        const actionSet: ActionSet = (new ActionSet())
            .setName('eventCreation')
            .setActions(actions)
            .setOwner(user)
            .setStatus('in progress');

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
