import { ActionSetBuilderBase } from '@lib/common/actionsets/helper/ActionSet.builder.base';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';
import { Action } from '@lib/common/actionsets/helper/Action.class';
import Joi from '@hapi/joi';
import { TransactionParameters } from '@common/global';
import { TxSeqTxHandler } from '@app/worker/actionhandlers/txseq/TxSeq.event.handlers';

/**
 * Data Model to define lifecycle call arguments
 */
export interface TransactionLifecycleTaskArguments {
    /**
     * Lifecycle method
     */
    name: string;

    /**
     * Argument data
     */
    jobData: any;
}

/**
 * Extra lifecycle argument for each transaction
 */
export interface TransactionLifecycles {
    /**
     * Lifecycle callback arguments when transaction is confirmed
     */
    onConfirm: TransactionLifecycleTaskArguments;

    /**
     * Lifecycle callback arguments when transaction is rejected
     */
    onFailure: TransactionLifecycleTaskArguments;
}

/**
 * Input arguments for the TxSeq AcSet Builder
 */
// tslint:disable-next-line:no-empty-interface
export interface TxSequenceAcsetBuilderArgs {
    /**
     * List of transaction to broadcast. Each one will create an action.
     */
    transactions: (TransactionParameters & Partial<TransactionLifecycles>)[];
}

/**
 * Data Validator for the Lifecycle arguments type
 */
export const TransactionLifecycleTaskArgumentsChecker = Joi.object({
    name: Joi.string().required(),
    jobData: Joi.object().required(),
});

/**
 * Data Validator for the TxSeq Acset Builder
 */
const TxSequenceAcsetBuilderChecker = Joi.object({
    transactions: Joi.array().items(
        Joi.object({
            from: Joi.string().required(),
            to: Joi.string().required(),
            data: Joi.string().required(),
            value: Joi.string().required(),
            onConfirm: TransactionLifecycleTaskArgumentsChecker.optional(),
            onFailure: TransactionLifecycleTaskArgumentsChecker.optional(),
        }),
    ),
});

/**
 * ActionSet builder for the TxSeq use case
 */
export class TxSequenceAcsetbuilderHelper implements ActionSetBuilderBase<TxSequenceAcsetBuilderArgs> {
    /**
     * This actionset cannot be publicly created
     */
    public isPrivate: boolean = true;

    /**
     * Builder
     *
     * @param caller
     * @param args
     */
    async buildActionSet(caller: UserDto, args: TxSequenceAcsetBuilderArgs): Promise<ServiceResponse<ActionSet>> {
        const { error, value } = TxSequenceAcsetBuilderChecker.validate(args);

        if (error) {
            return {
                error: 'acset_invalid_arguments',
                response: null,
            };
        }

        args = value;

        delete caller.password;

        const actions: Action[] = args.transactions.map(
            (tx: TransactionParameters & TransactionLifecycles): Action =>
                new Action()
                    .setName('@txseq/txhandler')
                    .setData<TxSeqTxHandler>({
                        transaction: tx,
                    })
                    .setType('event')
                    .setStatus('waiting')
                    .setPrivacy(true),
        );
        actions[0].setStatus('in progress');

        return {
            error: null,
            response: new ActionSet()
                .setName('@txseq/processor')
                .setActions(actions)
                .setStatus('event:in progress'),
        };
    }
}
