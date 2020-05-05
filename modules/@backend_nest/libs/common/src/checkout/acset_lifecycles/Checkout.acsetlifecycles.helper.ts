import { ActionSetLifecyclesBase }                          from '@lib/common/actionsets/helper/ActionSet.lifecycles.base';
import { ActionSet }                                        from '@lib/common/actionsets/helper/ActionSet.class';
import { ServiceResponse }                                  from '@lib/common/utils/ServiceResponse.type';
import { InjectQueue }                                      from '@nestjs/bull';
import { Queue }                                            from 'bull';
import { TicketMintingTransactionSequenceBuilderTaskInput } from '@app/worker/tasks/minting/Minting.tasks';
import { CheckoutResolve }                                  from '@app/worker/actionhandlers/checkout/Checkout.input.handlers';

export class CheckoutAcsetlifecycleHelper implements ActionSetLifecyclesBase {

    constructor(
        @InjectQueue('minting') private readonly mintingQueue: Queue
    ) {}

    public async onComplete(actionSet: ActionSet): Promise<ServiceResponse<void>> {

        const inputData: CheckoutResolve = actionSet.actions[0].data as CheckoutResolve;

        await this.mintingQueue.add('ticketMintingTransactionSequenceBuilderTask', {
            cartActionSetId: inputData.cartId,
            checkoutActionSetId: actionSet.id,
            gemOrderId: inputData.stripe?.gemOrderId,
        } as TicketMintingTransactionSequenceBuilderTaskInput);

        return {
            response: null,
            error: null,
        }
    }

}
