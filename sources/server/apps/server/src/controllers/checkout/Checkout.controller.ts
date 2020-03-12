import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpException, Post, UseGuards } from '@nestjs/common';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { User } from '@app/server/authentication/decorators/User.decorator';
import { StripeResourcesService } from '@lib/common/striperesources/StripeResources.service';
import { ResolveCartWithPaymentIntentInputDto } from '@app/server/controllers/checkout/dto/ResolveCartWithPaymentIntentInput.dto';
import { ResolveCartWithPaymentIntentResponseDto } from '@app/server/controllers/checkout/dto/ResolveCartWithPaymentIntentResponse.dto';
import { StatusCodes, StatusNames } from '@lib/common/utils/codes';
import { GemOrdersService } from '@lib/common/gemorders/GemOrders.service';
import regionRestrictions from '@app/server/controllers/checkout/restrictions/regionRestrictions';
import methodsRestrictions from '@app/server/controllers/checkout/restrictions/methodsRestrictions';
import { keccak256 } from '@ticket721sources/global';
import { AuthGuard } from '@nestjs/passport';
import { Roles, RolesGuard } from '@app/server/authentication/guards/RolesGuard.guard';

/**
 * Checkout controller to create, update and resolve carts
 */
@ApiBearerAuth()
@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController {
    /**
     * Dependency Injection
     *
     * @param stripeResourcesService
     * @param gemOrdersService
     */
    constructor(
        private readonly stripeResourcesService: StripeResourcesService,
        private readonly gemOrdersService: GemOrdersService,
    ) {}

    /**
     * Resolves a cart with a stripe payment intent
     *
     * @param body
     * @param user
     */
    @Post('/resolve/paymentintent')
    @ApiResponse({
        status: StatusCodes.InternalServerError,
        description: StatusNames[StatusCodes.InternalServerError],
    })
    @ApiResponse({
        status: StatusCodes.Conflict,
        description: StatusNames[StatusCodes.Conflict],
    })
    @ApiResponse({
        status: StatusCodes.Unauthorized,
        description: StatusNames[StatusCodes.Unauthorized],
    })
    @ApiResponse({
        status: StatusCodes.OK,
        description: StatusNames[StatusCodes.OK],
    })
    @HttpCode(200)
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('authenticated')
    async resolveCartWithPaymentIntent(
        @Body() body: ResolveCartWithPaymentIntentInputDto,
        @User() user: UserDto,
    ): Promise<ResolveCartWithPaymentIntentResponseDto> {
        const stripeResourceRes = await this.stripeResourcesService.search({
            id: body.paymentIntentId.toLowerCase(),
        });

        if (stripeResourceRes.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'stripe_resource_check_fail',
                },
                StatusCodes.InternalServerError,
            );
        }

        if (stripeResourceRes.response.length > 0) {
            throw new HttpException(
                {
                    status: StatusCodes.Conflict,
                    message: 'stripe_resource_already_used',
                },
                StatusCodes.Conflict,
            );
        }

        const stripeResourceRegistration = await this.stripeResourcesService.create(
            {
                id: body.paymentIntentId.toString(),
                used_by: user.id,
            },
            {
                if_not_exist: true,
            },
        );

        if (stripeResourceRegistration.error) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'stripe_resource_registration_error',
                },
                StatusCodes.InternalServerError,
            );
        }

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

        const gemOrder = await this.gemOrdersService.search({
            id: gemId,
        });

        if (gemOrder.error || gemOrder.response.length === 0) {
            throw new HttpException(
                {
                    status: StatusCodes.InternalServerError,
                    message: 'gem_order_query_error',
                },
                StatusCodes.InternalServerError,
            );
        }

        return {
            gemOrder: gemOrder.response[0],
        };
    }
}
