import { Job, JobOptions } from 'bull';
import { T721ControllerV0Service } from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { Schedule } from 'nest-schedule';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { EVMEventSetsService } from '@lib/common/evmeventsets/EVMEventSets.service';
import { EventsService } from '@lib/common/events/Events.service';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { NewCategoryT721CEVMAntenna } from '@app/worker/evmantenna/events/t721c/NewCategory.evmantenna';
import { DatesService } from '@lib/common/dates/Dates.service';
import { toB32 } from '@ticket721sources/global';
import { DryResponse } from '@lib/common/crud/CRUD.extension';
import { EVMProcessableEvent } from '@app/worker/evmantenna/EVMAntennaMerger.scheduler';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { Category, DateEntity } from '@lib/common/dates/entities/Date.entity';

class QueueMock<T = any> {
    add(name: string, data: T, opts?: JobOptions): Promise<Job<T>> {
        return null;
    }
}

describe('NewGroup EVMAntenna', function() {
    const context: {
        newCategoryEVMAntenna: NewCategoryT721CEVMAntenna;
        t721ControllerServiceMock: T721ControllerV0Service;
        schedulerMock: Schedule;
        queueMock: QueueMock;
        globalConfigServiceMock: GlobalConfigService;
        shutdownServiceMock: ShutdownService;
        outrospectionServiceMock: OutrospectionService;
        evmEventSetsServiceMock: EVMEventSetsService;
        eventsServiceMock: EventsService;
        datesServiceMock: DatesService;
    } = {
        newCategoryEVMAntenna: null,
        t721ControllerServiceMock: null,
        schedulerMock: null,
        queueMock: null,
        globalConfigServiceMock: null,
        shutdownServiceMock: null,
        outrospectionServiceMock: null,
        evmEventSetsServiceMock: null,
        eventsServiceMock: null,
        datesServiceMock: null,
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
        context.datesServiceMock = mock(DatesService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NewCategoryT721CEVMAntenna,
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
                {
                    provide: DatesService,
                    useValue: instance(context.datesServiceMock),
                },
            ],
        }).compile();

        context.newCategoryEVMAntenna = module.get<NewCategoryT721CEVMAntenna>(
            NewCategoryT721CEVMAntenna,
        );
    });

    describe('convert', function() {
        describe('event global category case', function() {
            it('should generate new category batch queries', async function() {
                const group_id =
                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18';
                const category_name = toB32('vip_0');

                const evmevent = {
                    return_values: `{"0":"${group_id}","1":"${category_name}","2":"2","group_id":"${group_id}","category_name":"${category_name}","idx":"2"}`,
                    address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                    signature:
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                    block_hash:
                        '0x2d87947a4e5fcee59988b3c3a1b9f520c7a4e351098eba87061a50ca2819e622',
                    block_number: 56,
                    raw_topics: [
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                        '0x49f172881d28e32dc61815945d1d4c22f9966d38ce20f6aaf1379586a0581a41',
                        '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                        '0x0000000000000000000000000000000000000000000000000000000000000002',
                    ],
                    transaction_index: 0,
                    event: 'NewCategory',
                    raw_data: '0x',
                    log_index: 4,
                    transaction_hash:
                        '0x8664571b37c66d024d8c6784e3890b9fa0aa05e3e8120a637048d13a5fe6c6f2',
                    artifact_name: 't721controller::T721Controller_v0',
                };

                const esquery = {
                    body: {
                        query: {
                            bool: {
                                must: {
                                    term: {
                                        group_id: group_id.toLowerCase(),
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
                                    owner:
                                        '034768a0-742d-474d-99d2-fc7591c7be3a',
                                    address:
                                        '0xfD1596c4f1289a004afcE04dF89602458d4E9DE5',
                                    created_at: '2020-02-29T21:12:23.512Z',
                                    description: 'Justice Concert',
                                    dates: [
                                        'a14c2cb6-921d-4bff-8ac5-e84c000011b5',
                                        '7442f38c-5a02-4899-9d4b-a61cf6f884e7',
                                    ],
                                    avatar:
                                        'ece37bb0-176a-4746-9f70-981ee9bc7aa8',
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
                                        resale_begin:
                                            '2020-02-29T22:12:17.109Z',
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
                            categories: [
                                ({
                                    group_id: group_id,
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_0',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'deployed',
                                } as any) as Category,
                            ],
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
                            categories: [
                                ({
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_0',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'preview',
                                } as any) as Category,
                            ],
                        }),
                    ),
                ).thenResolve({
                    error: null,
                    response: {
                        query: 'deployed => preview query',
                        params: [42],
                    },
                });

                await context.newCategoryEVMAntenna.convert(evmevent, append);

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
                            categories: [
                                ({
                                    group_id: group_id,
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_0',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'deployed',
                                } as any) as Category,
                            ],
                        }),
                    ),
                ).called();

                verify(
                    context.eventsServiceMock.dryUpdate(
                        deepEqual({
                            id: event_id,
                        }),
                        deepEqual({
                            categories: [
                                ({
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_0',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'preview',
                                } as any) as Category,
                            ],
                        }),
                    ),
                ).called();
            });

            it('should not find linked event', async function() {
                const group_id =
                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18';
                const category_name = toB32('vip_0');

                const evmevent = {
                    return_values: `{"0":"${group_id}","1":"${category_name}","2":"2","group_id":"${group_id}","category_name":"${category_name}","idx":"2"}`,
                    address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                    signature:
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                    block_hash:
                        '0x2d87947a4e5fcee59988b3c3a1b9f520c7a4e351098eba87061a50ca2819e622',
                    block_number: 56,
                    raw_topics: [
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                        '0x49f172881d28e32dc61815945d1d4c22f9966d38ce20f6aaf1379586a0581a41',
                        '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                        '0x0000000000000000000000000000000000000000000000000000000000000002',
                    ],
                    transaction_index: 0,
                    event: 'NewCategory',
                    raw_data: '0x',
                    log_index: 4,
                    transaction_hash:
                        '0x8664571b37c66d024d8c6784e3890b9fa0aa05e3e8120a637048d13a5fe6c6f2',
                    artifact_name: 't721controller::T721Controller_v0',
                };

                const esquery = {
                    body: {
                        query: {
                            bool: {
                                must: {
                                    term: {
                                        group_id: group_id.toLowerCase(),
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

                await context.newCategoryEVMAntenna.convert(evmevent, append);

                expect(queries).toEqual([]);
                expect(rollbacks).toEqual([]);

                verify(
                    context.eventsServiceMock.searchElastic(deepEqual(esquery)),
                ).called();
            });

            it('should fail on linked event fetch error', async function() {
                const group_id =
                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18';
                const category_name = toB32('vip_0');

                const evmevent = {
                    return_values: `{"0":"${group_id}","1":"${category_name}","2":"2","group_id":"${group_id}","category_name":"${category_name}","idx":"2"}`,
                    address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                    signature:
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                    block_hash:
                        '0x2d87947a4e5fcee59988b3c3a1b9f520c7a4e351098eba87061a50ca2819e622',
                    block_number: 56,
                    raw_topics: [
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                        '0x49f172881d28e32dc61815945d1d4c22f9966d38ce20f6aaf1379586a0581a41',
                        '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                        '0x0000000000000000000000000000000000000000000000000000000000000002',
                    ],
                    transaction_index: 0,
                    event: 'NewCategory',
                    raw_data: '0x',
                    log_index: 4,
                    transaction_hash:
                        '0x8664571b37c66d024d8c6784e3890b9fa0aa05e3e8120a637048d13a5fe6c6f2',
                    artifact_name: 't721controller::T721Controller_v0',
                };

                const esquery = {
                    body: {
                        query: {
                            bool: {
                                must: {
                                    term: {
                                        group_id: group_id.toLowerCase(),
                                    },
                                },
                            },
                        },
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
                    context.newCategoryEVMAntenna.convert(evmevent, append),
                ).rejects.toMatchObject(
                    new Error(
                        `NewCategoryT721CEVMAntenna::convert | error while fetching events: unexpected_error`,
                    ),
                );

                expect(queries).toEqual([]);
                expect(rollbacks).toEqual([]);

                verify(
                    context.eventsServiceMock.searchElastic(deepEqual(esquery)),
                ).called();
            });

            it('should fail on forward query creation', async function() {
                const group_id =
                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18';
                const category_name = toB32('vip_0');

                const evmevent = {
                    return_values: `{"0":"${group_id}","1":"${category_name}","2":"2","group_id":"${group_id}","category_name":"${category_name}","idx":"2"}`,
                    address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                    signature:
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                    block_hash:
                        '0x2d87947a4e5fcee59988b3c3a1b9f520c7a4e351098eba87061a50ca2819e622',
                    block_number: 56,
                    raw_topics: [
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                        '0x49f172881d28e32dc61815945d1d4c22f9966d38ce20f6aaf1379586a0581a41',
                        '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                        '0x0000000000000000000000000000000000000000000000000000000000000002',
                    ],
                    transaction_index: 0,
                    event: 'NewCategory',
                    raw_data: '0x',
                    log_index: 4,
                    transaction_hash:
                        '0x8664571b37c66d024d8c6784e3890b9fa0aa05e3e8120a637048d13a5fe6c6f2',
                    artifact_name: 't721controller::T721Controller_v0',
                };

                const esquery = {
                    body: {
                        query: {
                            bool: {
                                must: {
                                    term: {
                                        group_id: group_id.toLowerCase(),
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
                                    owner:
                                        '034768a0-742d-474d-99d2-fc7591c7be3a',
                                    address:
                                        '0xfD1596c4f1289a004afcE04dF89602458d4E9DE5',
                                    created_at: '2020-02-29T21:12:23.512Z',
                                    description: 'Justice Concert',
                                    dates: [
                                        'a14c2cb6-921d-4bff-8ac5-e84c000011b5',
                                        '7442f38c-5a02-4899-9d4b-a61cf6f884e7',
                                    ],
                                    avatar:
                                        'ece37bb0-176a-4746-9f70-981ee9bc7aa8',
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
                                        resale_begin:
                                            '2020-02-29T22:12:17.109Z',
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
                            categories: [
                                ({
                                    group_id: group_id,
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_0',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'deployed',
                                } as any) as Category,
                            ],
                        }),
                    ),
                ).thenResolve({
                    error: 'unexpected_error',
                    response: null,
                });

                await expect(
                    context.newCategoryEVMAntenna.convert(evmevent, append),
                ).rejects.toMatchObject(
                    new Error(
                        `NewCategoryT721CEVMAntenna::convert | error while generating dry event category update: forward_update_query_building_error`,
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
                            categories: [
                                ({
                                    group_id: group_id,
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_0',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'deployed',
                                } as any) as Category,
                            ],
                        }),
                    ),
                ).called();
            });

            it('should fail on rollback query creation', async function() {
                const group_id =
                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18';
                const category_name = toB32('vip_0');

                const evmevent = {
                    return_values: `{"0":"${group_id}","1":"${category_name}","2":"2","group_id":"${group_id}","category_name":"${category_name}","idx":"2"}`,
                    address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                    signature:
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                    block_hash:
                        '0x2d87947a4e5fcee59988b3c3a1b9f520c7a4e351098eba87061a50ca2819e622',
                    block_number: 56,
                    raw_topics: [
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                        '0x49f172881d28e32dc61815945d1d4c22f9966d38ce20f6aaf1379586a0581a41',
                        '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                        '0x0000000000000000000000000000000000000000000000000000000000000002',
                    ],
                    transaction_index: 0,
                    event: 'NewCategory',
                    raw_data: '0x',
                    log_index: 4,
                    transaction_hash:
                        '0x8664571b37c66d024d8c6784e3890b9fa0aa05e3e8120a637048d13a5fe6c6f2',
                    artifact_name: 't721controller::T721Controller_v0',
                };

                const esquery = {
                    body: {
                        query: {
                            bool: {
                                must: {
                                    term: {
                                        group_id: group_id.toLowerCase(),
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
                                    owner:
                                        '034768a0-742d-474d-99d2-fc7591c7be3a',
                                    address:
                                        '0xfD1596c4f1289a004afcE04dF89602458d4E9DE5',
                                    created_at: '2020-02-29T21:12:23.512Z',
                                    description: 'Justice Concert',
                                    dates: [
                                        'a14c2cb6-921d-4bff-8ac5-e84c000011b5',
                                        '7442f38c-5a02-4899-9d4b-a61cf6f884e7',
                                    ],
                                    avatar:
                                        'ece37bb0-176a-4746-9f70-981ee9bc7aa8',
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
                                        resale_begin:
                                            '2020-02-29T22:12:17.109Z',
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
                            categories: [
                                ({
                                    group_id: group_id,
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_0',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'deployed',
                                } as any) as Category,
                            ],
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
                            categories: [
                                ({
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_0',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'preview',
                                } as any) as Category,
                            ],
                        }),
                    ),
                ).thenResolve({
                    error: 'unexpected_error',
                    response: null,
                });

                await expect(
                    context.newCategoryEVMAntenna.convert(evmevent, append),
                ).rejects.toMatchObject(
                    new Error(
                        `NewCategoryT721CEVMAntenna::convert | error while generating dry event category update: rollback_update_query_building_error`,
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
                            categories: [
                                ({
                                    group_id: group_id,
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_0',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'deployed',
                                } as any) as Category,
                            ],
                        }),
                    ),
                ).called();

                verify(
                    context.eventsServiceMock.dryUpdate(
                        deepEqual({
                            id: event_id,
                        }),
                        deepEqual({
                            categories: [
                                ({
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_0',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'preview',
                                } as any) as Category,
                            ],
                        }),
                    ),
                ).called();
            });
        });

        describe('date category case', function() {
            it('should generate new category batch queries', async function() {
                const group_id =
                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18';
                const category_name = toB32('vip_1');

                const evmevent = {
                    return_values: `{"0":"${group_id}","1":"${category_name}","2":"2","group_id":"${group_id}","category_name":"${category_name}","idx":"2"}`,
                    address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                    signature:
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                    block_hash:
                        '0x2d87947a4e5fcee59988b3c3a1b9f520c7a4e351098eba87061a50ca2819e622',
                    block_number: 56,
                    raw_topics: [
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                        '0x49f172881d28e32dc61815945d1d4c22f9966d38ce20f6aaf1379586a0581a41',
                        '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                        '0x0000000000000000000000000000000000000000000000000000000000000002',
                    ],
                    transaction_index: 0,
                    event: 'NewCategory',
                    raw_data: '0x',
                    log_index: 4,
                    transaction_hash:
                        '0x8664571b37c66d024d8c6784e3890b9fa0aa05e3e8120a637048d13a5fe6c6f2',
                    artifact_name: 't721controller::T721Controller_v0',
                };

                const esquery = {
                    body: {
                        query: {
                            bool: {
                                must: {
                                    term: {
                                        group_id: group_id.toLowerCase(),
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
                                    owner:
                                        '034768a0-742d-474d-99d2-fc7591c7be3a',
                                    address:
                                        '0xfD1596c4f1289a004afcE04dF89602458d4E9DE5',
                                    created_at: '2020-02-29T21:12:23.512Z',
                                    description: 'Justice Concert',
                                    dates: [
                                        'a14c2cb6-921d-4bff-8ac5-e84c000011b5',
                                    ],
                                    avatar:
                                        'ece37bb0-176a-4746-9f70-981ee9bc7aa8',
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
                                        resale_begin:
                                            '2020-02-29T22:12:17.109Z',
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

                const dateId = 'a14c2cb6-921d-4bff-8ac5-e84c000011b5';
                const date = {
                    id: dateId,
                    categories: {
                        sale_begin: '2020-02-29T22:12:17.109Z',
                        category_name: 'vip_1',
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
                    context.datesServiceMock.search(
                        deepEqual({
                            id: dateId,
                        }),
                    ),
                ).thenResolve({
                    error: null,
                    response: [(date as any) as DateEntity],
                });

                when(
                    context.datesServiceMock.dryUpdate(
                        deepEqual({
                            id: dateId,
                        }),
                        deepEqual({
                            categories: [
                                ({
                                    group_id: group_id,
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_1',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'deployed',
                                } as any) as Category,
                            ],
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
                    context.datesServiceMock.dryUpdate(
                        deepEqual({
                            id: dateId,
                        }),
                        deepEqual({
                            categories: [
                                ({
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_1',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'preview',
                                } as any) as Category,
                            ],
                        }),
                    ),
                ).thenResolve({
                    error: null,
                    response: {
                        query: 'deployed => preview query',
                        params: [42],
                    },
                });

                await context.newCategoryEVMAntenna.convert(evmevent, append);

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
                    context.datesServiceMock.search(
                        deepEqual({
                            id: dateId,
                        }),
                    ),
                ).called();

                verify(
                    context.datesServiceMock.dryUpdate(
                        deepEqual({
                            id: dateId,
                        }),
                        deepEqual({
                            categories: [
                                ({
                                    group_id: group_id,
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_1',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'deployed',
                                } as any) as Category,
                            ],
                        }),
                    ),
                ).called();

                verify(
                    context.datesServiceMock.dryUpdate(
                        deepEqual({
                            id: dateId,
                        }),
                        deepEqual({
                            categories: [
                                ({
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_1',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'preview',
                                } as any) as Category,
                            ],
                        }),
                    ),
                ).called();
            });

            it('should skip when no id found', async function() {
                const group_id =
                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18';
                const category_name = toB32('vip_1');

                const evmevent = {
                    return_values: `{"0":"${group_id}","1":"${category_name}","2":"2","group_id":"${group_id}","category_name":"${category_name}","idx":"2"}`,
                    address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                    signature:
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                    block_hash:
                        '0x2d87947a4e5fcee59988b3c3a1b9f520c7a4e351098eba87061a50ca2819e622',
                    block_number: 56,
                    raw_topics: [
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                        '0x49f172881d28e32dc61815945d1d4c22f9966d38ce20f6aaf1379586a0581a41',
                        '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                        '0x0000000000000000000000000000000000000000000000000000000000000002',
                    ],
                    transaction_index: 0,
                    event: 'NewCategory',
                    raw_data: '0x',
                    log_index: 4,
                    transaction_hash:
                        '0x8664571b37c66d024d8c6784e3890b9fa0aa05e3e8120a637048d13a5fe6c6f2',
                    artifact_name: 't721controller::T721Controller_v0',
                };

                const esquery = {
                    body: {
                        query: {
                            bool: {
                                must: {
                                    term: {
                                        group_id: group_id.toLowerCase(),
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
                                    owner:
                                        '034768a0-742d-474d-99d2-fc7591c7be3a',
                                    address:
                                        '0xfD1596c4f1289a004afcE04dF89602458d4E9DE5',
                                    created_at: '2020-02-29T21:12:23.512Z',
                                    description: 'Justice Concert',
                                    dates: [
                                        'a14c2cb6-921d-4bff-8ac5-e84c000011b5',
                                    ],
                                    avatar:
                                        'ece37bb0-176a-4746-9f70-981ee9bc7aa8',
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
                                        resale_begin:
                                            '2020-02-29T22:12:17.109Z',
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

                const dateId = 'a14c2cb6-921d-4bff-8ac5-e84c000011b5';
                const date = {
                    id: dateId,
                    categories: {
                        sale_begin: '2020-02-29T22:12:17.109Z',
                        category_name: 'vip_2',
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
                    context.datesServiceMock.search(
                        deepEqual({
                            id: dateId,
                        }),
                    ),
                ).thenResolve({
                    error: null,
                    response: [(date as any) as DateEntity],
                });

                await context.newCategoryEVMAntenna.convert(evmevent, append);

                expect(queries).toEqual([]);
                expect(rollbacks).toEqual([]);

                verify(
                    context.eventsServiceMock.searchElastic(deepEqual(esquery)),
                ).called();

                verify(
                    context.datesServiceMock.search(
                        deepEqual({
                            id: dateId,
                        }),
                    ),
                ).called();
            });

            it('should fail on date fetch error', async function() {
                const group_id =
                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18';
                const category_name = toB32('vip_1');

                const evmevent = {
                    return_values: `{"0":"${group_id}","1":"${category_name}","2":"2","group_id":"${group_id}","category_name":"${category_name}","idx":"2"}`,
                    address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                    signature:
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                    block_hash:
                        '0x2d87947a4e5fcee59988b3c3a1b9f520c7a4e351098eba87061a50ca2819e622',
                    block_number: 56,
                    raw_topics: [
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                        '0x49f172881d28e32dc61815945d1d4c22f9966d38ce20f6aaf1379586a0581a41',
                        '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                        '0x0000000000000000000000000000000000000000000000000000000000000002',
                    ],
                    transaction_index: 0,
                    event: 'NewCategory',
                    raw_data: '0x',
                    log_index: 4,
                    transaction_hash:
                        '0x8664571b37c66d024d8c6784e3890b9fa0aa05e3e8120a637048d13a5fe6c6f2',
                    artifact_name: 't721controller::T721Controller_v0',
                };

                const esquery = {
                    body: {
                        query: {
                            bool: {
                                must: {
                                    term: {
                                        group_id: group_id.toLowerCase(),
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
                                    owner:
                                        '034768a0-742d-474d-99d2-fc7591c7be3a',
                                    address:
                                        '0xfD1596c4f1289a004afcE04dF89602458d4E9DE5',
                                    created_at: '2020-02-29T21:12:23.512Z',
                                    description: 'Justice Concert',
                                    dates: [
                                        'a14c2cb6-921d-4bff-8ac5-e84c000011b5',
                                    ],
                                    avatar:
                                        'ece37bb0-176a-4746-9f70-981ee9bc7aa8',
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
                                        resale_begin:
                                            '2020-02-29T22:12:17.109Z',
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

                const dateId = 'a14c2cb6-921d-4bff-8ac5-e84c000011b5';
                const date = {
                    id: dateId,
                    categories: {
                        sale_begin: '2020-02-29T22:12:17.109Z',
                        category_name: 'vip_1',
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
                    context.datesServiceMock.search(
                        deepEqual({
                            id: dateId,
                        }),
                    ),
                ).thenResolve({
                    error: 'unexpected_error',
                    response: null,
                });

                await expect(
                    context.newCategoryEVMAntenna.convert(evmevent, append),
                ).rejects.toMatchObject(
                    new Error(
                        `NewCategoryT721CEVMAntenna::convert | error while fetching dates: unexpected_error`,
                    ),
                );

                expect(queries).toEqual([]);
                expect(rollbacks).toEqual([]);

                verify(
                    context.eventsServiceMock.searchElastic(deepEqual(esquery)),
                ).called();

                verify(
                    context.datesServiceMock.search(
                        deepEqual({
                            id: dateId,
                        }),
                    ),
                ).called();
            });

            it('should fail on forward query creation', async function() {
                const group_id =
                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18';
                const category_name = toB32('vip_1');

                const evmevent = {
                    return_values: `{"0":"${group_id}","1":"${category_name}","2":"2","group_id":"${group_id}","category_name":"${category_name}","idx":"2"}`,
                    address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                    signature:
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                    block_hash:
                        '0x2d87947a4e5fcee59988b3c3a1b9f520c7a4e351098eba87061a50ca2819e622',
                    block_number: 56,
                    raw_topics: [
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                        '0x49f172881d28e32dc61815945d1d4c22f9966d38ce20f6aaf1379586a0581a41',
                        '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                        '0x0000000000000000000000000000000000000000000000000000000000000002',
                    ],
                    transaction_index: 0,
                    event: 'NewCategory',
                    raw_data: '0x',
                    log_index: 4,
                    transaction_hash:
                        '0x8664571b37c66d024d8c6784e3890b9fa0aa05e3e8120a637048d13a5fe6c6f2',
                    artifact_name: 't721controller::T721Controller_v0',
                };

                const esquery = {
                    body: {
                        query: {
                            bool: {
                                must: {
                                    term: {
                                        group_id: group_id.toLowerCase(),
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
                                    owner:
                                        '034768a0-742d-474d-99d2-fc7591c7be3a',
                                    address:
                                        '0xfD1596c4f1289a004afcE04dF89602458d4E9DE5',
                                    created_at: '2020-02-29T21:12:23.512Z',
                                    description: 'Justice Concert',
                                    dates: [
                                        'a14c2cb6-921d-4bff-8ac5-e84c000011b5',
                                    ],
                                    avatar:
                                        'ece37bb0-176a-4746-9f70-981ee9bc7aa8',
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
                                        resale_begin:
                                            '2020-02-29T22:12:17.109Z',
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

                const dateId = 'a14c2cb6-921d-4bff-8ac5-e84c000011b5';
                const date = {
                    id: dateId,
                    categories: {
                        sale_begin: '2020-02-29T22:12:17.109Z',
                        category_name: 'vip_1',
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
                    context.datesServiceMock.search(
                        deepEqual({
                            id: dateId,
                        }),
                    ),
                ).thenResolve({
                    error: null,
                    response: [(date as any) as DateEntity],
                });

                when(
                    context.datesServiceMock.dryUpdate(
                        deepEqual({
                            id: dateId,
                        }),
                        deepEqual({
                            categories: [
                                ({
                                    group_id: group_id,
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_1',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'deployed',
                                } as any) as Category,
                            ],
                        }),
                    ),
                ).thenResolve({
                    error: 'unexpected_error',
                    response: null,
                });

                await expect(
                    context.newCategoryEVMAntenna.convert(evmevent, append),
                ).rejects.toMatchObject(
                    new Error(
                        `NewCategoryT721CEVMAntenna::convert | error while generating dry date category update: forward_update_query_building_error`,
                    ),
                );

                expect(queries).toEqual([]);
                expect(rollbacks).toEqual([]);

                verify(
                    context.eventsServiceMock.searchElastic(deepEqual(esquery)),
                ).called();

                verify(
                    context.datesServiceMock.search(
                        deepEqual({
                            id: dateId,
                        }),
                    ),
                ).called();

                verify(
                    context.datesServiceMock.dryUpdate(
                        deepEqual({
                            id: dateId,
                        }),
                        deepEqual({
                            categories: [
                                ({
                                    group_id: group_id,
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_1',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'deployed',
                                } as any) as Category,
                            ],
                        }),
                    ),
                ).called();
            });

            it('should fail on rollback query creation', async function() {
                const group_id =
                    '0x30efb335d55089d4eb0227ca1c8b444cace9cbae9c064fe5328ac8bd4ecade18';
                const category_name = toB32('vip_1');

                const evmevent = {
                    return_values: `{"0":"${group_id}","1":"${category_name}","2":"2","group_id":"${group_id}","category_name":"${category_name}","idx":"2"}`,
                    address: '0x4B2Ef35de91D5e4f2941B8A9B0B9E35554f0D8a8',
                    signature:
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                    block_hash:
                        '0x2d87947a4e5fcee59988b3c3a1b9f520c7a4e351098eba87061a50ca2819e622',
                    block_number: 56,
                    raw_topics: [
                        '0xd0e057b43905eaf3cc49120dc1c11364c1c42a6570963563ebe52f003a8490b0',
                        '0x49f172881d28e32dc61815945d1d4c22f9966d38ce20f6aaf1379586a0581a41',
                        '0x726567756c61725f315f30000000000000000000000000000000000000000000',
                        '0x0000000000000000000000000000000000000000000000000000000000000002',
                    ],
                    transaction_index: 0,
                    event: 'NewCategory',
                    raw_data: '0x',
                    log_index: 4,
                    transaction_hash:
                        '0x8664571b37c66d024d8c6784e3890b9fa0aa05e3e8120a637048d13a5fe6c6f2',
                    artifact_name: 't721controller::T721Controller_v0',
                };

                const esquery = {
                    body: {
                        query: {
                            bool: {
                                must: {
                                    term: {
                                        group_id: group_id.toLowerCase(),
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
                                    owner:
                                        '034768a0-742d-474d-99d2-fc7591c7be3a',
                                    address:
                                        '0xfD1596c4f1289a004afcE04dF89602458d4E9DE5',
                                    created_at: '2020-02-29T21:12:23.512Z',
                                    description: 'Justice Concert',
                                    dates: [
                                        'a14c2cb6-921d-4bff-8ac5-e84c000011b5',
                                    ],
                                    avatar:
                                        'ece37bb0-176a-4746-9f70-981ee9bc7aa8',
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
                                        resale_begin:
                                            '2020-02-29T22:12:17.109Z',
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

                const dateId = 'a14c2cb6-921d-4bff-8ac5-e84c000011b5';
                const date = {
                    id: dateId,
                    categories: {
                        sale_begin: '2020-02-29T22:12:17.109Z',
                        category_name: 'vip_1',
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
                    context.datesServiceMock.search(
                        deepEqual({
                            id: dateId,
                        }),
                    ),
                ).thenResolve({
                    error: null,
                    response: [(date as any) as DateEntity],
                });

                when(
                    context.datesServiceMock.dryUpdate(
                        deepEqual({
                            id: dateId,
                        }),
                        deepEqual({
                            categories: [
                                ({
                                    group_id: group_id,
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_1',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'deployed',
                                } as any) as Category,
                            ],
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
                    context.datesServiceMock.dryUpdate(
                        deepEqual({
                            id: dateId,
                        }),
                        deepEqual({
                            categories: [
                                ({
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_1',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'preview',
                                } as any) as Category,
                            ],
                        }),
                    ),
                ).thenResolve({
                    error: 'unexpected_error',
                    response: null,
                });

                await expect(
                    context.newCategoryEVMAntenna.convert(evmevent, append),
                ).rejects.toMatchObject(
                    new Error(
                        `NewCategoryT721CEVMAntenna::convert | error while generating dry date category update: rollback_update_query_building_error`,
                    ),
                );

                expect(queries).toEqual([]);
                expect(rollbacks).toEqual([]);

                verify(
                    context.eventsServiceMock.searchElastic(deepEqual(esquery)),
                ).called();

                verify(
                    context.datesServiceMock.search(
                        deepEqual({
                            id: dateId,
                        }),
                    ),
                ).called();

                verify(
                    context.datesServiceMock.dryUpdate(
                        deepEqual({
                            id: dateId,
                        }),
                        deepEqual({
                            categories: [
                                ({
                                    group_id: group_id,
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_1',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'deployed',
                                } as any) as Category,
                            ],
                        }),
                    ),
                ).called();

                verify(
                    context.datesServiceMock.dryUpdate(
                        deepEqual({
                            id: dateId,
                        }),
                        deepEqual({
                            categories: [
                                ({
                                    sale_begin: '2020-02-29T22:12:17.109Z',
                                    category_name: 'vip_1',
                                    resale_begin: '2020-02-29T22:12:17.109Z',
                                    scope: 'ticket721_0',
                                    sale_end: '2020-03-01T20:12:17.109Z',
                                    resale_end: '2020-03-01T20:12:17.109Z',
                                    prices: [
                                        {
                                            currency: 'T721Token',
                                            log_value: 6.643856189774724,
                                            value: '100',
                                        },
                                    ],
                                    category_index: 0,
                                    seats: 100,
                                    status: 'preview',
                                } as any) as Category,
                            ],
                        }),
                    ),
                ).called();
            });
        });
    });
});
