import { ActionSetLifecyclesBase } from '@lib/common/actionsets/helper/ActionSet.lifecycles.base';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { TicketMintingTransactionSequenceBuilderTaskInput } from '@app/worker/tasks/minting/Minting.tasks';
import { CheckoutResolve } from '@app/worker/actionhandlers/checkout/Checkout.input.handlers';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { CategoriesService } from '@lib/common/categories/Categories.service';

/**
 * Action Set Lifecycles for the checkout use case
 */
export class CheckoutAcsetlifecycleHelper implements ActionSetLifecyclesBase {
    /**
     * Dependency injection
     *
     * @param mintingQueue
     * @param actionSetsService
     * @param categoriesService
     */
    constructor(
        @InjectQueue('minting') private readonly mintingQueue: Queue,
        private readonly actionSetsService: ActionSetsService,
        private readonly categoriesService: CategoriesService,
    ) {}

    /**
     * On Completion callback
     *
     * @param actionSet
     */
    public async onComplete(actionSet: ActionSet): Promise<ServiceResponse<void>> {
        const inputData: CheckoutResolve = actionSet.actions[0].data as CheckoutResolve;

        // TODO remove this to prevent transaction creation
        await this.mintingQueue.add('ticketMintingTransactionSequenceBuilderTask', {
            cartActionSetId: inputData.cartId,
            checkoutActionSetId: actionSet.id,
            gemOrderId: inputData.stripe?.gemOrderId,
        } as TicketMintingTransactionSequenceBuilderTaskInput);

        return {
            response: null,
            error: null,
        };
    }

    /**
     * On Completion callback
     *
     * @param actionSet
     */
    public async onFailure(actionSet: ActionSet): Promise<ServiceResponse<void>> {
        const checkoutResolveData = actionSet.actions[0].data;

        if (!checkoutResolveData.cartId) {
            return;
        }

        const cartReq = await this.actionSetsService.search({
            id: checkoutResolveData.cartId,
        });

        if (cartReq.error || cartReq.response.length === 0) {
            return {
                error: cartReq.error || 'cannot_find_cart',
                response: null,
            };
        }

        const cartEntity: ActionSetEntity = cartReq.response[0];

        const tickets = JSON.parse(cartEntity.actions[0].data).tickets;

        const counts: { [key: string]: number } = {};

        for (const ticket of tickets) {
            if (!counts[ticket.categoryId]) {
                counts[ticket.categoryId] = 1;
            } else {
                counts[ticket.categoryId] += 1;
            }
        }

        for (const category of Object.keys(counts)) {
            const categoryReq = await this.categoriesService.search({
                id: category,
            });

            if (categoryReq.error || categoryReq.response.length === 0) {
                return {
                    error: categoryReq.error || 'cannot_find_category',
                    response: null,
                };
            }

            const categoryEntity = categoryReq.response[0];

            const updateRes = await this.categoriesService.update(
                {
                    id: category,
                },
                {
                    reserved: categoryEntity.reserved - counts[category],
                },
            );

            if (updateRes.error) {
                return {
                    error: updateRes.error,
                    response: null,
                };
            }
        }

        return {
            response: null,
            error: null,
        };
    }
}
