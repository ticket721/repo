import { CheckoutController } from '@app/server/controllers/checkout/Checkout.controller';
import { StripeResourcesService } from '@lib/common/striperesources/StripeResources.service';
import { GemOrdersService } from '@lib/common/gemorders/GemOrders.service';
import { capture, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test } from '@nestjs/testing';
import { ResolveCartWithPaymentIntentInputDto } from '@app/server/controllers/checkout/dto/ResolveCartWithPaymentIntentInput.dto';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { keccak256 } from '@ticket721sources/global';
import regionRestrictions from '@app/server/controllers/checkout/restrictions/regionRestrictions';
import methodsRestrictions from '@app/server/controllers/checkout/restrictions/methodsRestrictions';
import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';
import { StatusCodes } from '@lib/common/utils/codes';
import { StripeResourceEntity } from '@lib/common/striperesources/entities/StripeResource.entity';

describe('Checkout Controller', function() {
    const context: {
        checkoutController: CheckoutController;
        stripeResourcesServiceMock: StripeResourcesService;
        gemOrdersServiceMock: GemOrdersService;
    } = {
        checkoutController: null,
        stripeResourcesServiceMock: null,
        gemOrdersServiceMock: null,
    };

    beforeEach(async function() {
        context.stripeResourcesServiceMock = mock(StripeResourcesService);
        context.gemOrdersServiceMock = mock(GemOrdersService);

        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: StripeResourcesService,
                    useValue: instance(context.stripeResourcesServiceMock),
                },
                {
                    provide: GemOrdersService,
                    useValue: instance(context.gemOrdersServiceMock),
                },
            ],
            controllers: [CheckoutController],
        }).compile();

        context.checkoutController = app.get<CheckoutController>(CheckoutController);
    });

    describe('resolveCartWithPaymentIntent', function() {
        it('should resolve cart', async function() {
            const args: ResolveCartWithPaymentIntentInputDto = {
                paymentIntentId: 'payment_id',
            } as ResolveCartWithPaymentIntentInputDto;

            const user: UserDto = {
                id: 'user_id',
            } as UserDto;

            const gemId = keccak256(args.paymentIntentId)
                .slice(2)
                .toLowerCase();

            when(
                context.stripeResourcesServiceMock.search(
                    deepEqual({
                        id: args.paymentIntentId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            when(
                context.stripeResourcesServiceMock.create(
                    deepEqual({
                        id: args.paymentIntentId.toString(),
                        used_by: user.id,
                    }),
                    deepEqual({
                        if_not_exist: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.gemOrdersServiceMock.startGemOrder(
                    'token_minting',
                    user.id,
                    deepEqual({
                        paymentIntentId: args.paymentIntentId,
                        currency: 'eur',
                        amount: 10000,
                        regionRestrictions,
                        methodsRestrictions,
                        userId: user.id,
                    }),
                    gemId,
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: gemId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: gemId,
                    } as GemOrderEntity,
                ],
            });

            const res = await context.checkoutController.resolveCartWithPaymentIntent(args, user);

            expect(res).toEqual({
                gemOrder: {
                    id: gemId,
                },
            });

            verify(
                context.stripeResourcesServiceMock.search(
                    deepEqual({
                        id: args.paymentIntentId,
                    }),
                ),
            ).called();

            verify(
                context.stripeResourcesServiceMock.create(
                    deepEqual({
                        id: args.paymentIntentId.toString(),
                        used_by: user.id,
                    }),
                    deepEqual({
                        if_not_exist: true,
                    }),
                ),
            ).called();

            verify(
                context.gemOrdersServiceMock.startGemOrder(
                    'token_minting',
                    user.id,
                    deepEqual({
                        paymentIntentId: args.paymentIntentId,
                        currency: 'eur',
                        amount: 10000,
                        regionRestrictions,
                        methodsRestrictions,
                        userId: user.id,
                    }),
                    gemId,
                ),
            ).called();

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: gemId,
                    }),
                ),
            ).called();
        });

        it('should throw on stripe resource fetch error', async function() {
            const args: ResolveCartWithPaymentIntentInputDto = {
                paymentIntentId: 'payment_id',
            } as ResolveCartWithPaymentIntentInputDto;

            const user: UserDto = {
                id: 'user_id',
            } as UserDto;

            const gemId = keccak256(args.paymentIntentId)
                .slice(2)
                .toLowerCase();

            when(
                context.stripeResourcesServiceMock.search(
                    deepEqual({
                        id: args.paymentIntentId,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: [],
            });

            await expect(context.checkoutController.resolveCartWithPaymentIntent(args, user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.InternalServerError,
                    message: 'stripe_resource_check_fail',
                },
                status: StatusCodes.InternalServerError,
                message: {
                    status: StatusCodes.InternalServerError,
                    message: 'stripe_resource_check_fail',
                },
            });

            verify(
                context.stripeResourcesServiceMock.search(
                    deepEqual({
                        id: args.paymentIntentId,
                    }),
                ),
            ).called();
        });

        it('should throw on stripe collision error', async function() {
            const args: ResolveCartWithPaymentIntentInputDto = {
                paymentIntentId: 'payment_id',
            } as ResolveCartWithPaymentIntentInputDto;

            const user: UserDto = {
                id: 'user_id',
            } as UserDto;

            const gemId = keccak256(args.paymentIntentId)
                .slice(2)
                .toLowerCase();

            when(
                context.stripeResourcesServiceMock.search(
                    deepEqual({
                        id: args.paymentIntentId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: args.paymentIntentId,
                    } as StripeResourceEntity,
                ],
            });

            await expect(context.checkoutController.resolveCartWithPaymentIntent(args, user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.Conflict,
                    message: 'stripe_resource_already_used',
                },
                status: StatusCodes.Conflict,
                message: {
                    status: StatusCodes.Conflict,
                    message: 'stripe_resource_already_used',
                },
            });

            verify(
                context.stripeResourcesServiceMock.search(
                    deepEqual({
                        id: args.paymentIntentId,
                    }),
                ),
            ).called();
        });

        it('should throw on stripe registration error', async function() {
            const args: ResolveCartWithPaymentIntentInputDto = {
                paymentIntentId: 'payment_id',
            } as ResolveCartWithPaymentIntentInputDto;

            const user: UserDto = {
                id: 'user_id',
            } as UserDto;

            const gemId = keccak256(args.paymentIntentId)
                .slice(2)
                .toLowerCase();

            when(
                context.stripeResourcesServiceMock.search(
                    deepEqual({
                        id: args.paymentIntentId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            when(
                context.stripeResourcesServiceMock.create(
                    deepEqual({
                        id: args.paymentIntentId.toString(),
                        used_by: user.id,
                    }),
                    deepEqual({
                        if_not_exist: true,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(context.checkoutController.resolveCartWithPaymentIntent(args, user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.InternalServerError,
                    message: 'stripe_resource_registration_error',
                },
                status: StatusCodes.InternalServerError,
                message: {
                    status: StatusCodes.InternalServerError,
                    message: 'stripe_resource_registration_error',
                },
            });

            verify(
                context.stripeResourcesServiceMock.search(
                    deepEqual({
                        id: args.paymentIntentId,
                    }),
                ),
            ).called();

            verify(
                context.stripeResourcesServiceMock.create(
                    deepEqual({
                        id: args.paymentIntentId.toString(),
                        used_by: user.id,
                    }),
                    deepEqual({
                        if_not_exist: true,
                    }),
                ),
            ).called();
        });

        it('should throw on circuit start error', async function() {
            const args: ResolveCartWithPaymentIntentInputDto = {
                paymentIntentId: 'payment_id',
            } as ResolveCartWithPaymentIntentInputDto;

            const user: UserDto = {
                id: 'user_id',
            } as UserDto;

            const gemId = keccak256(args.paymentIntentId)
                .slice(2)
                .toLowerCase();

            when(
                context.stripeResourcesServiceMock.search(
                    deepEqual({
                        id: args.paymentIntentId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            when(
                context.stripeResourcesServiceMock.create(
                    deepEqual({
                        id: args.paymentIntentId.toString(),
                        used_by: user.id,
                    }),
                    deepEqual({
                        if_not_exist: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.gemOrdersServiceMock.startGemOrder(
                    'token_minting',
                    user.id,
                    deepEqual({
                        paymentIntentId: args.paymentIntentId,
                        currency: 'eur',
                        amount: 10000,
                        regionRestrictions,
                        methodsRestrictions,
                        userId: user.id,
                    }),
                    gemId,
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(context.checkoutController.resolveCartWithPaymentIntent(args, user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.InternalServerError,
                    message: 'gem_order_creation_error',
                },
                status: StatusCodes.InternalServerError,
                message: {
                    status: StatusCodes.InternalServerError,
                    message: 'gem_order_creation_error',
                },
            });

            verify(
                context.stripeResourcesServiceMock.search(
                    deepEqual({
                        id: args.paymentIntentId,
                    }),
                ),
            ).called();

            verify(
                context.stripeResourcesServiceMock.create(
                    deepEqual({
                        id: args.paymentIntentId.toString(),
                        used_by: user.id,
                    }),
                    deepEqual({
                        if_not_exist: true,
                    }),
                ),
            ).called();

            verify(
                context.gemOrdersServiceMock.startGemOrder(
                    'token_minting',
                    user.id,
                    deepEqual({
                        paymentIntentId: args.paymentIntentId,
                        currency: 'eur',
                        amount: 10000,
                        regionRestrictions,
                        methodsRestrictions,
                        userId: user.id,
                    }),
                    gemId,
                ),
            ).called();
        });

        it('should throw on final gem retrieval error', async function() {
            const args: ResolveCartWithPaymentIntentInputDto = {
                paymentIntentId: 'payment_id',
            } as ResolveCartWithPaymentIntentInputDto;

            const user: UserDto = {
                id: 'user_id',
            } as UserDto;

            const gemId = keccak256(args.paymentIntentId)
                .slice(2)
                .toLowerCase();

            when(
                context.stripeResourcesServiceMock.search(
                    deepEqual({
                        id: args.paymentIntentId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            when(
                context.stripeResourcesServiceMock.create(
                    deepEqual({
                        id: args.paymentIntentId.toString(),
                        used_by: user.id,
                    }),
                    deepEqual({
                        if_not_exist: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.gemOrdersServiceMock.startGemOrder(
                    'token_minting',
                    user.id,
                    deepEqual({
                        paymentIntentId: args.paymentIntentId,
                        currency: 'eur',
                        amount: 10000,
                        regionRestrictions,
                        methodsRestrictions,
                        userId: user.id,
                    }),
                    gemId,
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: gemId,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(context.checkoutController.resolveCartWithPaymentIntent(args, user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.InternalServerError,
                    message: 'gem_order_query_error',
                },
                status: StatusCodes.InternalServerError,
                message: {
                    status: StatusCodes.InternalServerError,
                    message: 'gem_order_query_error',
                },
            });

            verify(
                context.stripeResourcesServiceMock.search(
                    deepEqual({
                        id: args.paymentIntentId,
                    }),
                ),
            ).called();

            verify(
                context.stripeResourcesServiceMock.create(
                    deepEqual({
                        id: args.paymentIntentId.toString(),
                        used_by: user.id,
                    }),
                    deepEqual({
                        if_not_exist: true,
                    }),
                ),
            ).called();

            verify(
                context.gemOrdersServiceMock.startGemOrder(
                    'token_minting',
                    user.id,
                    deepEqual({
                        paymentIntentId: args.paymentIntentId,
                        currency: 'eur',
                        amount: 10000,
                        regionRestrictions,
                        methodsRestrictions,
                        userId: user.id,
                    }),
                    gemId,
                ),
            ).called();

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: gemId,
                    }),
                ),
            ).called();
        });

        it('should throw on empty final gem retrieval', async function() {
            const args: ResolveCartWithPaymentIntentInputDto = {
                paymentIntentId: 'payment_id',
            } as ResolveCartWithPaymentIntentInputDto;

            const user: UserDto = {
                id: 'user_id',
            } as UserDto;

            const gemId = keccak256(args.paymentIntentId)
                .slice(2)
                .toLowerCase();

            when(
                context.stripeResourcesServiceMock.search(
                    deepEqual({
                        id: args.paymentIntentId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            when(
                context.stripeResourcesServiceMock.create(
                    deepEqual({
                        id: args.paymentIntentId.toString(),
                        used_by: user.id,
                    }),
                    deepEqual({
                        if_not_exist: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.gemOrdersServiceMock.startGemOrder(
                    'token_minting',
                    user.id,
                    deepEqual({
                        paymentIntentId: args.paymentIntentId,
                        currency: 'eur',
                        amount: 10000,
                        regionRestrictions,
                        methodsRestrictions,
                        userId: user.id,
                    }),
                    gemId,
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            when(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: gemId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            await expect(context.checkoutController.resolveCartWithPaymentIntent(args, user)).rejects.toMatchObject({
                response: {
                    status: StatusCodes.InternalServerError,
                    message: 'gem_order_query_error',
                },
                status: StatusCodes.InternalServerError,
                message: {
                    status: StatusCodes.InternalServerError,
                    message: 'gem_order_query_error',
                },
            });

            verify(
                context.stripeResourcesServiceMock.search(
                    deepEqual({
                        id: args.paymentIntentId,
                    }),
                ),
            ).called();

            verify(
                context.stripeResourcesServiceMock.create(
                    deepEqual({
                        id: args.paymentIntentId.toString(),
                        used_by: user.id,
                    }),
                    deepEqual({
                        if_not_exist: true,
                    }),
                ),
            ).called();

            verify(
                context.gemOrdersServiceMock.startGemOrder(
                    'token_minting',
                    user.id,
                    deepEqual({
                        paymentIntentId: args.paymentIntentId,
                        currency: 'eur',
                        amount: 10000,
                        regionRestrictions,
                        methodsRestrictions,
                        userId: user.id,
                    }),
                    gemId,
                ),
            ).called();

            verify(
                context.gemOrdersServiceMock.search(
                    deepEqual({
                        id: gemId,
                    }),
                ),
            ).called();
        });
    });
});
