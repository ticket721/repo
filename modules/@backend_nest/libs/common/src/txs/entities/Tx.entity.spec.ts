import { TxEntity } from '@lib/common/txs/entities/Tx.entity';

describe('Tx Entity', function() {
    describe('constructor', function() {
        it('should build with nothing', function() {
            const txEntity = new TxEntity();

            expect(txEntity).toEqual({});
        });

        it('should build with raw entity', function() {
            const rawTxEntity = {
                transaction_hash: 'abcd',
                confirmed: true,
                status: true,
                block_hash: 'abcd',
                block_number: 1234,
                transaction_index: 1,
                from_: 'abcd',
                to_: 'abcd',
                contract_address: 'abcd',
                cumulative_gas_used: '123',
                cumulative_gas_used_ln: 1.23,
                gas_used: '123',
                gas_used_ln: 1.23,
                gas_price: '123',
                gas_price_ln: 1.23,
                logs: [
                    {
                        topics: [],
                    },
                ],
                logs_bloom: 'abcd',
                created_at: new Date(),
                updated_at: new Date(),
            } as TxEntity;

            const txEntity = new TxEntity(rawTxEntity);

            expect(txEntity).toEqual(rawTxEntity);
        });
    });
});
