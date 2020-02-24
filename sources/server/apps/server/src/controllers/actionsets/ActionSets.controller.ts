import {
    Body,
    Controller,
    HttpCode,
    HttpException,
    Post,
    Put,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import {
    Roles,
    RolesGuard,
} from '@app/server/authentication/guards/RolesGuard.guard';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@app/server/authentication/decorators/User.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { search, hash } from '@lib/common/utils/ControllerBasics';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch';
import { ActionsSearchInputDto } from '@app/server/controllers/actionsets/dto/ActionsSearchInput.dto';
import { ActionsSearchResponseDto } from '@app/server/controllers/actionsets/dto/ActionsSearchResponse.dto';
import {
    ActionSetEntity,
    ActionSetStatus,
} from '@lib/common/actionsets/entities/ActionSet.entity';
import { ActionsUpdateInputDto } from '@app/server/controllers/actionsets/dto/ActionsUpdateInput.dto';
import { ActionsUpdateResponseDto } from '@app/server/controllers/actionsets/dto/ActionsUpdateResponse.dto';
import { CRUDResponse } from '@lib/common/crud/CRUD.extension';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet';
import { ActionsHashInputDto } from '@app/server/controllers/actionsets/dto/ActionsHashInput.dto';
import { ActionsHashResponseDto } from '@app/server/controllers/actionsets/dto/ActionsHashResponse.dto';
import { StatusCodes, StatusNames } from '@lib/common/utils/codes';
import { defined } from '@lib/common/utils/defined';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';

/**
 * Generic Actions controller. Recover / delete action sets generated across the app
 */
@ApiBearerAuth()
@ApiTags('actions')
@Controller('actions')
export class ActionSetsController {
    /**
     * Dependency Injection
     * @param actionSetsService
     * @param actionQueue
     */
    constructor(
        private readonly actionSetsService: ActionSetsService,
        @InjectQueue('action') private readonly actionQueue: Queue,
    ) {}

    /**
     * Search for action sets
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
    @UseFilters(new HttpExceptionFilter())
    async search(
        @Body() body: ActionsSearchInputDto,
        @User() user: UserDto,
    ): Promise<ActionsSearchResponseDto> {
        const actionsets = await search<ActionSetEntity, ActionSetsService>(
            this.actionSetsService,
            {
                ...body,
                owner: {
                    $eq: user.id.toString(),
                },
            } as SortablePagedSearch,
        );

        return {
            actionsets,
        };
    }

    /**
     * Hashes a result, used to know when data changed
     *
     * @param body
     * @param user
     */
    @Post('/hash')
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
    @UseFilters(new HttpExceptionFilter())
    async hash(
        @Body() body: ActionsHashInputDto,
        @User() user: UserDto,
    ): Promise<ActionsHashResponseDto> {
        const { hash_fields, ...query } = body;

        const [count, hashed] = await hash<ActionSetEntity, ActionSetsService>(
            this.actionSetsService,
            {
                ...query,
                owner: {
                    $eq: user.id.toString(),
                },
            } as SortablePagedSearch,
            hash_fields,
        );

        return {
            hash: hashed,
            count,
        };
    }

    /**
     * Route to update an action, its data and its status.
     * Will make the action dispatchable in the action queue.
     *
     * @param body
     * @param user
     */
    @Put('/')
    @ApiResponse({
        status: StatusCodes.InternalServerError,
        description: StatusNames[StatusCodes.InternalServerError],
    })
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
    async updateAction(
        @Body() body: ActionsUpdateInputDto,
        @User() user: UserDto,
    ): Promise<ActionsUpdateResponseDto> {
        const searchResult: CRUDResponse<ActionSetEntity[]> = await this.actionSetsService.search(
            {
                id: body.actionset_id,
            },
        );

        if (searchResult.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: searchResult.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        if (searchResult.response.length === 0) {
            throw new HttpException(
                {
                    status: StatusCodes.NotFound,
                    message: 'actionset_not_found',
                },
                StatusCodes.NotFound,
            );
        }

        const actionSet: ActionSet = new ActionSet().load(
            searchResult.response[0],
        );

        if (!actionSet.isOwner(user)) {
            throw new HttpException(
                {
                    status: StatusCodes.NotFound,
                    message: 'actionset_not_found',
                },
                StatusCodes.NotFound,
            );
        }

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

        actionSet.actions[body.action_idx].setData(body.data);

        actionSet.setStatus(
            `${
                actionSet.actions[body.action_idx].type
            }:waiting` as ActionSetStatus,
        );
        actionSet.actions[body.action_idx].setStatus('waiting');

        actionSet.setCurrentAction(body.action_idx);

        const updateQuery = actionSet.getQuery();
        const updateBody = actionSet.withoutQuery();

        const res = await this.actionSetsService.update(updateQuery, {
            ...updateBody,
            dispatched_at: new Date(Date.now()),
        });

        await this.actionQueue.add('input', actionSet.raw);

        if (res.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: res.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        return {
            actionset: res.response,
        };
    }
}
