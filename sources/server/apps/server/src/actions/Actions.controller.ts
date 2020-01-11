import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ActionsSearchInputDto } from '@app/server/actions/dto/ActionsSearchInput.dto';
import { ActionsSearchResponseDto } from '@app/server/actions/dto/ActionsSearchResponse.dto';
import {
    Roles,
    RolesGuard,
} from '@app/server/authentication/guards/RolesGuard.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@app/server/authentication/decorators/User.decorator';
import { UserEntity } from '@lib/common/users/entities/User.entity';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra';
import { ESSearchBodyBuilder } from '@lib/common/utils/ESSearchBodyBuilder';
import { ServiceResponse } from '@app/server/utils/ServiceResponse';

@ApiBearerAuth()
@Controller('actions')
export class ActionsController {
    constructor(private readonly actionSetsService: ActionSetsService) {}

    @Post('/search')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('authenticated')
    async search(
        @Body() body: ActionsSearchInputDto,
        @User() user: UserDto,
    ): Promise<ActionsSearchResponseDto> {
        console.log(body);
        const es: ServiceResponse<Partial<
            EsSearchOptionsStatic
        >> = ESSearchBodyBuilder(body);

        if (es.error) {
            console.log('err');
            return;
        }

        console.log(JSON.stringify(es.response, null, 4));

        const searchResults = await this.actionSetsService.searchElastic(
            es.response,
        );

        console.log(JSON.stringify(searchResults.response.hits.hits, null, 4));

        return {} as ActionsSearchResponseDto;
    }
}
