import { BN, Gem } from 'dosojin';
import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';

describe('GemOrder Entity', function() {
    describe('fromDosojinRaw', function() {
        it('should convert freshly created gem', async function() {
            const gem = new Gem();

            const rawGem = gem.raw;

            const processedRawGem = GemOrderEntity.fromDosojinRaw(rawGem);

            expect(processedRawGem).toEqual({
                action_type: 'transfer',
                error_info: null,
                gem_data: '{}',
                gem_payload: {
                    costs: [],
                    values: '{}',
                },
                gem_status: undefined,
                operation_status: null,
                refresh_timer: null,
                route_history: [],
                transfer_status: null,
            });
        });

        it('should convert gem with payload', async function() {
            const gem = new Gem().addPayloadValue('fiat_eur', new BN(10));

            const rawGem = gem.raw;

            const processedRawGem = GemOrderEntity.fromDosojinRaw(rawGem);

            expect(processedRawGem).toEqual({
                action_type: 'transfer',
                error_info: null,
                gem_data: '{}',
                gem_payload: {
                    costs: [],
                    values: '{"fiat_eur":"10"}',
                },
                gem_status: undefined,
                operation_status: null,
                refresh_timer: null,
                route_history: [],
                transfer_status: null,
            });
        });

        it('should convert gem with costs', async function() {
            const gem = new Gem();

            const rawGem = gem.raw;

            rawGem.gem_payload.costs = [
                {
                    value: '123',
                    scope: 'fiat_eur',
                    dosojin: 'main',
                    entity_name: 'entity',
                    entity_type: 'connector',
                    layer: 0,
                    reason: 'because',
                },
            ];

            const processedRawGem = GemOrderEntity.fromDosojinRaw(rawGem);

            expect(processedRawGem).toEqual({
                action_type: 'transfer',
                error_info: null,
                gem_data: '{}',
                gem_payload: {
                    costs: [
                        {
                            dosojin: 'main',
                            entity_name: 'entity',
                            entity_type: 'connector',
                            layer: 0,
                            reason: 'because',
                            scope: 'fiat_eur',
                            value: '"123"',
                        },
                    ],
                    values: '{}',
                },
                gem_status: undefined,
                operation_status: null,
                refresh_timer: null,
                route_history: [],
                transfer_status: null,
            });
        });

        it('should convert gem with gemdata', async function() {
            const gem = new Gem();

            const rawGem = gem.raw;

            rawGem.gem_data = {
                name: 'hi',
            };

            const processedRawGem = GemOrderEntity.fromDosojinRaw(rawGem);

            expect(processedRawGem).toEqual({
                action_type: 'transfer',
                error_info: null,
                gem_data: '{"name":"hi"}',
                gem_payload: {
                    costs: [],
                    values: '{}',
                },
                gem_status: undefined,
                operation_status: null,
                refresh_timer: null,
                route_history: [],
                transfer_status: null,
            });
        });
    });

    describe('toDosojinRaw', function() {
        it('should convert to gem', async function() {
            const gem = new Gem();

            const rawGem = gem.raw;

            const processedRawGem = GemOrderEntity.fromDosojinRaw(rawGem);

            const backFromProcessedRawGem = GemOrderEntity.toDosojinRaw(processedRawGem);

            expect(backFromProcessedRawGem).toEqual(rawGem);
        });

        it('should convert to gem with costs', async function() {
            const gem = new Gem();

            const rawGem = gem.raw;

            rawGem.gem_payload.costs = [
                {
                    value: '123',
                    scope: 'fiat_eur',
                    dosojin: 'main',
                    entity_name: 'entity',
                    entity_type: 'connector',
                    layer: 0,
                    reason: 'because',
                },
            ];

            const processedRawGem = GemOrderEntity.fromDosojinRaw(rawGem);

            const backFromProcessedRawGem = GemOrderEntity.toDosojinRaw(processedRawGem);

            expect(backFromProcessedRawGem).toEqual(rawGem);
        });
    });

    describe('genOrderID', function() {
        it('should give me a random id', function() {
            const id = GemOrderEntity.genOrderID();

            expect(id).toBeGreaterThanOrEqual(0);
            expect(id).toBeLessThan(9223372036854775807);
        });
    });
});
