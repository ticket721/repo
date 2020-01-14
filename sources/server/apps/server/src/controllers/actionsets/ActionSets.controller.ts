import {
    Body,
    Controller,
    HttpCode,
    HttpException,
    Post,
    Put,
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
import { StatusCodes, StatusNames } from '@app/server/utils/codes';
import { search } from '@lib/common/utils/ControllerBasics';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch';
import { ActionsSearchInputDto } from '@app/server/controllers/actionsets/dto/ActionsSearchInput.dto';
import { ActionsSearchResponseDto } from '@app/server/controllers/actionsets/dto/ActionsSearchResponse.dto';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { ActionsUpdateInputDto } from '@app/server/controllers/actionsets/dto/ActionsUpdateInput.dto';
import { ActionsUpdateResponseDto } from '@app/server/controllers/actionsets/dto/ActionsUpdateResponse.dto';
import { CRUDResponse } from '@lib/common/crud/CRUD.extension';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet';

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
     */
    constructor(private readonly actionSetsService: ActionSetsService) {}

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

        actionSet.action.setData<any>(body.data);

        actionSet.setStatus('waiting');
        actionSet.action.setStatus('waiting');

        const updateQuery = actionSet.getQuery();
        const updateBody = actionSet.withoutQuery();

        const res = await this.actionSetsService.update(
            updateQuery,
            updateBody,
        );

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
