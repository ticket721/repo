import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
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

/**
 * Generic Actions controller. Recover / delete action sets generated across the app
 */
@ApiBearerAuth()
@ApiTags('actions')
@Controller('actions')
export class ActionSetsController {
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
}
