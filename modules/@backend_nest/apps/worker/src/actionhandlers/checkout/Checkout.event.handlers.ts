import { ActionSetsService, Progress } from '@lib/common/actionsets/ActionSets.service';
import { ActionSet }                   from '@lib/common/actionsets/helper/ActionSet.class';
import { Injectable, OnModuleInit }    from '@nestjs/common';
import Joi                             from '@hapi/joi';
import { ChecksRunnerUtil }            from '@lib/common/actionsets/helper/ChecksRunner.util';
import { CheckoutResolve }             from '@app/worker/actionhandlers/checkout/Checkout.input.handlers';
import { GemOrdersService }            from '@lib/common/gemorders/GemOrders.service';
import { GemOrderEntity }              from '@lib/common/gemorders/entities/GemOrder.entity';
import { Gem }                         from 'dosojin';
import { CheckoutCreationActions }     from '@lib/common/checkout/acset_builders/Checkout.acsetbuilder.helper';

/**
 * Data model required for the Checkout Progress step
 */
// tslint:disable-next-line:no-empty-interface
export interface CheckoutProgress {}

/**
 * Class containing all input handlers of the Checkout action set
 */
@Injectable()
export class CheckoutEventHandlers implements OnModuleInit {
    /**
     * Dependency Injection
     *
     * @param actionSetsService
     * @param gemOrdersService
     */
    constructor(
        private readonly actionSetsService: ActionSetsService,
        private readonly gemOrdersService: GemOrdersService,
    ) {}

    /**
     * Data Validator for the Checkout Progress step
     */
    checkoutProgressValidator = Joi.object<CheckoutProgress>({});

    /**
     * Data Fields for the Checkout Progress step
     */
    checkoutProgressFields = [];

    /**
     * Input Handler of the Ticket Selection Step
     *
     * @param checkoutResolveFields
     * @param actionset
     * @param progress
     */
    async checkoutProgressHandler(
        checkoutResolveFields: string[],
        actionset: ActionSet,
        progress: Progress,
    ): Promise<[ActionSet, boolean]> {
        const data: CheckoutProgress = actionset.action.data;
        const inputData: CheckoutResolve = actionset.actions[CheckoutCreationActions.Resolve].data;

        const { error, error_trace } = ChecksRunnerUtil<CheckoutProgress>(
            data,
            this.checkoutProgressValidator,
            checkoutResolveFields,
        );

        switch (error) {
            case 'error': {
                actionset.action.setError({
                    details: error_trace,
                    error: 'validation_error',
                });
                actionset.action.setStatus('error');
                actionset.setStatus('event:error');
                break;
            }

            /* istanbul ignore next */
            case 'incomplete': {
                actionset.action.setIncomplete({
                    details: error_trace,
                    error: 'incomplete_error',
                });
                actionset.action.setStatus('incomplete');
                actionset.setStatus('event:incomplete');
                break;
            }

            case undefined: {
                switch (inputData.commitType) {
                    case 'balance': {
                        actionset.next();
                        break;
                    }

                    case 'stripe': {
                        const gemOrderRes = await this.gemOrdersService.search({
                            id: inputData.stripe.gemOrderId,
                        });

                        if (gemOrderRes.error || gemOrderRes.response.length === 0) {
                            actionset.action.setError({
                                details: null,
                                error: 'cannot_find_gem_order',
                            });
                            actionset.action.setStatus('error');
                            actionset.setStatus('event:error');
                            break;
                        }

                        const gemOrder = gemOrderRes.response[0];

                        const gem: Gem = new Gem().load(GemOrderEntity.toDosojinRaw(gemOrder.gem));

                        switch (gem.gemStatus) {
                            case 'Running': {
                                return [actionset, false];
                            }
                            case 'Complete': {
                                actionset.next();
                                break;
                            }
                            case 'Error':
                            case 'Fatal':
                            case 'MissingReceptacle': {
                                actionset.action.setError({
                                    details: null,
                                    error: 'dosojin_circuit_failed',
                                });
                                actionset.action.setStatus('error');
                                actionset.setStatus('event:error');
                                break;
                            }
                        }
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
        this.actionSetsService.setEventHandler(
            '@checkout/progress',
            this.checkoutProgressHandler.bind(this, this.checkoutProgressFields),
        );
    }
}
