import { ActionSetBuilderBase }  from '@lib/common/actionsets/helper/ActionSet.builder.base';
import { UserDto }               from '@lib/common/users/dto/User.dto';
import { ServiceResponse }       from '@lib/common/utils/ServiceResponse.type';
import { ActionSet }             from '@lib/common/actionsets/helper/ActionSet.class';
import { Action }                from '@lib/common/actionsets/helper/Action.class';
import Joi                       from '@hapi/joi';
import { TransactionParameters } from '@common/global';
import { TxSeqTxHandler }        from '@app/worker/actionhandlers/txseq/TxSeq.event.handlers';

export interface TransactionLifecycleTaskArguments {
    name: string;
    jobData: any;
}

export interface TransactionLifecycles {
    onConfirm: TransactionLifecycleTaskArguments;
    onFailure: TransactionLifecycleTaskArguments;
}

/**
 * Input arguments for the Cart AcSet Builder
 */
// tslint:disable-next-line:no-empty-interface
export interface TxSequenceAcsetBuilderArgs {
    transactions: (TransactionParameters & Partial<TransactionLifecycles>)[];
}

export const TransactionLifecycleTaskArgumentsChecker = Joi.object({
    name: Joi.string().required(),
    jobData: Joi.object().required()
});

/**
 * Data Validator for the Cart Acset Builder
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
        })
    ),
});

export class TxSequenceAcsetbuilderHelper implements ActionSetBuilderBase<TxSequenceAcsetBuilderArgs> {

    public isPrivate: boolean = true;

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

        const actions: Action[] = args.transactions.map((tx: (TransactionParameters & TransactionLifecycles)): Action => new Action()
            .setName('@txseq/txhandler')
            .setData<TxSeqTxHandler>({
                transaction: tx,
                caller,
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
