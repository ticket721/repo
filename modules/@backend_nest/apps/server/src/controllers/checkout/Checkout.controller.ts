import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpException, Post, UseFilters, UseGuards } from '@nestjs/common';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { GemOrdersService } from '@lib/common/gemorders/GemOrders.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
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
import { HOUR } from '@lib/common/utils/time';
import { CheckoutResolveCartWithPaymentIntentInputDto } from '@app/server/controllers/checkout/dto/CheckoutResolveCartWithPaymentIntentInput.dto';
import { CheckoutResolveCartWithPaymentIntentResponseDto } from '@app/server/controllers/checkout/dto/CheckoutResolveCartWithPaymentIntentResponse.dto';
import { keccak256, log2 } from '@common/global';
import regionRestrictions from './restrictions/regionRestrictions.value';
import methodsRestrictions from './restrictions/methodsRestrictions.value';
import { ValidGuard } from '@app/server/authentication/guards/ValidGuard.guard';
import { Price } from '@lib/common/currencies/Currencies.service';
import { Decimal } from 'decimal.js';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { TimeToolService } from '@lib/common/toolbox/Time.tool.service';
import { AuthorizationsService } from '@lib/common/authorizations/Authorizations.service';
import { StripeService } from '@lib/common/stripe/Stripe.service';
import { Stripe } from 'stripe';
import { AuthorizationEntity } from '@lib/common/authorizations/entities/Authorization.entity';

/**
 * Checkout controller to create, update and resolve carts
 */
@ApiBearerAuth()
@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController extends ControllerBasics<any> {
    /**
     * Dependency Injection
     *
     * @param gemOrdersService
     * @param actionSetsService
     * @param rightsService
     * @param categoriesService
     * @param timeToolService
     * @param authorizationsService
     * @param authorizationQueue
     * @param stripeService
     */
    constructor(
        private readonly gemOrdersService: GemOrdersService,
        private readonly actionSetsService: ActionSetsService,
        private readonly rightsService: RightsService,
        private readonly categoriesService: CategoriesService,
        private readonly timeToolService: TimeToolService,
        private readonly authorizationsService: AuthorizationsService,
        @InjectQueue('authorization') private readonly authorizationQueue: Queue,
        private readonly stripeService: StripeService,
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
            expirationTime: 2 * HOUR,
            prices,
            fees,
            signatureReadable: false,
            grantee: user,
        });

        return {
            cart: body.cart,
        };
    }

    /**
     * Restriction on currencies
     */
    private readonly allowedCurrenciesForStripeCheckout: string[] = ['T721Token'];

    /**
     * Update reserved count on categories being bought
     *
     * @param authorizations
     */
    async updateReserved(authorizations: CartAuthorizations): Promise<ServiceResponse<void>> {
        let counts: { [key: string]: number } = {};

        for (const authorization of authorizations.authorizations) {
            counts = {
                ...counts,
                [authorization.categoryId]: (counts[authorization.categoryId] || 0) + 1,
            };

            const authorizationEntity = await this._getOne<AuthorizationEntity>(this.authorizationsService, {
                id: authorization.authorizationId,
            });

            if (authorizationEntity.user_expiration.getTime() < this.timeToolService.now().getTime()) {
                return {
                    error: 'authorization_expired',
                    response: null,
                };
            }
        }

        for (const category of Object.keys(counts)) {
            const categoryEntity = await this._getOne<CategoryEntity>(this.categoriesService, {
                id: category,
            });

            if (counts[category] > categoryEntity.seats - categoryEntity.reserved) {
                return {
                    error: 'no_seats_left',
                    response: null,
                };
            }

            await this._crudCall(
                this.categoriesService.update(
                    {
                        id: category,
                    },
                    {
                        reserved: categoryEntity.reserved + counts[category],
                    },
                ),
                StatusCodes.InternalServerError,
                'cannot_update_category_reserved',
            );
        }

        return {
            error: null,
            response: null,
        };
    }

    /**
     * Check if country of card payment if valid
     *
     * @param paymentIntent
     */
    checkCountry(paymentIntent: Stripe.PaymentIntent): string {
        try {
            const country = paymentIntent.charges.data[0].payment_method_details.card.country;

            if (regionRestrictions[country] === undefined) {
                return 'region_not_supported';
            }
        } catch (e) {
            return 'unable_to_retrieve_country';
        }

        return null;
    }

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
    async resolveCartWithPaymentMethod(
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
        const stripe: Stripe = this.stripeService.get();

        const paymentIntent = await stripe.paymentIntents.retrieve(authorizationData.paymentIntentId);

        if (paymentIntent.status !== 'requires_capture') {
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_payment_intent_status',
                },
                StatusCodes.BadRequest,
            );
        }

        const regionCheck = this.checkCountry(paymentIntent);

        if (regionCheck) {
            await stripe.paymentIntents.cancel(paymentIntent.id);
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: regionCheck,
                },
                StatusCodes.BadRequest,
            );
        }

        const prices = authorizationData.total;
        const fees = authorizationData.fees;

        // Not readlly testable with only one currency
        /* istanbul ignore next */
        if (prices.length !== 1 || this.allowedCurrenciesForStripeCheckout.indexOf(prices[0].currency)) {
            await stripe.paymentIntents.cancel(paymentIntent.id);
            throw new HttpException(
                {
                    status: StatusCodes.BadRequest,
                    message: 'invalid_currency',
                },
                StatusCodes.BadRequest,
            );
        }

        const gemId: string = keccak256(authorizationData.paymentIntentId)
            .slice(2)
            .toLowerCase();

        const total: number = parseInt(prices[0].value, 10) + parseInt(fees[0], 10);

        const startGemOrder = await this.gemOrdersService.startGemOrder(
            'token_minting',
            user.id,
            {
                paymentIntentId: authorizationData.paymentIntentId,
                currency: 'eur',
                amount: total,
                regionRestrictions,
                methodsRestrictions,
                userId: user.id,
            },
            gemId,
        );

        if (startGemOrder.error) {
            await stripe.paymentIntents.cancel(paymentIntent.id);
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'gem_order_creation_error',
                },
                StatusCodes.InternalServerError,
            );
        }

        const gemOrderReq = await this.gemOrdersService.search({
            id: gemId,
        });

        if (gemOrderReq.error || gemOrderReq.response.length === 0) {
            await stripe.paymentIntents.cancel(paymentIntent.id);
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'gem_order_not_found',
                },
                StatusCodes.InternalServerError,
            );
        }

        const gemOrder = gemOrderReq.response[0];

        const checkoutAcsetReq = await this.actionSetsService.search({
            id: authorizationData.checkoutActionSetId,
        });

        if (checkoutAcsetReq.error || checkoutAcsetReq.response.length === 0) {
            await stripe.paymentIntents.cancel(paymentIntent.id);
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'checkout_actionset_not_found',
                },
                StatusCodes.InternalServerError,
            );
        }

        const checkoutAcset = checkoutAcsetReq.response[0];

        const acsetUpdateRes = await this.actionSetsService.updateAction(checkoutAcset.id, 0, {
            cartId: cart.id,
            commitType: 'stripe',
            buyer: user.address,
            stripe: {
                paymentIntentId: authorizationData.paymentIntentId,
                gemOrderId: gemOrder.id,
            },
        });

        if (acsetUpdateRes.error) {
            await stripe.paymentIntents.cancel(paymentIntent.id);
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'checkout_acsert_update_error',
                },
                StatusCodes.InternalServerError,
            );
        }

        const categorySeatsUpdate = await this.updateReserved(authorizationData);

        if (categorySeatsUpdate.error) {
            await stripe.paymentIntents.cancel(paymentIntent.id);
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: categorySeatsUpdate.error,
                },
                StatusCodes.InternalServerError,
            );
        }

        return {
            checkoutActionSetId: checkoutAcset.id,
            gemOrderId: gemOrder.id,
        };
    }
}
