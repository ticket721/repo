import { Body, Controller, HttpCode, HttpException, Param, Post, Put, UseFilters, UseGuards } from '@nestjs/common';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { ActionsSearchInputDto } from '@app/server/controllers/actionsets/dto/ActionsSearchInput.dto';
import { ActionsSearchResponseDto } from '@app/server/controllers/actionsets/dto/ActionsSearchResponse.dto';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { ActionsUpdateInputDto } from '@app/server/controllers/actionsets/dto/ActionsUpdateInput.dto';
import { ActionsUpdateResponseDto } from '@app/server/controllers/actionsets/dto/ActionsUpdateResponse.dto';
import { CRUDResponse } from '@lib/common/crud/CRUDExtension.base';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { defined } from '@lib/common/utils/defined.helper';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { ActionsCreateInputDto } from '@app/server/controllers/actionsets/dto/ActionsCreateInput.dto';
import { ActionsCreateResponseDto } from '@app/server/controllers/actionsets/dto/ActionsCreateResponse.dto';
import { RightsService } from '@lib/common/rights/Rights.service';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { EventCreateAcsetBuilderArgs } from '@lib/common/events/acset_builders/EventCreate.acsetbuilder.helper';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import { ActionsConsumeUpdateInputDto } from '@app/server/controllers/actionsets/dto/ActionsConsumeUpdateInput.dto';
import { ActionsConsumeUpdateResponseDto } from '@app/server/controllers/actionsets/dto/ActionsConsumeUpdateResponse.dto';

/**
 * Generic Actions controller. Recover / delete action sets generated across the app
 */
@ApiBearerAuth()
@ApiTags('actions')
@Controller('actions')
export class ActionSetsController extends ControllerBasics<ActionSetEntity> {
    /**
     * Dependency Injection
     * @param actionSetsService
     * @param rightsService
     */
    constructor(private readonly actionSetsService: ActionSetsService, private readonly rightsService: RightsService) {
        super();
    }

    /**
     * Search for action sets
     *
     * @param body
     * @param user
     */
    @Post('/search')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.InternalServerError, StatusCodes.Unauthorized, StatusCodes.BadRequest])
    async search(@Body() body: ActionsSearchInputDto, @User() user: UserDto): Promise<ActionsSearchResponseDto> {
        const actionsets = await this._searchRestricted(this.actionSetsService, this.rightsService, user, 'id', body);

        return {
            actionsets,
        };
    }

    /**
     * Route to update an actionset consumed flag
     *
     * @param body
     * @param actionSetId
     * @param user
     */
    @Put('/:actionSetId/consume')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.BadRequest, StatusCodes.Conflict])
    async consumeUpdate(
        @Body() body: ActionsConsumeUpdateInputDto,
        @Param('actionSetId') actionSetId: string,
        @User() user: UserDto,
    ): Promise<ActionsConsumeUpdateResponseDto> {
        const actionSetEntity: ActionSetEntity = await this._authorizeOne(
            this.rightsService,
            this.actionSetsService,
            user,
            {
                id: actionSetId,
            },
            'id',
            ['owner'],
        );

        await this._crudCall<ActionSetEntity>(
            this.actionSetsService.update(
                {
                    id: actionSetId,
                },
                {
                    consumed: body.consumed,
                },
            ),
            StatusCodes.InternalServerError,
            'cannot_change_consume_flag',
        );

        return {
            actionset: {
                ...actionSetEntity,
                consumed: body.consumed,
            },
        };
    }
    /**
     * Route to update an action, its data and its status.
     * Will make the action dispatchable in the action queue.
     *
     * @param body
     * @param actionSetId
     * @param user
     */
    @Put('/:actionSetId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.BadRequest, StatusCodes.Conflict])
    async updateAction(
        @Body() body: ActionsUpdateInputDto,
        @Param('actionSetId') actionSetId: string,
        @User() user: UserDto,
    ): Promise<ActionsUpdateResponseDto> {
        const actionSetEntity: ActionSetEntity = await this._authorizeOne(
            this.rightsService,
            this.actionSetsService,
            user,
            {
                id: actionSetId,
            },
            'id',
            ['owner'],
        );

        const actionSet = new ActionSet().load(actionSetEntity);

        if (!defined(body.action_idx)) {
            body.action_idx = actionSet.current_action;
        } else if (body.action_idx > actionSet.current_action) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'action_idx_after_current_action',
                },
                StatusCodes.BadRequest,
            );
        }

        if (actionSet.actions[body.action_idx].private) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'cannot_update_private_action',
                },
                StatusCodes.Unauthorized,
            );
        }

        const actionSetUpdateDispatchRes = await this.actionSetsService.updateAction(
            actionSet,
            body.action_idx,
            body.data,
        );

        // Cannot trigger this step from e2e
        /* istanbul ignore next */
        if (actionSetUpdateDispatchRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'cannot_update_action_set',
                },
                StatusCodes.InternalServerError,
            );
        }

        return {
            actionset: actionSetUpdateDispatchRes.response,
        };
    }

    /**
     * Route to create an action set, its data and its status.
     * Will make the action dispatchable in the action queue.
     *
     * @param body
     * @param user
     */
    @Post('/')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.Created)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.Created, StatusCodes.BadRequest])
    async createActions(@Body() body: ActionsCreateInputDto, @User() user: UserDto): Promise<ActionsCreateResponseDto> {
        const response: CRUDResponse<ActionSetEntity> = await this.actionSetsService.build<EventCreateAcsetBuilderArgs>(
            body.name,
            user,
            body.arguments,
        );

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
