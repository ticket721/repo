import { PaymentError, PaymentHandlerBaseService } from '@lib/common/purchases/PaymentHandler.base.service';
import { Injectable } from '@nestjs/common';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { Payment, PurchaseEntity, Fee } from '@lib/common/purchases/entities/Purchase.entity';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { StripeService } from '@lib/common/stripe/Stripe.service';
import Stripe from 'stripe';
import { StripeInterfacesService } from '@lib/common/stripeinterface/StripeInterfaces.service';
import { StripeInterfaceEntity } from '@lib/common/stripeinterface/entities/StripeInterface.entity';

/**
 * Class to handle all payments with stripe
 */
@Injectable()
export class StripeInterfacesPaymentHandler implements PaymentHandlerBaseService {
    /**
     * Dependency injection
     *
     * @param stripeService
     * @param stripeInterfacesService
     */
    constructor(
        private readonly stripeService: StripeService,
        private readonly stripeInterfacesService: StripeInterfacesService,
    ) {}

    /**
     * Recover final price
     *
     * @param payment
     * @param paymentInterfaceId
     */
    async finalPrice(payment: Payment, paymentInterfaceId: string): Promise<ServiceResponse<number>> {
        try {
            const stripe: Stripe = this.stripeService.get();

            const stripeInterfaceEntityRes = await this.stripeInterfacesService.search({
                id: paymentInterfaceId,
            });

            if (stripeInterfaceEntityRes.error) {
                return {
                    error: stripeInterfaceEntityRes.error,
                    response: null,
                };
            }

            if (stripeInterfaceEntityRes.response.length === 0) {
                return {
                    error: 'stripe_interface_not_found',
                    response: null,
                };
            }

            const stripeInterfaceEntity: StripeInterfaceEntity = stripeInterfaceEntityRes.response[0];

            const paymentIntent = await stripe.paymentIntents.retrieve(payment.id, {
                stripeAccount: stripeInterfaceEntity.connect_account,
            });

            const balanceTransaction = await stripe.balanceTransactions.retrieve(
                paymentIntent.charges.data[0].balance_transaction as string,
                {
                    stripeAccount: stripeInterfaceEntity.connect_account,
                },
            );

            return {
                error: null,
                response: balanceTransaction.amount - balanceTransaction.fee,
            };
        } catch (e) {
            return {
                error: e.message,
                response: null,
            };
        }
    }

    /**
     * Merge all fees
     *
     * @param fees
     * @private
     */
    private async computeFee(fees: Fee[]): Promise<ServiceResponse<number>> {
        if (fees.length === 0) {
            return {
                error: null,
                response: 0,
            };
        }

        return {
            error: null,
            response: fees
                .map((fee: Fee): number => fee.price)
                .reduce((fee1: number, fee2: number): number => fee1 + fee2),
        };
    }

    /**
     * On payment complete callback
     *
     * @param user
     * @param payment
     * @param paymentInterfaceId
     */
    async onComplete(user: UserDto, payment: Payment, paymentInterfaceId): Promise<ServiceResponse<void>> {
        try {
            const stripe: Stripe = this.stripeService.get();

            const stripeInterfaceEntityRes = await this.stripeInterfacesService.search({
                id: paymentInterfaceId,
            });

            if (stripeInterfaceEntityRes.error) {
                return {
                    error: stripeInterfaceEntityRes.error,
                    response: null,
                };
            }

            if (stripeInterfaceEntityRes.response.length === 0) {
                return {
                    error: 'stripe_interface_not_found',
                    response: null,
                };
            }

            const stripeInterfaceEntity: StripeInterfaceEntity = stripeInterfaceEntityRes.response[0];

            const paymentIntent = await stripe.paymentIntents.retrieve(payment.id, {
                stripeAccount: stripeInterfaceEntity.connect_account,
            });

            if (paymentIntent.status === 'requires_capture') {
                const capturedPaymentIntent = await stripe.paymentIntents.capture(paymentIntent.id, {
                    stripeAccount: stripeInterfaceEntity.connect_account,
                });

                if (capturedPaymentIntent.status !== 'succeeded') {
                    return {
                        error: 'capture_failed',
                        response: null,
                    };
                }
            }

            return {
                error: null,
                response: null,
            };
        } catch (e) {
            return {
                error: e.message,
                response: null,
            };
        }
    }

    /**
     * On Checkout callback
     * @param user
     * @param purchase
     * @param payload
     * @param paymentInterfaceId
     * @param fees
     */
    async onCheckout(
        user: UserDto,
        purchase: PurchaseEntity,
        payload: any,
        paymentInterfaceId: string,
        fees: Fee[],
    ): Promise<ServiceResponse<[Payment, Fee[], PaymentError]>> {
        const stripe: Stripe = this.stripeService.get();

        const stripeInterfaceEntityRes = await this.stripeInterfacesService.search({
            id: paymentInterfaceId,
        });

        if (stripeInterfaceEntityRes.error) {
            return {
                error: stripeInterfaceEntityRes.error,
                response: null,
            };
        }

        if (stripeInterfaceEntityRes.response.length === 0) {
            return {
                error: 'stripe_interface_not_found',
                response: null,
            };
        }

        const t721FeesRes = await this.computeFee(fees);

        if (t721FeesRes.error) {
            return {
                error: t721FeesRes.error,
                response: null,
            };
        }

        const t721Fees = t721FeesRes.response;

        const stripeInterfaceEntity: StripeInterfaceEntity = stripeInterfaceEntityRes.response[0];

        try {
            const paymentIntent = await stripe.paymentIntents.create(
                {
                    amount: purchase.price,
                    currency: purchase.currency,
                    receipt_email: user.email,
                    payment_method_types: ['card'],
                    application_fee_amount: t721Fees,
                    capture_method: 'manual',
                    confirmation_method: 'automatic',
                },
                {
                    stripeAccount: stripeInterfaceEntity.connect_account,
                },
            );

            return {
                error: null,
                response: [
                    {
                        type: 'stripe',
                        id: paymentIntent.id,
                        client_id: JSON.stringify({
                            client_secret: paymentIntent.client_secret,
                            stripe_account: stripeInterfaceEntity.connect_account,
                        }),
                        status: 'waiting',
                    },
                    fees,
                    null,
                ],
            };
        } catch (e) {
            return {
                error: null,
                response: [
                    null,
                    fees,
                    {
                        reason: e.message,
                    },
                ],
            };
        }
    }

    /**
     * Computes if a payment status update is required
     *
     * @param payment
     * @param paymentIntent
     */
    computePaymentStatusUpdate(payment: Payment, paymentIntent: Stripe.PaymentIntent): Payment {
        if (payment.status === 'waiting') {
            switch (paymentIntent.status) {
                case 'requires_capture':
                case 'succeeded':
                    return {
                        ...payment,
                        status: 'confirmed',
                    };
                case 'canceled':
                    return {
                        ...payment,
                        status: 'rejected',
                    };
                default:
                    return null;
            }
        }

        return null;
    }

    /**
     * Recover updated payment details
     *
     * @param payment
     * @param paymentInterfaceId
     */
    async fetch(payment: Payment, paymentInterfaceId: string): Promise<ServiceResponse<Payment>> {
        const stripe: Stripe = this.stripeService.get();

        const stripeInterfaceEntityRes = await this.stripeInterfacesService.search({
            id: paymentInterfaceId,
        });

        if (stripeInterfaceEntityRes.error) {
            return {
                error: stripeInterfaceEntityRes.error,
                response: null,
            };
        }

        if (stripeInterfaceEntityRes.response.length === 0) {
            return {
                error: 'stripe_interface_not_found',
                response: null,
            };
        }

        const stripeInterfaceEntity: StripeInterfaceEntity = stripeInterfaceEntityRes.response[0];

        const paymentIntent = await stripe.paymentIntents.retrieve(payment.id, {
            stripeAccount: stripeInterfaceEntity.connect_account,
        });

        const updatedPayment = this.computePaymentStatusUpdate(payment, paymentIntent);

        return {
            error: null,
            response: updatedPayment,
        };
    }

    /**
     * Cancel a stripe payment
     *
     * @param payment
     * @param paymentInterfaceId
     */
    async cancel(payment: Payment, paymentInterfaceId: string): Promise<ServiceResponse<void>> {
        try {
            const stripe: Stripe = this.stripeService.get();

            const stripeInterfaceEntityRes = await this.stripeInterfacesService.search({
                id: paymentInterfaceId,
            });

            if (stripeInterfaceEntityRes.error) {
                return {
                    error: stripeInterfaceEntityRes.error,
                    response: null,
                };
            }

            if (stripeInterfaceEntityRes.response.length === 0) {
                return {
                    error: 'stripe_interface_not_found',
                    response: null,
                };
            }

            const stripeInterfaceEntity: StripeInterfaceEntity = stripeInterfaceEntityRes.response[0];

            await stripe.paymentIntents.cancel(payment.id, {
                stripeAccount: stripeInterfaceEntity.connect_account,
            });

            return {
                error: null,
                response: null,
            };
        } catch (e) {
            console.error(e);
            return {
                error: 'cannot_cancel_stripe_payment_intent',
                response: null,
            };
        }
    }
}
