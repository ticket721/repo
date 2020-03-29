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
     */
    constructor(
        private readonly stripeResourcesService: StripeResourcesService,
        private readonly gemOrdersService: GemOrdersService,
    ) {
        super();
    }

    /**
     * Resolves a cart with a stripe payment intent
     *
     * @param body
     * @param user
     */
    @Post('/resolve/paymentintent')
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
