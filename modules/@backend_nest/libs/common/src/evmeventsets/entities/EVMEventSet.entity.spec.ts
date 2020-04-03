import { EVMEventSetEntity } from '@lib/common/evmeventsets/entities/EVMEventSet.entity';

describe('EVMEventSet Entity', function() {
    describe('constructor', function() {
        it('should build from nothing', function() {
            const evmEventSetEntity = new EVMEventSetEntity();

            expect(evmEventSetEntity).toEqual({});
        });

        it('should build from raw evm event set entity', function() {
            const rawEvmEventSetEntity = {
                artifact_name: 'abcd',
                event_name: 'abcd',
                block_number: 123,
                events: [
                    {
                        raw_topics: [],
                    },
                ],
                created_at: new Date(),
                updated_at: new Date(),
            } as EVMEventSetEntity;

            const evmEventSetEntity = new EVMEventSetEntity(rawEvmEventSetEntity);

            expect(evmEventSetEntity).toEqual(rawEvmEventSetEntity);
        });
    });
});
