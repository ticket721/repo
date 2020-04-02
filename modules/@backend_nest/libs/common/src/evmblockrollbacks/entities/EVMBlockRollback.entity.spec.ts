import { EVMBlockRollbackEntity } from '@lib/common/evmblockrollbacks/entities/EVMBlockRollback.entity';

describe('EVMBlockRollback Entity', function() {
    describe('constructor', function() {
        it('should properly build complete EVMBlockRollback entity', async function() {
            const evmbr: EVMBlockRollbackEntity = {
                block_number: 1,
                rollback_queries: [
                    {
                        query: 'query',
                        params: [],
                    },
                ],
                created_at: new Date(Date.now()),
                updated_at: new Date(Date.now()),
            };

            const builtEvmbr = new EVMBlockRollbackEntity(evmbr);

            expect(builtEvmbr).toEqual(evmbr);
        });

        it('should build wven with undefined input', async function() {
            const builtEvmbr = new EVMBlockRollbackEntity();

            expect(builtEvmbr).toEqual({});
        });
    });
});
