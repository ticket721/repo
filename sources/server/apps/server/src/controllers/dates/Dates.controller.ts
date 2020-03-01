import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@app/server/authentication/decorators/User.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { search } from '@lib/common/utils/ControllerBasics';
import { DatesService } from '@lib/common/dates/Dates.service';
import { DatesSearchResponseDto } from '@app/server/controllers/dates/dto/DatesSearchResponse.dto';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { DatesSearchInputDto } from '@app/server/controllers/dates/dto/DatesSearchInput.dto';
import { StatusCodes, StatusNames } from '@lib/common/utils/codes';

/**
 * Generic Dates controller. Recover Dates linked to all types of events
 */
@ApiBearerAuth()
@ApiTags('dates')
@Controller('dates')
export class DatesController {
    /**
     * Dependency Injection
     *
     * @param datesService
     */
    constructor(private readonly datesService: DatesService) {}

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
    async search(@Body() body: DatesSearchInputDto, @User() user: UserDto): Promise<DatesSearchResponseDto> {
        const dates = await search<DateEntity, DatesService>(this.datesService, body);

        return {
            dates,
        };
    }
}
