import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpException,
    Injectable,
    Param,
    Post,
    Put,
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
import { CategoriesDeleteResponseDto } from '@app/server/controllers/categories/dto/CategoriesDeleteResponse.dto';
import { CategoriesRemoveDateLinkResponseDto } from '@app/server/controllers/categories/dto/CategoriesRemoveDateLinkResponse.dto';
import { CategoryCreationPayload, checkCategory } from '@common/global';
import { CategoriesEditInputDto } from '@app/server/controllers/categories/dto/CategoriesEditInput.dto';
import { CategoriesEditResponseDto } from '@app/server/controllers/categories/dto/CategoriesEditResponse.dto';
import { isNil, merge, pickBy } from 'lodash';
import { TicketsService } from '@lib/common/tickets/Tickets.service';
import { CategoriesOwnerResponseDto } from '@app/server/controllers/categories/dto/CategoriesOwnerResponse.dto';
import { CategoriesCountTicketResponseDto } from '@app/server/controllers/categories/dto/CategoriesCountTicketResponse.dto';

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
     * @param ticketsService
     */
    constructor(
        private readonly categoriesService: CategoriesService,
        private readonly eventsService: EventsService,
        private readonly datesService: DatesService,
        private readonly ticketsService: TicketsService,
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
     * Search for category owner
     *
     * @param categoryId
     */
    @Get('/owner/:category')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized])
    async ownerOf(@Param('category') categoryId: string): Promise<CategoriesOwnerResponseDto> {
        const category = await this._crudCall(
            this.categoriesService.findOne(categoryId),
            StatusCodes.InternalServerError,
        );

        const owner = await this.getCategoryOwner(category);

        return {
            owner,
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

    /**
     * Count for tickets created in the category
     *
     */
    @Get('/:category/ticket-count')
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized])
    async countCategory(@Param('category') categoryId: string): Promise<CategoriesCountTicketResponseDto> {
        const count = await this._serviceCall(
            this.ticketsService.getTicketCount(categoryId),
            StatusCodes.InternalServerError,
        );

        return {
            count,
        };
    }

    private async getCategoryOwner(category: CategoryEntity): Promise<string> {
        const event = await this._serviceCall(
            this.eventsService.findOneFromGroupId(category.group_id),
            StatusCodes.InternalServerError,
        );

        return event.owner;
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

    /**
     * Removes a category link
     *
     * @param categoryId
     * @param dateId
     * @param user
     */
    @Delete('/:category/date/:date')
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
    async removeDateLink(
        @Param('category') categoryId: string,
        @Param('date') dateId: string,
        @User() user: UserDto,
    ): Promise<CategoriesRemoveDateLinkResponseDto> {
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

        if (category.dates.length <= 1) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'date_link_count_too_low',
                },
                StatusCodes.BadRequest,
            );
        }

        await this._crudCall(
            this.datesService.removeCategory(dateId, category),
            StatusCodes.InternalServerError,
            'error_while_removing_link',
        );

        return {};
    }

    /**
     * Edits a category
     *
     * @param categoryId
     * @param body
     * @param user
     */
    @Put('/:category')
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
    async edit(
        @Param('category') categoryId: string,
        @Body() body: CategoriesEditInputDto,
        @User() user: UserDto,
    ): Promise<CategoriesEditResponseDto> {
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

        const existingCategoryCreationPayload: CategoryCreationPayload = {
            name: category.display_name,
            saleBegin: new Date(category.sale_begin),
            saleEnd: new Date(category.sale_end),
            seats: category.seats,
            price: category.price,
            currency: category.currency,
        };

        const identityNotNil = (val: any): boolean => !isNil(val);

        const categoryEditionPayload: CategoryCreationPayload = merge(
            {},
            existingCategoryCreationPayload,
            pickBy(body.category, identityNotNil),
        );

        const checkResult = checkCategory(categoryEditionPayload);

        if (checkResult !== null) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'category_payload_validation_error',
                },
                StatusCodes.BadRequest,
            );
        }

        const ticketCount = await this._serviceCall(
            this.ticketsService.getTicketCount(categoryId),
            StatusCodes.InternalServerError,
        );

        if (ticketCount > categoryEditionPayload.seats) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_seat_count',
                },
                StatusCodes.BadRequest,
            );
        }

        const identityNotUndef = (val: any): boolean => val !== undefined;

        const editPayload = pickBy(
            {
                category_name: categoryId,
                display_name: categoryEditionPayload.name,
                sale_begin: categoryEditionPayload.saleBegin,
                sale_end: categoryEditionPayload.saleEnd,
                price: categoryEditionPayload.price,
                currency: categoryEditionPayload.currency,
                interface: CategoriesService.interfaceFromCurrencyAndPrice(
                    categoryEditionPayload.currency,
                    categoryEditionPayload.price,
                ),
                seats: categoryEditionPayload.seats,
            },
            identityNotUndef,
        );

        await this._crudCall(
            this.categoriesService.update(
                {
                    id: categoryId,
                },
                editPayload,
            ),
            StatusCodes.InternalServerError,
        );

        const updatedCategory = await this._crudCall(
            this.categoriesService.findOne(categoryId),
            StatusCodes.InternalServerError,
        );

        return {
            category: updatedCategory,
        };
    }

    /**
     * Removes a category
     *
     * @param categoryId
     * @param user
     */
    @Delete('/:category')
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
    async delete(@Param('category') categoryId: string, @User() user: UserDto): Promise<CategoriesDeleteResponseDto> {
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
        const ticketCount = await this._serviceCall(
            this.ticketsService.getTicketCount(categoryId),
            StatusCodes.InternalServerError,
        );

        if (ticketCount > 0) {
            await this._crudCall(
                this.categoriesService.update(
                    {
                        id: categoryId,
                    },
                    {
                        seats: ticketCount,
                    },
                ),
                StatusCodes.InternalServerError,
            );

            const updatedCategoryEntity = await this._crudCall(
                this.categoriesService.findOne(categoryId),
                StatusCodes.InternalServerError,
            );

            return {
                category: updatedCategoryEntity,
            };
        } else {
            for (const dateId of category.dates) {
                await this._crudCall(
                    this.datesService.removeCategory(dateId, category),
                    StatusCodes.InternalServerError,
                    'error_while_removing_date_link',
                );
            }

            await this._crudCall(
                this.categoriesService.delete({
                    id: category.id,
                }),
                StatusCodes.InternalServerError,
                'error_while_deleting_category',
            );

            return {
                category: null,
            };
        }
    }
}
