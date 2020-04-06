import { BN, Gem } from 'dosojin';
import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';

describe('GemOrder Entity', function() {
    describe('constructor', function() {
        it('should build from nothing', function() {
            const gemOrderEntity = new GemOrderEntity();

            expect(gemOrderEntity).toEqual({});
        });

        it('should build from go with id', function() {
            const rawGemOrderEntity = {
                gem: {
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
                },
                distribution_id: 123,
                created_at: new Date(),
                updated_at: new Date(),
                id: 'abcd',
                circuit_name: 'name',
                initialized: true,
                initial_arguments: '',
                refresh_timer: 123,
            } as GemOrderEntity;

            const gemOrderEntity = new GemOrderEntity(rawGemOrderEntity);

            expect(gemOrderEntity).toEqual(rawGemOrderEntity);
        });

        it('should build from go with payload', function() {
            const rawGemOrderEntity = {
                gem: {
                    action_type: 'transfer',
                    error_info: null,
                    gem_data: '{}',
                    gem_payload: null,
                    gem_status: undefined,
                    operation_status: null,
                    refresh_timer: null,
                    route_history: [],
                    transfer_status: null,
                },
                distribution_id: 123,
                created_at: new Date(),
                updated_at: new Date(),
                id: null,
                circuit_name: 'name',
                initialized: true,
                initial_arguments: '',
                refresh_timer: 123,
            } as GemOrderEntity;

            const gemOrderEntity = new GemOrderEntity(rawGemOrderEntity);

            expect(gemOrderEntity).toEqual(rawGemOrderEntity);
        });

        it('should build from go', function() {
            const rawGemOrderEntity = {
                gem: {
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
                },
                distribution_id: 123,
                created_at: new Date(),
                updated_at: new Date(),
                id: null,
                circuit_name: 'name',
                initialized: true,
                initial_arguments: '',
                refresh_timer: 123,
            } as GemOrderEntity;

            const gemOrderEntity = new GemOrderEntity(rawGemOrderEntity);

            expect(gemOrderEntity).toEqual(rawGemOrderEntity);
        });

        it('should build from go with transfer status', function() {
            const rawGemOrderEntity = {
                gem: {
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
                    transfer_status: {
                        connector: null,
                        receptacle: null,
                    },
                },
                distribution_id: 123,
                created_at: new Date(),
                updated_at: new Date(),
                id: null,
                circuit_name: 'name',
                initialized: true,
                initial_arguments: '',
                refresh_timer: 123,
            } as GemOrderEntity;

            const gemOrderEntity = new GemOrderEntity(rawGemOrderEntity);

            expect(gemOrderEntity).toEqual(rawGemOrderEntity);
        });

        it('should build from go with operation status', function() {
            const rawGemOrderEntity = {
                gem: {
                    action_type: 'transfer',
                    error_info: null,
                    gem_data: '{}',
                    gem_payload: {
                        costs: [],
                        values: '{}',
                    },
                    gem_status: undefined,
                    operation_status: {},
                    refresh_timer: null,
                    route_history: [],
                    transfer_status: null,
                },
                distribution_id: 123,
                created_at: new Date(),
                updated_at: new Date(),
                id: null,
                circuit_name: 'name',
                initialized: true,
                initial_arguments: '',
                refresh_timer: 123,
            } as GemOrderEntity;

            const gemOrderEntity = new GemOrderEntity(rawGemOrderEntity);

            expect(gemOrderEntity).toEqual(rawGemOrderEntity);
        });
    });

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
                {
                    value: null,
                    scope: 'fiat_eur',
                    dosojin: 'main',
                    entity_name: 'entity',
                    entity_type: 'connector',
                    layer: 0,
                    reason: 'because',
                },
            ];

            rawGem.gem_payload.values = null;

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
                        {
                            dosojin: 'main',
                            entity_name: 'entity',
                            entity_type: 'connector',
                            layer: 0,
                            reason: 'because',
                            scope: 'fiat_eur',
                            value: null,
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

        it('should convert gem with gemdata null', async function() {
            const gem = new Gem();

            const rawGem = gem.raw;

            rawGem.gem_data = null;

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

        it('should convert gem with operation status', async function() {
            const gem = new Gem();

            const rawGem = gem.raw;

            rawGem.operation_status = {
                status: 'status',
                layer: 0,
                dosojin: 'dosojin',
                operation_list: [],
            };

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
                operation_status: {
                    dosojin: 'dosojin',
                    layer: 0,
                    operation_list: [],
                    status: 'status',
                },
                refresh_timer: null,
                route_history: [],
                transfer_status: null,
            });
        });

        it('should convert gem with operation status (and null operation_list)', async function() {
            const gem = new Gem();

            const rawGem = gem.raw;

            rawGem.operation_status = {
                status: 'status',
                layer: 0,
                dosojin: 'dosojin',
                operation_list: null,
            };

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
                operation_status: {
                    dosojin: 'dosojin',
                    layer: 0,
                    operation_list: [],
                    status: 'status',
                },
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

        it('should convert to gem with payload', async function() {
            const gem = new Gem().addPayloadValue('fiat_eur', new BN(10));

            const rawGem = gem.raw;

            const processedRawGem = GemOrderEntity.fromDosojinRaw(rawGem);

            const backFromProcessedRawGem = GemOrderEntity.toDosojinRaw(processedRawGem);

            expect(backFromProcessedRawGem).toEqual(rawGem);
        });

        it('should convert to gem with payload null values', async function() {
            const gem = new Gem();

            const rawGem = gem.raw;

            rawGem.gem_payload.values = null;

            const processedRawGem = GemOrderEntity.fromDosojinRaw(rawGem);

            const backFromProcessedRawGem = GemOrderEntity.toDosojinRaw(processedRawGem);

            expect(backFromProcessedRawGem).toEqual({
                ...rawGem,
                gem_payload: {
                    ...rawGem.gem_payload,
                    values: {},
                },
            });
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

        it('should convert to gem with costs null values', async function() {
            const gem = new Gem();

            const rawGem = gem.raw;

            rawGem.gem_payload.costs = null;

            const processedRawGem = GemOrderEntity.fromDosojinRaw(rawGem);

            const backFromProcessedRawGem = GemOrderEntity.toDosojinRaw(processedRawGem);

            expect(backFromProcessedRawGem).toEqual({
                ...rawGem,
                gem_payload: {
                    ...rawGem.gem_payload,
                    costs: [],
                },
            });
        });

        it('should convert to gem with operation status', async function() {
            const gem = new Gem();

            const rawGem = gem.raw;

            rawGem.operation_status = {
                status: 'status',
                layer: 0,
                dosojin: 'dosojin',
                operation_list: [],
            };

            const processedRawGem = GemOrderEntity.fromDosojinRaw(rawGem);

            const backFromProcessedRawGem = GemOrderEntity.toDosojinRaw(processedRawGem);

            expect(backFromProcessedRawGem).toEqual(rawGem);
        });

        it('should convert to gem with empty route history', async function() {
            const gem = new Gem();

            const rawGem = gem.raw;

            rawGem.route_history = null;

            const processedRawGem = GemOrderEntity.fromDosojinRaw(rawGem);

            const backFromProcessedRawGem = GemOrderEntity.toDosojinRaw(processedRawGem);

            expect(backFromProcessedRawGem).toEqual({
                ...rawGem,
                route_history: [],
            });
        });

        it('should convert to gem with operation status (empty list)', async function() {
            const gem = new Gem();

            const rawGem = gem.raw;

            rawGem.operation_status = {
                status: 'status',
                layer: 0,
                dosojin: 'dosojin',
                operation_list: null,
            };

            const processedRawGem = GemOrderEntity.fromDosojinRaw(rawGem);

            const backFromProcessedRawGem = GemOrderEntity.toDosojinRaw(processedRawGem);

            expect(backFromProcessedRawGem).toEqual({
                ...rawGem,
                operation_status: {
                    ...rawGem.operation_status,
                    operation_list: [],
                },
            });
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
