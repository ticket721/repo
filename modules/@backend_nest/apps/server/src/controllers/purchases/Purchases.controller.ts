import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { StripeInterfaceEntity } from '@lib/common/stripeinterface/entities/StripeInterface.entity';
import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpException,
    Injectable,
    Post,
    Put,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
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
import { PurchasesSetProductsInputDto } from '@app/server/controllers/purchases/dto/PurchasesSetProductsInput.dto';
import { PurchasesSetProductsResponseDto } from '@app/server/controllers/purchases/dto/PurchasesSetProductsResponse.dto';
import { PurchasesCheckoutInputDto } from '@app/server/controllers/purchases/dto/PurchasesCheckoutInput.dto';
import { PurchasesCheckoutResponseDto } from '@app/server/controllers/purchases/dto/PurchasesCheckoutResponse.dto';
import { PurchasesCloseResponseDto } from '@app/server/controllers/purchases/dto/PurchasesCloseResponse.dto';
import { PurchasesCloseInputDto } from './dto/PurchasesCloseInput.dto';
import { isNil } from 'lodash';

/**
 * Controller exposing routes to manage the Stripe Interface of an user
 */
@Injectable()
@ApiBearerAuth()
@ApiTags('purchases')
@Controller('purchases')
export class PurchasesController extends ControllerBasics<StripeInterfaceEntity> {
    /**
     * Dependency Injection
     *
     * @param usersService
     * @param purchasesService
     */
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
    @UseGuards(AuthGuard('jwt'), RolesGuard)
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

        const cartWithUpdatedPayment = await this._serviceCall(
            this.purchasesService.updatePaymentStatus(user, cartPurchaseEntity),
            StatusCodes.InternalServerError,
        );

        return {
            cart: cartWithUpdatedPayment,
            errors: cartPurchaseErrors,
        };
    }

    /**
     * Update cart content
     *
     * @param body
     * @param user
     */
    @Put('/')
    @UseFilters(new HttpExceptionFilter())
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('authenticated')
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    async setProducts(
        @Body() body: PurchasesSetProductsInputDto,
        @User() user: UserDto,
    ): Promise<PurchasesSetProductsResponseDto> {
        const cartPurchaseEntityId = await this._crudCall(
            this.usersService.recoverUserCart(user.id),
            StatusCodes.InternalServerError,
        );

        const cartPurchaseEntity = await this._crudCall(
            this.purchasesService.findOne(cartPurchaseEntityId.toString()),
            StatusCodes.InternalServerError,
        );

        const cartPurchaseUpdate = await this._serviceCall(
            this.purchasesService.setCartProducts(user, cartPurchaseEntity, body.products),
            StatusCodes.BadRequest,
        );

        return {
            purchase: cartPurchaseUpdate[0],
            errors: cartPurchaseUpdate[1],
        };
    }

    /**
     * Proceed to checkout
     *
     * @param body
     * @param user
     */
    @Post('/checkout')
    @UseFilters(new HttpExceptionFilter())
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @Roles('authenticated')
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    async checkout(
        @Body() body: PurchasesCheckoutInputDto,
        @User() user: UserDto,
    ): Promise<PurchasesCheckoutResponseDto> {
        const cartPurchaseEntityId = await this._crudCall(
            this.usersService.recoverUserCart(user.id),
            StatusCodes.InternalServerError,
        );

        const cartPurchaseEntity = await this._crudCall(
            this.purchasesService.findOne(cartPurchaseEntityId.toString()),
            StatusCodes.InternalServerError,
        );

        if (cartPurchaseEntity.products.length === 0) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'empty_cart',
                },
                StatusCodes.BadRequest,
            );
        }

        if (cartPurchaseEntity.payment_interface === null) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'no_payment_interface',
                },
                StatusCodes.BadRequest,
            );
        }

        if (body[cartPurchaseEntity.payment_interface] === undefined) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'no_payment_interface_arguments',
                },
                StatusCodes.BadRequest,
            );
        }

        const cartCheckout = await this._serviceCall(
            this.purchasesService.checkout(user, cartPurchaseEntity, body[cartPurchaseEntity.payment_interface]),
            StatusCodes.InternalServerError,
        );

        return {
            purchase: cartCheckout[0],
            product_errors: cartCheckout[1],
            payment_error: cartCheckout[2],
        };
    }

    /**
     * Clears cart when payment succesful
     *
     * @param body
     * @param user
     */
    @Post('/close')
    @UseFilters(new HttpExceptionFilter())
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @Roles('authenticated')
    @HttpCode(StatusCodes.OK)
    @ApiResponses([StatusCodes.OK, StatusCodes.Unauthorized, StatusCodes.InternalServerError])
    async close(@Body() body: PurchasesCloseInputDto, @User() user: UserDto): Promise<PurchasesCloseResponseDto> {
        const cartPurchaseEntityId = await this._crudCall(
            this.usersService.recoverUserCart(user.id),
            StatusCodes.InternalServerError,
        );

        const cartPurchaseEntity = await this._crudCall(
            this.purchasesService.findOne(cartPurchaseEntityId.toString()),
            StatusCodes.InternalServerError,
        );

        if (cartPurchaseEntity.payment === null) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'payment_not_started',
                },
                StatusCodes.BadRequest,
            );
        }

        if (cartPurchaseEntity.payment.status === 'waiting') {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'payment_still_waiting',
                },
                StatusCodes.BadRequest,
            );
        }

        if (!isNil(cartPurchaseEntity.closed_at)) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'purchase_already_closed',
                },
                StatusCodes.BadRequest,
            );
        }

        const purchaseCloseErrors = await this._serviceCall(
            this.purchasesService.close(user, cartPurchaseEntity, body?.appUrl, body?.timezone),
            StatusCodes.InternalServerError,
        );

        return {
            products: cartPurchaseEntity.products,
            errors: purchaseCloseErrors,
        };
    }
}
