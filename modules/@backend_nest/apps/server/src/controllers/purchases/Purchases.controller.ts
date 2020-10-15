import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { StripeInterfaceEntity } from '@lib/common/stripeinterface/entities/StripeInterface.entity';
import { Controller, Get, HttpCode, Injectable, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { PurchasesFetchResponseDto } from '@app/server/controllers/purchases/dto/PurchasesFetchResponse.dto';
import { PurchasesService } from '@lib/common/purchases/Purchases.service';
import { UsersService } from '@lib/common/users/Users.service';

/**
 * Controller exposing routes to manage the Stripe Interface of an user
 */
@Injectable()
@ApiBearerAuth()
@ApiTags('purchases')
@Controller('purchases')
export class PurchasesController extends ControllerBasics<StripeInterfaceEntity> {
    constructor(private readonly usersService: UsersService, private readonly purchasesService: PurchasesService) {
        super();
    }

    /**
     * Search for user cart
     *
     * @param user
     */
    @Get('/')
    @UseFilters(new HttpExceptionFilter())
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @Roles('authenticated')
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    async search(@User() user: UserDto): Promise<PurchasesFetchResponseDto> {
        const cartPurchaseEntityId = await this._crudCall(
            this.usersService.recoverUserCart(user.id),
            StatusCodes.InternalServerError,
        );

        const cartPurchaseEntity = await this._crudCall(
            this.purchasesService.findOne(cartPurchaseEntityId.toString()),
            StatusCodes.InternalServerError,
        );

        const cartPurchaseErrors = await this._serviceCall(
            this.purchasesService.checkCartStatus(user, cartPurchaseEntity),
            StatusCodes.InternalServerError,
        );

        return {
            cart: cartPurchaseEntity,
            errors: cartPurchaseErrors,
        };
    }

    // Set - sets all the products in the cart
    // Checkout - validates cart + create possible payment stuff (PI)
    // Pay - Provide data to validate the payment
    // Payment Status - Checks current status until valid or failed
}
