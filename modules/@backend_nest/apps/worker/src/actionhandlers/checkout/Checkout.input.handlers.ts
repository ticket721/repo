import { ActionSetsService, Progress } from '@lib/common/actionsets/ActionSets.service';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { Injectable, OnModuleInit } from '@nestjs/common';
import Joi from '@hapi/joi';
import { ChecksRunnerUtil } from '@lib/common/actionsets/helper/ChecksRunner.util';
import { T721TokenService } from '@lib/common/contracts/T721Token.service';
import { GemOrdersService } from '@lib/common/gemorders/GemOrders.service';
import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';

/**
 * Data Model for the Checkout Resolve step
 */
export interface CheckoutResolve {
    /**
     * ID of the Cart ActionSet
     */
    cartId: string;

    /**
     * Commit type used for the cart
     */
    commitType: 'stripe' | 'balance';

    /**
     * Buyer address
     */
    buyer: string;

    /**
     * Stripe configuration
     */
    stripe?: {
        /**
         * Payment Intent used to resolve the cart
         */
        paymentIntentId: string;

        /**
         * Gem Order used to check everything on stripe's end
         */
        gemOrderId: string;
    };
}

/**
 * Class containing all input handlers of the Checkout action set
 */
@Injectable()
export class CheckoutInputHandlers implements OnModuleInit {
    /**
     * Dependency Injection
     *
     * @param actionSetsService
     * @param t721TokenService
     * @param gemOrdersService
     */
    constructor(
        private readonly actionSetsService: ActionSetsService,
        private readonly t721TokenService: T721TokenService,
        private readonly gemOrdersService: GemOrdersService,
    ) {}

    /**
     * Helper method to verify that the user has enough funds to proceed
     *
     * @param user
     * @param commitType
     * @param cart
     * @param gemOrder
     */
    private async userHasEnoughFunds(
        user: string,
        commitType: string,
        cart: ActionSet,
        gemOrder?: GemOrderEntity,
    ): Promise<[boolean, string]> {
        const tokenContractInstance = await this.t721TokenService.get();

        if (
            cart.name !== '@cart/creation' ||
            cart.status !== 'complete' ||
            cart.actions[cart.actions.length - 1].data.commitType !== commitType ||
            cart.actions[cart.actions.length - 1].data.total.length !== 1 ||
            cart.actions[cart.actions.length - 1].data.total[0].currency !== 'T721Token'
        ) {
            return [null, 'invalid_provided_cart'];
        }

        let credit = 0;

        if (gemOrder) {
            try {
                credit = parseInt(JSON.parse(gemOrder.initial_arguments).amount, 10);
            } catch (e) {
                return [null, 'cannot_extract_gem_amount'];
            }
        }

        const price = parseInt(cart.actions[cart.actions.length - 1].data.total[0].value, 10);
        try {
            const onChainFunds = parseInt(await tokenContractInstance.methods.balanceOf(user).call(), 10);

            return [onChainFunds + credit >= price, null];
        } catch (e) {
            return [null, 'cannot_get_current_balance'];
        }
    }

    /**
     * Data Validator for the Checkout Resolve step
     */
    checkoutResolveValidator = Joi.object<CheckoutResolve>({
        cartId: Joi.string().optional(),
        commitType: Joi.string().optional(),
        buyer: Joi.string().optional(),
        stripe: Joi.object({
            paymentIntentId: Joi.string().required(),
            gemOrderId: Joi.string().required(),
        }).optional(),
    });

    /**
     * Data Fields for the Checkout Resolve step
     */
    checkoutResolveFields = ['cartId', 'commitType', 'buyer'];

    /**
     * Input Handler of the Ticket Selection Step
     *
     * @param checkoutResolveFields
     * @param actionset
     * @param progress
     */
    async checkoutResolveHandler(
        checkoutResolveFields: string[],
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data: CheckoutResolve = actionset.action.data;

        const { error, error_trace } = ChecksRunnerUtil<CheckoutResolve>(
            data,
            this.checkoutResolveValidator,
            checkoutResolveFields,
        );

        switch (error) {
            case 'error': {
                actionset.action.setError({
                    details: error_trace,
                    error: 'validation_error',
                });
                actionset.action.setStatus('error');
                actionset.setStatus('input:error');
                break;
            }

            case 'incomplete': {
                actionset.action.setIncomplete({
                    details: error_trace,
                    error: 'incomplete_error',
                });
                actionset.action.setStatus('incomplete');
                actionset.setStatus('input:incomplete');
                break;
            }

            case undefined: {
                const cartActionSetRes = await this.actionSetsService.search({
                    id: data.cartId,
                });

                if (cartActionSetRes.error || cartActionSetRes.response.length === 0) {
                    actionset.action.setError({
                        details: null,
                        error: 'cannot_find_cart_actionset',
                    });
                    actionset.action.setStatus('error');
                    actionset.setStatus('input:error');
                    break;
                }

                const cart: ActionSet = new ActionSet().load(cartActionSetRes.response[0]);

                switch (data.commitType) {
                    case 'balance': {
                        const fundsCheck = await this.userHasEnoughFunds(data.buyer, data.commitType, cart);

                        if (fundsCheck[1]) {
                            actionset.action.setError({
                                details: null,
                                error: fundsCheck[1],
                            });
                            actionset.action.setStatus('error');
                            actionset.setStatus('input:error');
                            break;
                        }

                        if (!fundsCheck[0]) {
                            actionset.action.setError({
                                details: null,
                                error: 'not_enough_funds',
                            });
                            actionset.action.setStatus('error');
                            actionset.setStatus('input:error');
                            break;
                        }

                        actionset.next();
                        break;
                    }

                    case 'stripe': {
                        if (!data.stripe) {
                            actionset.action.setError({
                                details: null,
                                error: 'missing_stripe_field',
                            });
                            actionset.action.setStatus('error');
                            actionset.setStatus('input:error');
                            break;
                        }

                        const gemOrderRes = await this.gemOrdersService.search({
                            id: data.stripe.gemOrderId,
                        });

                        if (gemOrderRes.error || gemOrderRes.response.length === 0) {
                            actionset.action.setError({
                                details: null,
                                error: 'cannot_find_gem_order',
                            });
                            actionset.action.setStatus('error');
                            actionset.setStatus('input:error');
                            break;
                        }

                        const gemOrder = gemOrderRes.response[0];

                        const fundsCheck = await this.userHasEnoughFunds(data.buyer, data.commitType, cart, gemOrder);

                        if (fundsCheck[1]) {
                            actionset.action.setError({
                                details: null,
                                error: fundsCheck[1],
                            });
                            actionset.action.setStatus('error');
                            actionset.setStatus('input:error');
                            break;
                        }

                        if (!fundsCheck[0]) {
                            actionset.action.setError({
                                details: null,
                                error: 'not_enough_funds',
                            });
                            actionset.action.setStatus('error');
                            actionset.setStatus('input:error');
                            break;
                        }

                        actionset.next();
                        break;
                    }
                }
            }
        }

        await progress(100);
        return [actionset, true];
    }

    /**
     * Lifecycle callback to register all input handlers
     */
    /* istanbul ignore next */
    onModuleInit(): void {
        this.actionSetsService.setInputHandler(
            '@checkout/resolve',
            this.checkoutResolveHandler.bind(this, this.checkoutResolveFields),
        );
    }
}
