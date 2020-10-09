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
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { CategoriesSearchInputDto } from '@app/server/controllers/categories/dto/CategoriesSearchInput.dto';
import { CategoriesSearchResponseDto } from '@app/server/controllers/categories/dto/CategoriesSearchResponse.dto';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { CategoriesCountInputDto } from '@app/server/controllers/categories/dto/CategoriesCountInput.dto';
import { CategoriesCountResponseDto } from '@app/server/controllers/categories/dto/CategoriesCountResponse.dto';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { AuthGuard } from '@nestjs/passport';
import { CategoriesAddDateLinkInputDto } from '@app/server/controllers/categories/dto/CategoriesAddDateLinkInput.dto';
import { CategoriesAddDateLinkResponseDto } from '@app/server/controllers/categories/dto/CategoriesAddDateLinkResponse.dto';
import { EventsService } from '@lib/common/events/Events.service';
import { DatesService } from '@lib/common/dates/Dates.service';

/**
 * Generic Categories controller. Recover Categories linked to all types of events
 */
@Injectable()
@ApiBearerAuth()
@ApiTags('categories')
@Controller('categories')
export class CategoriesController extends ControllerBasics<CategoryEntity> {
    /**
     * Dependency Injection
     *
     * @param categoriesService
     * @param eventsService
     * @param datesService
     */
    constructor(
        private readonly categoriesService: CategoriesService,
        private readonly eventsService: EventsService,
        private readonly datesService: DatesService,
    ) {
        super();
    }

    /**
     * Search for categories
     *
     * @param body
     */
    @Post('/search')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized])
    async search(@Body() body: CategoriesSearchInputDto): Promise<CategoriesSearchResponseDto> {
        const categories = await this._search(this.categoriesService, body);

        return {
            categories,
        };
    }

    /**
     * Count for categories
     *
     * @param body
     */
    @Post('/count')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized])
    async count(@Body() body: CategoriesCountInputDto): Promise<CategoriesCountResponseDto> {
        const categories = await this._count(this.categoriesService, body);

        return {
            categories,
        };
    }

    private async isCategoryOwner(category: CategoryEntity, user: UserDto): Promise<boolean> {
        const event = await this._serviceCall(
            this.eventsService.findOneFromGroupId(category.group_id),
            StatusCodes.InternalServerError,
        );

        return event.owner === user.id;
    }

    /**
     * Links a category to a new date
     *
     * @param categoryId
     * @param body
     * @param user
     */
    @Post('/:category/date')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.Created)
    @Roles('authenticated')
    @ApiResponses([
        StatusCodes.Created,
        StatusCodes.Unauthorized,
        StatusCodes.BadRequest,
        StatusCodes.InternalServerError,
    ])
    async addDateLink(
        @Param('category') categoryId: string,
        @Body() body: CategoriesAddDateLinkInputDto,
        @User() user: UserDto,
    ): Promise<CategoriesAddDateLinkResponseDto> {
        const category = await this._crudCall(
            this.categoriesService.findOne(categoryId),
            StatusCodes.InternalServerError,
        );

        if (!(await this.isCategoryOwner(category, user))) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'not_category_owner',
                },
                StatusCodes.Unauthorized,
            );
        }

        if (category.dates.indexOf(body.date) !== -1) {
            throw new HttpException(
                {
                    status: StatusCodes.Conflict,
                    message: 'already_linked',
                },
                StatusCodes.Conflict,
            );
        }

        const date = await this._crudCall(this.datesService.findOne(body.date), StatusCodes.InternalServerError);

        if (date.group_id !== category.group_id) {
            throw new HttpException(
                {
                    status: StatusCodes.Unauthorized,
                    message: 'not_date_owner',
                },
                StatusCodes.Unauthorized,
            );
        }

        await this._crudCall(this.datesService.addCategory(body.date, category), StatusCodes.InternalServerError);

        return {
            category: {
                ...category,
                dates: [...category.dates, body.date],
            },
        };
    }
}
