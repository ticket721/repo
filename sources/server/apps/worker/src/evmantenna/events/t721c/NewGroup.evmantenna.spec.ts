import { T721ControllerV0Service } from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { Schedule } from 'nest-schedule';
import { Job, JobOptions } from 'bull';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { EVMEventSetsService } from '@lib/common/evmeventsets/EVMEventSets.service';
import { EventsService } from '@lib/common/events/Events.service';
import { NewGroupT721CEVMAntenna } from '@app/worker/evmantenna/events/t721c/NewGroup.evmantenna';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { EVMProcessableEvent } from '@app/worker/evmantenna/EVMAntennaMerger.scheduler';
import { DryResponse } from '@lib/common/crud/CRUD.extension';

class QueueMock<T = any> {
    add(name: string, data: T, opts?: JobOptions): Promise<Job<T>> {
        return null;
    }
}

describe('NewGroup EVMAntenna', function() {
    const context: {
        newgroupEVMAntenna: NewGroupT721CEVMAntenna;
        t721ControllerServiceMock: T721ControllerV0Service;
        schedulerMock: Schedule;
        queueMock: QueueMock;
        globalConfigServiceMock: GlobalConfigService;
        shutdownServiceMock: ShutdownService;
        outrospectionServiceMock: OutrospectionService;
        evmEventSetsServiceMock: EVMEventSetsService;
        eventsServiceMock: EventsService;
    } = {
        newgroupEVMAntenna: null,
        t721ControllerServiceMock: null,
        schedulerMock: null,
        queueMock: null,
        globalConfigServiceMock: null,
        shutdownServiceMock: null,
        outrospectionServiceMock: null,
        evmEventSetsServiceMock: null,
        eventsServiceMock: null,
    };

    beforeEach(async function() {
        context.t721ControllerServiceMock = mock(T721ControllerV0Service);
        context.schedulerMock = mock(Schedule);
        context.queueMock = mock(QueueMock);
        context.globalConfigServiceMock = mock(GlobalConfigService);
        context.shutdownServiceMock = mock(ShutdownService);
        context.outrospectionServiceMock = mock(OutrospectionService);
        context.evmEventSetsServiceMock = mock(EVMEventSetsService);
        context.eventsServiceMock = mock(EventsService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NewGroupT721CEVMAntenna,
                {
                    provide: T721ControllerV0Service,
                    useValue: instance(context.t721ControllerServiceMock),
                },
                {
                    provide: 'NEST_SCHEDULE_PROVIDER',
                    useValue: instance(context.schedulerMock),
                },
                {
                    provide: getQueueToken('evmantenna'),
                    useValue: instance(context.queueMock),
                },
                {
                    provide: GlobalConfigService,
                    useValue: instance(context.globalConfigServiceMock),
                },
                {
                    provide: ShutdownService,
                    useValue: instance(context.shutdownServiceMock),
                },
                {
                    provide: OutrospectionService,
                    useValue: instance(context.outrospectionServiceMock),
                },
                {
                    provide: EVMEventSetsService,
                    useValue: instance(context.evmEventSetsServiceMock),
                },
                {
                    provide: EventsService,
                    useValue: instance(context.eventsServiceMock),
                },
            ],
        }).compile();

        context.newgroupEVMAntenna = module.get<NewGroupT721CEVMAntenna>(
            NewGroupT721CEVMAntenna,
        );
    });

    describe('convert', function() {
        it('should generate new group batch queries', async function() {
            const group_id =
                '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18';

            const processableEVMEvent: EVMProcessableEvent = {
                return_values:
                    '{"0":"0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18","1":"0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F","2":"@event/modules","id":"0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18","owner":"0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F","controllers":"@event/modules"}',
                address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                signature:
                    '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                block_hash:
                    '0x4d7d0c753f05c217ef76d8998a10d0bea9ed1278b2fbd076e365f5ff23de96bd',
                block_number: 55,
                raw_topics: [
                    '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18',
                    '0x000000000000000000000000c05187f1ec1a88ba07a880ace290ebe1b0941d9f',
                ],
                transaction_index: 0,
                event: 'NewGroup',
                raw_data:
                    '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                log_index: 0,
                transaction_hash:
                    '0x93bd530dcc8ac28c32307d3a98fa9f829501ddd0f7ccf48a1b64811b718f158b',
                artifact_name: 't721controller::T721Controller_v0',
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    group_id,
                                },
                            },
                        },
                    },
                },
            };

            const event_id = 'd262c466-5802-4a39-93a0-bd9e053cb79e';

            const esresponse = {
                took: 1,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 2.730029,
                    hits: [
                        {
                            _index: 'ticket721_event',
                            _type: 'event',
                            _id: 'd262c466-5802-4a39-93a0-bd9e053cb79e',
                            _score: 2.730029,
                            _source: {
                                owner: '034768a0-742d-474d-99d2-fc7591c7be3a',
                                address:
                                    '0xfD1596c4f1289a004afcE04dF89602458d4E9DE5',
                                created_at: '2020-02-29T21:12:23.512Z',
                                description: 'Justice Concert',
                                dates: [
                                    'a14c2cb6-921d-4bff-8ac5-e84c000011b5',
                                    '7442f38c-5a02-4899-9d4b-a61cf6f884e7',
                                ],
                                avatar: 'ece37bb0-176a-4746-9f70-981ee9bc7aa8',
                                banners: [
                                    'a6b2bda6-d022-43ef-89a0-092b8c38e28e',
                                    '83d79dd8-3562-4f2d-b3f3-c5ce1e757bb3',
                                ],
                                updated_at: '2020-02-29T21:12:24.538Z',
                                group_id:
                                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18',
                                name: 'Justice Woman WorldWide 2020',
                                categories: {
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_0',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: {
                                        currency: 'T721Token',
                                        log_value: 6.643856189774724,
                                        value: '100',
                                    },
                                    category_index: 0,
                                    seats: 100,
                                    status: 'preview',
                                },
                                id: 'd262c466-5802-4a39-93a0-bd9e053cb79e',
                                status: 'preview',
                            },
                        },
                    ],
                },
            };

            const queries: DryResponse[] = [];
            const rollbacks: DryResponse[] = [];

            const append = (
                query: DryResponse,
                rollback: DryResponse,
            ): void => {
                if (query === null || rollback === null) {
                    throw new Error('should not have asymmetric');
                }

                queries.push(query);
                rollbacks.unshift(rollback);
            };

            when(
                context.eventsServiceMock.searchElastic(deepEqual(esquery)),
            ).thenResolve({
                error: null,
                response: esresponse as any,
            });

            when(
                context.eventsServiceMock.dryUpdate(
                    deepEqual({
                        id: event_id,
                    }),
                    deepEqual({
                        status: 'deployed',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'preview => deployed query',
                    params: [42],
                },
            });

            when(
                context.eventsServiceMock.dryUpdate(
                    deepEqual({
                        id: event_id,
                    }),
                    deepEqual({
                        status: 'preview',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'deployed => preview query',
                    params: [42],
                },
            });

            await context.newgroupEVMAntenna.convert(
                processableEVMEvent,
                append,
            );

            expect(queries).toEqual([
                { query: 'preview => deployed query', params: [42] },
            ]);
            expect(rollbacks).toEqual([
                { query: 'deployed => preview query', params: [42] },
            ]);

            verify(
                context.eventsServiceMock.searchElastic(deepEqual(esquery)),
            ).called();
            verify(
                context.eventsServiceMock.dryUpdate(
                    deepEqual({
                        id: event_id,
                    }),
                    deepEqual({
                        status: 'deployed',
                    }),
                ),
            ).called();
            verify(
                context.eventsServiceMock.dryUpdate(
                    deepEqual({
                        id: event_id,
                    }),
                    deepEqual({
                        status: 'preview',
                    }),
                ),
            ).called();
        });

        it('should fail on event query error', async function() {
            const group_id =
                '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18';

            const processableEVMEvent: EVMProcessableEvent = {
                return_values:
                    '{"0":"0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18","1":"0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F","2":"@event/modules","id":"0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18","owner":"0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F","controllers":"@event/modules"}',
                address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                signature:
                    '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                block_hash:
                    '0x4d7d0c753f05c217ef76d8998a10d0bea9ed1278b2fbd076e365f5ff23de96bd',
                block_number: 55,
                raw_topics: [
                    '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18',
                    '0x000000000000000000000000c05187f1ec1a88ba07a880ace290ebe1b0941d9f',
                ],
                transaction_index: 0,
                event: 'NewGroup',
                raw_data:
                    '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                log_index: 0,
                transaction_hash:
                    '0x93bd530dcc8ac28c32307d3a98fa9f829501ddd0f7ccf48a1b64811b718f158b',
                artifact_name: 't721controller::T721Controller_v0',
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    group_id,
                                },
                            },
                        },
                    },
                },
            };

            const event_id = 'd262c466-5802-4a39-93a0-bd9e053cb79e';

            const esresponse = {
                took: 1,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 2.730029,
                    hits: [
                        {
                            _index: 'ticket721_event',
                            _type: 'event',
                            _id: 'd262c466-5802-4a39-93a0-bd9e053cb79e',
                            _score: 2.730029,
                            _source: {
                                owner: '034768a0-742d-474d-99d2-fc7591c7be3a',
                                address:
                                    '0xfD1596c4f1289a004afcE04dF89602458d4E9DE5',
                                created_at: '2020-02-29T21:12:23.512Z',
                                description: 'Justice Concert',
                                dates: [
                                    'a14c2cb6-921d-4bff-8ac5-e84c000011b5',
                                    '7442f38c-5a02-4899-9d4b-a61cf6f884e7',
                                ],
                                avatar: 'ece37bb0-176a-4746-9f70-981ee9bc7aa8',
                                banners: [
                                    'a6b2bda6-d022-43ef-89a0-092b8c38e28e',
                                    '83d79dd8-3562-4f2d-b3f3-c5ce1e757bb3',
                                ],
                                updated_at: '2020-02-29T21:12:24.538Z',
                                group_id:
                                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18',
                                name: 'Justice Woman WorldWide 2020',
                                categories: {
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_0',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: {
                                        currency: 'T721Token',
                                        log_value: 6.643856189774724,
                                        value: '100',
                                    },
                                    category_index: 0,
                                    seats: 100,
                                    status: 'preview',
                                },
                                id: 'd262c466-5802-4a39-93a0-bd9e053cb79e',
                                status: 'preview',
                            },
                        },
                    ],
                },
            };

            const queries: DryResponse[] = [];
            const rollbacks: DryResponse[] = [];

            const append = (
                query: DryResponse,
                rollback: DryResponse,
            ): void => {
                if (query === null || rollback === null) {
                    throw new Error('should not have asymmetric');
                }

                queries.push(query);
                rollbacks.unshift(rollback);
            };

            when(
                context.eventsServiceMock.searchElastic(deepEqual(esquery)),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.newgroupEVMAntenna.convert(processableEVMEvent, append),
            ).rejects.toMatchObject(
                new Error(
                    `NewGroupT721CEVMAntenna::convert | unable to recover appropriate event linked to id ${group_id}`,
                ),
            );

            expect(queries).toEqual([]);
            expect(rollbacks).toEqual([]);

            verify(
                context.eventsServiceMock.searchElastic(deepEqual(esquery)),
            ).called();
        });

        it('should skip if no esresult', async function() {
            const group_id =
                '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18';

            const processableEVMEvent: EVMProcessableEvent = {
                return_values:
                    '{"0":"0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18","1":"0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F","2":"@event/modules","id":"0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18","owner":"0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F","controllers":"@event/modules"}',
                address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                signature:
                    '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                block_hash:
                    '0x4d7d0c753f05c217ef76d8998a10d0bea9ed1278b2fbd076e365f5ff23de96bd',
                block_number: 55,
                raw_topics: [
                    '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18',
                    '0x000000000000000000000000c05187f1ec1a88ba07a880ace290ebe1b0941d9f',
                ],
                transaction_index: 0,
                event: 'NewGroup',
                raw_data:
                    '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                log_index: 0,
                transaction_hash:
                    '0x93bd530dcc8ac28c32307d3a98fa9f829501ddd0f7ccf48a1b64811b718f158b',
                artifact_name: 't721controller::T721Controller_v0',
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    group_id,
                                },
                            },
                        },
                    },
                },
            };

            const event_id = 'd262c466-5802-4a39-93a0-bd9e053cb79e';

            const esresponse = {
                took: 1,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 0,
                    max_score: 2.730029,
                    hits: [],
                },
            };

            const queries: DryResponse[] = [];
            const rollbacks: DryResponse[] = [];

            const append = (
                query: DryResponse,
                rollback: DryResponse,
            ): void => {
                if (query === null || rollback === null) {
                    throw new Error('should not have asymmetric');
                }

                queries.push(query);
                rollbacks.unshift(rollback);
            };

            when(
                context.eventsServiceMock.searchElastic(deepEqual(esquery)),
            ).thenResolve({
                error: null,
                response: esresponse as any,
            });

            await context.newgroupEVMAntenna.convert(
                processableEVMEvent,
                append,
            );

            expect(queries).toEqual([]);
            expect(rollbacks).toEqual([]);

            verify(
                context.eventsServiceMock.searchElastic(deepEqual(esquery)),
            ).called();
        });

        it('should fail on forward query generation', async function() {
            const group_id =
                '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18';

            const processableEVMEvent: EVMProcessableEvent = {
                return_values:
                    '{"0":"0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18","1":"0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F","2":"@event/modules","id":"0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18","owner":"0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F","controllers":"@event/modules"}',
                address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                signature:
                    '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                block_hash:
                    '0x4d7d0c753f05c217ef76d8998a10d0bea9ed1278b2fbd076e365f5ff23de96bd',
                block_number: 55,
                raw_topics: [
                    '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18',
                    '0x000000000000000000000000c05187f1ec1a88ba07a880ace290ebe1b0941d9f',
                ],
                transaction_index: 0,
                event: 'NewGroup',
                raw_data:
                    '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                log_index: 0,
                transaction_hash:
                    '0x93bd530dcc8ac28c32307d3a98fa9f829501ddd0f7ccf48a1b64811b718f158b',
                artifact_name: 't721controller::T721Controller_v0',
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    group_id,
                                },
                            },
                        },
                    },
                },
            };

            const event_id = 'd262c466-5802-4a39-93a0-bd9e053cb79e';

            const esresponse = {
                took: 1,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 2.730029,
                    hits: [
                        {
                            _index: 'ticket721_event',
                            _type: 'event',
                            _id: 'd262c466-5802-4a39-93a0-bd9e053cb79e',
                            _score: 2.730029,
                            _source: {
                                owner: '034768a0-742d-474d-99d2-fc7591c7be3a',
                                address:
                                    '0xfD1596c4f1289a004afcE04dF89602458d4E9DE5',
                                created_at: '2020-02-29T21:12:23.512Z',
                                description: 'Justice Concert',
                                dates: [
                                    'a14c2cb6-921d-4bff-8ac5-e84c000011b5',
                                    '7442f38c-5a02-4899-9d4b-a61cf6f884e7',
                                ],
                                avatar: 'ece37bb0-176a-4746-9f70-981ee9bc7aa8',
                                banners: [
                                    'a6b2bda6-d022-43ef-89a0-092b8c38e28e',
                                    '83d79dd8-3562-4f2d-b3f3-c5ce1e757bb3',
                                ],
                                updated_at: '2020-02-29T21:12:24.538Z',
                                group_id:
                                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18',
                                name: 'Justice Woman WorldWide 2020',
                                categories: {
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_0',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: {
                                        currency: 'T721Token',
                                        log_value: 6.643856189774724,
                                        value: '100',
                                    },
                                    category_index: 0,
                                    seats: 100,
                                    status: 'preview',
                                },
                                id: 'd262c466-5802-4a39-93a0-bd9e053cb79e',
                                status: 'preview',
                            },
                        },
                    ],
                },
            };

            const queries: DryResponse[] = [];
            const rollbacks: DryResponse[] = [];

            const append = (
                query: DryResponse,
                rollback: DryResponse,
            ): void => {
                if (query === null || rollback === null) {
                    throw new Error('should not have asymmetric');
                }

                queries.push(query);
                rollbacks.unshift(rollback);
            };

            when(
                context.eventsServiceMock.searchElastic(deepEqual(esquery)),
            ).thenResolve({
                error: null,
                response: esresponse as any,
            });

            when(
                context.eventsServiceMock.dryUpdate(
                    deepEqual({
                        id: event_id,
                    }),
                    deepEqual({
                        status: 'deployed',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.newgroupEVMAntenna.convert(processableEVMEvent, append),
            ).rejects.toMatchObject(
                new Error(
                    `NewGroupT721CEVMAntenna::convert | error while creating event update query: forward_update_query_building_error`,
                ),
            );

            expect(queries).toEqual([]);
            expect(rollbacks).toEqual([]);

            verify(
                context.eventsServiceMock.searchElastic(deepEqual(esquery)),
            ).called();
            verify(
                context.eventsServiceMock.dryUpdate(
                    deepEqual({
                        id: event_id,
                    }),
                    deepEqual({
                        status: 'deployed',
                    }),
                ),
            ).called();
        });

        it('should fail on rollback query generation', async function() {
            const group_id =
                '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18';

            const processableEVMEvent: EVMProcessableEvent = {
                return_values:
                    '{"0":"0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18","1":"0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F","2":"@event/modules","id":"0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18","owner":"0xc05187f1ec1a88bA07A880AcE290ebE1b0941D9F","controllers":"@event/modules"}',
                address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                signature:
                    '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                block_hash:
                    '0x4d7d0c753f05c217ef76d8998a10d0bea9ed1278b2fbd076e365f5ff23de96bd',
                block_number: 55,
                raw_topics: [
                    '0xb0b533a8147431475b127bea5dc4c66cb9d6ea7851b18215e4ab83fe8e0b3fa6',
                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18',
                    '0x000000000000000000000000c05187f1ec1a88ba07a880ace290ebe1b0941d9f',
                ],
                transaction_index: 0,
                event: 'NewGroup',
                raw_data:
                    '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e406576656e742f6d6f64756c6573000000000000000000000000000000000000',
                log_index: 0,
                transaction_hash:
                    '0x93bd530dcc8ac28c32307d3a98fa9f829501ddd0f7ccf48a1b64811b718f158b',
                artifact_name: 't721controller::T721Controller_v0',
            };

            const esquery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    group_id,
                                },
                            },
                        },
                    },
                },
            };

            const event_id = 'd262c466-5802-4a39-93a0-bd9e053cb79e';

            const esresponse = {
                took: 1,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 2.730029,
                    hits: [
                        {
                            _index: 'ticket721_event',
                            _type: 'event',
                            _id: 'd262c466-5802-4a39-93a0-bd9e053cb79e',
                            _score: 2.730029,
                            _source: {
                                owner: '034768a0-742d-474d-99d2-fc7591c7be3a',
                                address:
                                    '0xfD1596c4f1289a004afcE04dF89602458d4E9DE5',
                                created_at: '2020-02-29T21:12:23.512Z',
                                description: 'Justice Concert',
                                dates: [
                                    'a14c2cb6-921d-4bff-8ac5-e84c000011b5',
                                    '7442f38c-5a02-4899-9d4b-a61cf6f884e7',
                                ],
                                avatar: 'ece37bb0-176a-4746-9f70-981ee9bc7aa8',
                                banners: [
                                    'a6b2bda6-d022-43ef-89a0-092b8c38e28e',
                                    '83d79dd8-3562-4f2d-b3f3-c5ce1e757bb3',
                                ],
                                updated_at: '2020-02-29T21:12:24.538Z',
                                group_id:
                                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18',
                                name: 'Justice Woman WorldWide 2020',
                                categories: {
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_0',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: {
                                        currency: 'T721Token',
                                        log_value: 6.643856189774724,
                                        value: '100',
                                    },
                                    category_index: 0,
                                    seats: 100,
                                    status: 'preview',
                                },
                                id: 'd262c466-5802-4a39-93a0-bd9e053cb79e',
                                status: 'preview',
                            },
                        },
                    ],
                },
            };

            const queries: DryResponse[] = [];
            const rollbacks: DryResponse[] = [];

            const append = (
                query: DryResponse,
                rollback: DryResponse,
            ): void => {
                if (query === null || rollback === null) {
                    throw new Error('should not have asymmetric');
                }

                queries.push(query);
                rollbacks.unshift(rollback);
            };

            when(
                context.eventsServiceMock.searchElastic(deepEqual(esquery)),
            ).thenResolve({
                error: null,
                response: esresponse as any,
            });

            when(
                context.eventsServiceMock.dryUpdate(
                    deepEqual({
                        id: event_id,
                    }),
                    deepEqual({
                        status: 'deployed',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'preview => deployed query',
                    params: [42],
                },
            });

            when(
                context.eventsServiceMock.dryUpdate(
                    deepEqual({
                        id: event_id,
                    }),
                    deepEqual({
                        status: 'preview',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await expect(
                context.newgroupEVMAntenna.convert(processableEVMEvent, append),
            ).rejects.toMatchObject(
                new Error(
                    `NewGroupT721CEVMAntenna::convert | error while creating event update query: rollback_update_query_building_error`,
                ),
            );

            expect(queries).toEqual([]);
            expect(rollbacks).toEqual([]);

            verify(
                context.eventsServiceMock.searchElastic(deepEqual(esquery)),
            ).called();
            verify(
                context.eventsServiceMock.dryUpdate(
                    deepEqual({
                        id: event_id,
                    }),
                    deepEqual({
                        status: 'deployed',
                    }),
                ),
            ).called();
            verify(
                context.eventsServiceMock.dryUpdate(
                    deepEqual({
                        id: event_id,
                    }),
                    deepEqual({
                        status: 'preview',
                    }),
                ),
            ).called();
        });
    });
});
