import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpException,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ActionsSearchInputDto } from '@app/server/actions/dto/ActionsSearchInput.dto';
import { ActionsSearchResponseDto } from '@app/server/actions/dto/ActionsSearchResponse.dto';
import {
    Roles,
    RolesGuard,
} from '@app/server/authentication/guards/RolesGuard.guard';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@app/server/authentication/decorators/User.decorator';
import { UserEntity } from '@lib/common/users/entities/User.entity';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra';
import { ESSearchBodyBuilder } from '@lib/common/utils/ESSearchBodyBuilder';
import { ServiceResponse } from '@app/server/utils/ServiceResponse';
import { StatusCodes, StatusNames } from '@app/server/utils/codes';
import { fromES } from '@app/server/utils/fromES';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch';

@ApiBearerAuth()
@ApiTags('actions')
@Controller('actions')
export class ActionsController {
    constructor(private readonly actionSetsService: ActionSetsService) {}

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
        const es: ServiceResponse<Partial<
            EsSearchOptionsStatic
        >> = ESSearchBodyBuilder({
            ...body,
            owner: {
                $eq: user.id,
            },
        } as SortablePagedSearch);

        /**
         * Handle Query Builder errors
         */
        if (es.error) {
            switch (es.error) {
                case 'page_index_without_page_size': {
                    throw new HttpException(
                        {
                            status: StatusCodes.BadRequest,
                            message: es.error,
                        },
                        StatusCodes.BadRequest,
                    );
                }
            }
        }

        const searchResults = await this.actionSetsService.searchElastic(
            es.response,
        );

        /**
         * Handle Request errors
         */
        if (searchResults.error) {
            switch (searchResults.error) {
                default: {
                    throw new HttpException(
                        {
                            status: StatusCodes.InternalServerError,
                            message: searchResults.error,
                        },
                        StatusCodes.InternalServerError,
                    );
                }
            }
        }

        if (searchResults.response.hits.total !== 0) {
            return {
                actionsets: searchResults.response.hits.hits.map(fromES),
            };
        }

        return {
            actionsets: [],
        };
    }
}
