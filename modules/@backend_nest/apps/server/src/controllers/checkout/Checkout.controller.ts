import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpException, Post, UseFilters, UseGuards } from '@nestjs/common';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { User } from '@app/server/authentication/decorators/User.controller.decorator';
import { StripeResourcesService } from '@lib/common/striperesources/StripeResources.service';
import { ResolveCartWithPaymentIntentInputDto } from '@app/server/controllers/checkout/dto/ResolveCartWithPaymentIntentInput.dto';
import { ResolveCartWithPaymentIntentResponseDto } from '@app/server/controllers/checkout/dto/ResolveCartWithPaymentIntentResponse.dto';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { GemOrdersService } from '@lib/common/gemorders/GemOrders.service';
import regionRestrictions from '@app/server/controllers/checkout/restrictions/regionRestrictions.value';
import methodsRestrictions from '@app/server/controllers/checkout/restrictions/methodsRestrictions.value';
import { keccak256 } from '@common/global';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';
import { StripeResourceEntity } from '@lib/common/striperesources/entities/StripeResource.entity';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';
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

    @Post('/cart/commit/stripe')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
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

        const ticketSelectionsData: CartTicketSelections = actionSet.actions[0].data;
        const authorizationsData: CartAuthorizations = actionSet.actions[2].data;

        await this.authorizationQueue.add('generateMintingAuthorizations', {
            actionSetId: actionSet.id,
            authorizations: ticketSelectionsData.tickets,
            oldAuthorizations: authorizationsData ? authorizationsData.authorizations : null,
            commitType: 'stripe',
            expirationTime: 2 * DAY,
            prices: ticketSelectionsData.total,
            signatureReadable: false,
            grantee: user,
        });

        return {
            cart: body.cart,
        };
    }

    /**
     * Resolves a cart with a stripe payment intent
     *
     * @param body
     * @param user
     */
    @Post('/cart/resolve/paymentintent')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @UseFilters(new HttpExceptionFilter())
    @HttpCode(StatusCodes.OK)
    @Roles('authenticated')
    @ApiResponses([StatusCodes.OK, StatusCodes.InternalServerError, StatusCodes.Conflict])
    async resolveCartWithPaymentIntent(
        @Body() body: ResolveCartWithPaymentIntentInputDto,
        @User() user: UserDto,
    ): Promise<ResolveCartWithPaymentIntentResponseDto> {
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
                id: body.paymentIntentId.toString(),
                used_by: user.id,
            },
            {
                if_not_exist: true,
            },
        );

        const gemId: string = keccak256(body.paymentIntentId)
            .slice(2)
            .toLowerCase();

        const gemOrderCreationQuery = await this.gemOrdersService.startGemOrder(
            'token_minting',
            user.id,
            {
                paymentIntentId: body.paymentIntentId,
                currency: 'eur',
                amount: 10000,
                regionRestrictions,
                methodsRestrictions,
                userId: user.id,
            },
            gemId,
        );

        if (gemOrderCreationQuery.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'gem_order_creation_error',
                },
                StatusCodes.InternalServerError,
            );
        }

        const gemOrder = await this._getOne<GemOrderEntity>(this.gemOrdersService, {
            id: gemId,
        });

        return {
            gemOrder,
        };
    }
}
