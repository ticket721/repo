import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpException, Post, UseFilters, UseGuards } from '@nestjs/common';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { StripeResourcesService } from '@lib/common/striperesources/StripeResources.service';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { GemOrdersService } from '@lib/common/gemorders/GemOrders.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { StripeResourceEntity } from '@lib/common/striperesources/entities/StripeResource.entity';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { HttpExceptionFilter } from '@app/server/utils/HttpException.filter';
import { ApiResponses } from '@app/server/utils/ApiResponses.controller.decorator';
import { CheckoutCartCommitStripeInputDto } from '@app/server/controllers/checkout/dto/CheckoutCartCommitStripeInput.dto';
import { CheckoutCartCommitStripeResponseDto } from '@app/server/controllers/checkout/dto/CheckoutCartCommitStripeResponse.dto';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { RightsService } from '@lib/common/rights/Rights.service';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CartAuthorizations, CartTicketSelections } from '@app/worker/actionhandlers/cart/Cart.input.handlers';
import { DAY } from '@lib/common/utils/time';
import { CheckoutResolveCartWithPaymentIntentInputDto } from '@app/server/controllers/checkout/dto/CheckoutResolveCartWithPaymentIntentInput.dto';
import { CheckoutResolveCartWithPaymentIntentResponseDto } from '@app/server/controllers/checkout/dto/CheckoutResolveCartWithPaymentIntentResponse.dto';
import { keccak256, log2 } from '@common/global';
import regionRestrictions from './restrictions/regionRestrictions.value';
import methodsRestrictions from './restrictions/methodsRestrictions.value';
import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';
import { CheckoutAcsetBuilderArgs } from '@lib/common/checkout/acset_builders/Checkout.acsetbuilder.helper';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { Price } from '@lib/common/currencies/Currencies.service';
import { Decimal } from 'decimal.js';

/**
 * Checkout controller to create, update and resolve carts
 */
@ApiBearerAuth()
@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController extends ControllerBasics<StripeResourceEntity> {
    /**
     * Dependency Injection
     *
     * @param stripeResourcesService
     * @param gemOrdersService
     * @param actionSetsService
     * @param rightsService
     * @param authorizationQueue
     */
    constructor(
        private readonly stripeResourcesService: StripeResourcesService,
        private readonly gemOrdersService: GemOrdersService,
        private readonly actionSetsService: ActionSetsService,
        private readonly rightsService: RightsService,
        @InjectQueue('authorization') private readonly authorizationQueue: Queue,
    ) {
        super();
    }

    /**
     * Factorize prices and fees by currencies
     *
     * @param prices
     * @param fees
     */
    private factorizePrices(prices: Price[], fees: string[]): [Price[], string[]] {
        const ret: [Price[], string[]] = [[], []];
        let sortedPricesAndFees: { [key: string]: { price: Price; fee: string }[] } = {};

        for (let idx = 0; idx < prices.length; ++idx) {
            sortedPricesAndFees = {
                ...sortedPricesAndFees,
                [prices[idx].currency]: [
                    ...(sortedPricesAndFees[prices[idx].currency] || []),
                    {
                        price: prices[idx],
                        fee: fees[idx],
                    },
                ],
            };
        }

        for (const currency of Object.keys(sortedPricesAndFees)) {
            const total = sortedPricesAndFees[currency]
                .map(spaf => new Decimal(spaf.price.value))
                .reduce((a: Decimal, b: Decimal) => a.add(b))
                .toString();

            const fee = sortedPricesAndFees[currency]
                .map(spaf => new Decimal(spaf.fee))
                .reduce((a: Decimal, b: Decimal) => a.add(b))
                .toString();

            ret[0].push({
                currency,
                value: total,
                log_value: log2(total),
            });

            ret[1].push(fee);
        }

        return ret;
    }

    /**
     * Route to commit a cart to a stripe payment
     *
     * @param body
     * @param user
     */
    @Post('/cart/commit/stripe')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.InternalServerError, StatusCodes.Unauthorized])
    async commitStripe(
        @Body() body: CheckoutCartCommitStripeInputDto,
        @User() user: UserDto,
    ): Promise<CheckoutCartCommitStripeResponseDto> {
        const cart = await this._authorizeOne(
            this.rightsService,
            this.actionSetsService,
            user,
            {
                id: body.cart,
            },
            'id',
            ['owner'],
        );

        const actionSet: ActionSet = new ActionSet().load(cart);

        if (actionSet.name !== '@cart/creation') {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'actionset_not_a_cart',
                },
                StatusCodes.BadRequest,
            );
        }

        if (actionSet.actions[0].status !== 'complete') {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'ticket_selection_not_complete',
                },
                StatusCodes.BadRequest,
            );
        }

        if (actionSet.actions[1].status !== 'complete') {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'modules_configuration_not_complete',
                },
                StatusCodes.BadRequest,
            );
        }

        const ticketSelectionsData: CartTicketSelections = actionSet.actions[0].data;
        const authorizationsData: CartAuthorizations = actionSet.actions[2].data;

        const [prices, fees]: [Price[], string[]] = this.factorizePrices(
            ticketSelectionsData.total,
            ticketSelectionsData.fees,
        );

        await this.authorizationQueue.add('generateMintingAuthorizations', {
            actionSetId: actionSet.id,
            authorizations: ticketSelectionsData.tickets,
            oldAuthorizations: authorizationsData ? authorizationsData.authorizations : null,
            commitType: 'stripe',
            expirationTime: 2 * DAY,
            prices,
            fees,
            signatureReadable: false,
            grantee: user,
        });

        return {
            cart: body.cart,
        };
    }

    private readonly allowedCurrenciesForStripeCheckout: string[] = ['T721Token'];

    /**
     * Resolves a cart with a stripe payment intent
     *
     * @param body
     * @param user
     */
    @Post('/cart/resolve/paymentintent')
    @UseGuards(AuthGuard('jwt'), RolesGuard, ValidGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.InternalServerError, StatusCodes.Conflict])
    async resolveCartWithPaymentIntent(
        @Body() body: CheckoutResolveCartWithPaymentIntentInputDto,
        @User() user: UserDto,
    ): Promise<CheckoutResolveCartWithPaymentIntentResponseDto> {
        const cart = await this._authorizeOne(
            this.rightsService,
            this.actionSetsService,
            user,
            {
                id: body.cart,
            },
            'id',
            ['owner'],
        );

        const actionSet: ActionSet = new ActionSet().load(cart);

        if (actionSet.name !== '@cart/creation') {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'actionset_not_a_cart',
                },
                StatusCodes.BadRequest,
            );
        }

        if (actionSet.status !== 'complete') {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'cart_not_complete',
                },
                StatusCodes.BadRequest,
            );
        }

        const authorizationData: CartAuthorizations = actionSet.actions[actionSet.actions.length - 1].data;

        const prices = authorizationData.total;
        const fees = authorizationData.fees;

        // Not readlly testable with only one currency
        /* istanbul ignore next */
        if (prices.length !== 1 || this.allowedCurrenciesForStripeCheckout.indexOf(prices[0].currency)) {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_currency',
                },
                StatusCodes.BadRequest,
            );
        }

        const stripeResourceEntities: StripeResourceEntity[] = await this._get<StripeResourceEntity>(
            this.stripeResourcesService,
            {
                id: body.paymentIntentId.toLowerCase(),
            },
        );

        if (stripeResourceEntities.length > 0) {
            throw new HttpException(
                {
                    status: StatusCodes.Conflict,
                    message: 'stripe_resource_already_used',
                },
                StatusCodes.Conflict,
            );
        }

        await this._new<StripeResourceEntity>(
            this.stripeResourcesService,
            {
                id: body.paymentIntentId.toLowerCase(),
                used_by: user.id,
            },
            {
                if_not_exist: true,
            },
        );

        const gemId: string = keccak256(body.paymentIntentId)
            .slice(2)
            .toLowerCase();

        const total: number = parseInt(prices[0].value, 10) + parseInt(fees[0], 10);

        await this._serviceCall(
            this.gemOrdersService.startGemOrder(
                'token_minting',
                user.id,
                {
                    paymentIntentId: body.paymentIntentId,
                    currency: 'eur',
                    amount: total,
                    regionRestrictions,
                    methodsRestrictions,
                    userId: user.id,
                },
                gemId,
            ),
            StatusCodes.InternalServerError,
            'gem_order_creation_error',
        );

        const gemOrder = await this._getOne<GemOrderEntity>(this.gemOrdersService, {
            id: gemId,
        });

        const checkoutActionSet = await this._serviceCall(
            this.actionSetsService.build<CheckoutAcsetBuilderArgs>('checkout_create', user, {}, true),
            StatusCodes.InternalServerError,
            'checkout_acset_creation_error',
        );

        await this._serviceCall(
            this.actionSetsService.updateAction(checkoutActionSet.id, 0, {
                cartId: cart.id,
                commitType: 'stripe',
                buyer: user.address,
                stripe: {
                    paymentIntentId: body.paymentIntentId,
                    gemOrderId: gemOrder.id,
                },
            }),
            StatusCodes.InternalServerError,
            'checkout_acset_update_error',
        );

        await this._crudCall<ActionSetEntity>(
            this.actionSetsService.update(
                {
                    id: cart.id,
                },
                {
                    consumed: true,
                },
            ),
            StatusCodes.InternalServerError,
            'unable_to_consume_action_set',
        );

        return {
            checkoutActionSetId: checkoutActionSet.id,
            gemOrderId: gemOrder.id,
        };
    }
}
