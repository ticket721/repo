import {
    TxSequenceAcsetBuilderArgs,
    TxSequenceAcsetbuilderHelper,
} from '@lib/common/txs/acset_builders/TxSequence.acsetbuilder.helper';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { TransactionParameters } from '@common/global';

describe('Tx Sequence Acset Builder Helper', function() {
    const context: {
        txSeqAcsetbuilderHelper: TxSequenceAcsetbuilderHelper;
    } = {
        txSeqAcsetbuilderHelper: null,
    };

    beforeEach(async function() {
        context.txSeqAcsetbuilderHelper = new TxSequenceAcsetbuilderHelper();
    });

    describe('buildActionSet', function() {
        it('should properly build tx sequence actionset', async function() {
            // DECLARE
            const caller: Partial<UserDto> = {
                id: 'caller_id',
            };
            const fromAddress = '0x32Be343B94f860124dC4fEe278FDCBD38C102D88';
            const toAddress = '0xA910f92ACdAf488fa6eF02174fb86208Ad7722ba';
            const args: TxSequenceAcsetBuilderArgs = {
                transactions: [
                    {
                        from: fromAddress,
                        to: toAddress,
                        value: '0',
                        data: '0x',
                    },
                ],
            };

            // MOCK

            // TRIGGER
            const res = await context.txSeqAcsetbuilderHelper.buildActionSet(caller as UserDto, args);

            // CHECK RETURNs
            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                entity: {
                    actions: [
                        {
                            data:
                                '{"transaction":{"from":"0x32Be343B94f860124dC4fEe278FDCBD38C102D88","to":"0xA910f92ACdAf488fa6eF02174fb86208Ad7722ba","value":"0","data":"0x"}}',
                            error: null,
                            name: '@txseq/txhandler',
                            private: true,
                            status: 'in progress',
                            type: 'event',
                        },
                    ],
                    current_action: 0,
                    consumed: false,
                    current_status: 'event:in progress',
                    dispatched_at: expect.any(Date),
                    name: '@txseq/processor',
                },
            });

            // CHECK CALLS
        });

        it('should fail on invalid initial arguments', async function() {
            // DECLARE
            const caller: Partial<UserDto> = {
                id: 'caller_id',
            };
            const fromAddress = '0x32Be343B94f860124dC4fEe278FDCBD38C102D88';
            const args: TxSequenceAcsetBuilderArgs = {
                transactions: [
                    {
                        from: fromAddress,
                        value: '0',
                        data: '0x',
                    } as TransactionParameters,
                ],
            };

            // MOCK

            // TRIGGER
            const res = await context.txSeqAcsetbuilderHelper.buildActionSet(caller as UserDto, args);

            // CHECK RETURNs
            expect(res.error).toEqual('acset_invalid_arguments');
            expect(res.response).toEqual(null);

            // CHECK CALLS
        });
    });
});
