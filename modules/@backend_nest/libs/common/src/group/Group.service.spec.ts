import { EventsService } from '@lib/common/events/Events.service';
import { DatesService } from '@lib/common/dates/Dates.service';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { GroupService } from '@lib/common/group/Group.service';
import { deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { ESSearchReturn } from '@lib/common/utils/ESSearchReturn.type';

describe('Group Service', function() {
    const context: {
        groupService: GroupService;
        eventsServiceMock: EventsService;
        datesServiceMock: DatesService;
        categoriesServiceMock: CategoriesService;
    } = {
        groupService: null,
        eventsServiceMock: null,
        datesServiceMock: null,
        categoriesServiceMock: null,
    };

    beforeEach(async function() {
        context.eventsServiceMock = mock(EventsService);
        context.datesServiceMock = mock(DatesService);
        context.categoriesServiceMock = mock(CategoriesService);

        const app: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: EventsService,
                    useValue: instance(context.eventsServiceMock),
                },
                {
                    provide: DatesService,
                    useValue: instance(context.datesServiceMock),
                },
                {
                    provide: CategoriesService,
                    useValue: instance(context.categoriesServiceMock),
                },
                GroupService,
            ],
        }).compile();

        context.groupService = app.get<GroupService>(GroupService);
    });

    describe('getCategoryControllerFields', function() {
        it('should properly recover address from event', async function() {
            // DECLARE
            const eventAddress = '0x0EB246b377E6E267EBC36b2cE5730b5cc3414c8a';
            const eventId = 'event_id';
            const dateId = 'date_id';
            const categoryId = 'category_id';
            const event: Partial<EventEntity> = {
                id: eventId,
                address: eventAddress,
            };
            const date: Partial<DateEntity> = {
                id: dateId,
                parent_id: eventId,
                parent_type: 'event',
            };
            const category: Partial<CategoryEntity> = {
                id: categoryId,
                parent_id: dateId,
                parent_type: 'date',
            };

            // MOCK
            when(
                context.datesServiceMock.search(
                    deepEqual({
                        id: dateId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [date as DateEntity],
            });
            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [event as EventEntity],
            });

            // TRIGGER
            const res = await context.groupService.getCategoryControllerFields<[string]>(category as CategoryEntity, [
                'address',
            ]);

            // CHECK RETURNs
            expect(res.error).toEqual(null);
            expect(res.response).toEqual([eventAddress]);

            // CHECK CALLS
            verify(
                context.datesServiceMock.search(
                    deepEqual({
                        id: dateId,
                    }),
                ),
            ).once();
            verify(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).once();
        });

        it('should properly recover address from global category', async function() {
            // DECLARE
            const eventAddress = '0x0EB246b377E6E267EBC36b2cE5730b5cc3414c8a';
            const eventId = 'event_id';
            const dateId = 'date_id';
            const categoryId = 'category_id';
            const event: Partial<EventEntity> = {
                id: eventId,
                address: eventAddress,
            };
            const category: Partial<CategoryEntity> = {
                id: categoryId,
                parent_id: eventId,
                parent_type: 'event',
            };

            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [event as EventEntity],
            });

            // TRIGGER
            const res = await context.groupService.getCategoryControllerFields<[string]>(category as CategoryEntity, [
                'address',
            ]);

            // CHECK RETURNs
            expect(res.error).toEqual(null);
            expect(res.response).toEqual([eventAddress]);

            // CHECK CALLS
            verify(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).once();
        });

        it('should fail on date error', async function() {
            // DECLARE
            const eventAddress = '0x0EB246b377E6E267EBC36b2cE5730b5cc3414c8a';
            const eventId = 'event_id';
            const dateId = 'date_id';
            const categoryId = 'category_id';
            const category: Partial<CategoryEntity> = {
                id: categoryId,
                parent_id: dateId,
                parent_type: 'date',
            };

            // MOCK
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

            // TRIGGER
            const res = await context.groupService.getCategoryControllerFields<[string]>(category as CategoryEntity, [
                'address',
            ]);

            // CHECK RETURNs
            expect(res.error).toEqual('cannot_resolve_date');
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(
                context.datesServiceMock.search(
                    deepEqual({
                        id: dateId,
                    }),
                ),
            ).once();
        });

        it('should fail on date not found', async function() {
            // DECLARE
            const eventAddress = '0x0EB246b377E6E267EBC36b2cE5730b5cc3414c8a';
            const eventId = 'event_id';
            const dateId = 'date_id';
            const categoryId = 'category_id';
            const category: Partial<CategoryEntity> = {
                id: categoryId,
                parent_id: dateId,
                parent_type: 'date',
            };

            // MOCK
            when(
                context.datesServiceMock.search(
                    deepEqual({
                        id: dateId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            // TRIGGER
            const res = await context.groupService.getCategoryControllerFields<[string]>(category as CategoryEntity, [
                'address',
            ]);

            // CHECK RETURNs
            expect(res.error).toEqual('cannot_resolve_date');
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(
                context.datesServiceMock.search(
                    deepEqual({
                        id: dateId,
                    }),
                ),
            ).once();
        });

        it('should fail on event error', async function() {
            // DECLARE
            const eventAddress = '0x0EB246b377E6E267EBC36b2cE5730b5cc3414c8a';
            const eventId = 'event_id';
            const dateId = 'date_id';
            const categoryId = 'category_id';
            const event: Partial<EventEntity> = {
                id: eventId,
                address: eventAddress,
            };
            const date: Partial<DateEntity> = {
                id: dateId,
                parent_id: eventId,
                parent_type: 'event',
            };
            const category: Partial<CategoryEntity> = {
                id: categoryId,
                parent_id: dateId,
                parent_type: 'date',
            };

            // MOCK
            when(
                context.datesServiceMock.search(
                    deepEqual({
                        id: dateId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [date as DateEntity],
            });
            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // TRIGGER
            const res = await context.groupService.getCategoryControllerFields<[string]>(category as CategoryEntity, [
                'address',
            ]);

            // CHECK RETURNs
            expect(res.error).toEqual('cannot_resolve_event');
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(
                context.datesServiceMock.search(
                    deepEqual({
                        id: dateId,
                    }),
                ),
            ).once();
            verify(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).once();
        });

        it('should fail on event not found', async function() {
            // DECLARE
            const eventAddress = '0x0EB246b377E6E267EBC36b2cE5730b5cc3414c8a';
            const eventId = 'event_id';
            const dateId = 'date_id';
            const categoryId = 'category_id';
            const event: Partial<EventEntity> = {
                id: eventId,
                address: eventAddress,
            };
            const date: Partial<DateEntity> = {
                id: dateId,
                parent_id: eventId,
                parent_type: 'event',
            };
            const category: Partial<CategoryEntity> = {
                id: categoryId,
                parent_id: dateId,
                parent_type: 'date',
            };

            // MOCK
            when(
                context.datesServiceMock.search(
                    deepEqual({
                        id: dateId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [date as DateEntity],
            });
            when(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            // TRIGGER
            const res = await context.groupService.getCategoryControllerFields<[string]>(category as CategoryEntity, [
                'address',
            ]);

            // CHECK RETURNs
            expect(res.error).toEqual('cannot_resolve_event');
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(
                context.datesServiceMock.search(
                    deepEqual({
                        id: dateId,
                    }),
                ),
            ).once();
            verify(
                context.eventsServiceMock.search(
                    deepEqual({
                        id: eventId,
                    }),
                ),
            ).once();
        });
    });

    describe('getGroupIDControllerFields', function() {
        it('should properly fetch address of event from event id', async function() {
            // DECLARE
            const categoryId = 'category_id';
            const groupId = 'group_id';
            const categoryEntity: Partial<CategoryEntity> = {
                id: categoryId,
                group_id: groupId,
            };
            const spiedService = spy(context.groupService);
            const fields = ['address'];
            const result = ['0x0EB246b377E6E267EBC36b2cE5730b5cc3414c8a'];

            // MOCK
            when(
                context.categoriesServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: [
                                        {
                                            term: {
                                                group_id: groupId,
                                            },
                                        },
                                        {
                                            term: {
                                                id: categoryId,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    hits: {
                        total: 1,
                        hits: [
                            {
                                _source: categoryEntity,
                            },
                        ],
                    },
                } as ESSearchReturn<CategoryEntity>,
            });
            when(
                spiedService.getCategoryControllerFields(
                    deepEqual(categoryEntity as CategoryEntity),
                    deepEqual(fields),
                ),
            ).thenResolve({
                error: null,
                response: result,
            });

            // TRIGGER
            const res = await context.groupService.getGroupIDControllerFields(groupId, categoryId, fields);

            // CHECK RETURNs
            expect(res.error).toEqual(null);
            expect(res.response).toEqual(result);

            // CHECK CALLS
            verify(
                context.categoriesServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: [
                                        {
                                            term: {
                                                group_id: groupId,
                                            },
                                        },
                                        {
                                            term: {
                                                id: categoryId,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).once();
            verify(
                spiedService.getCategoryControllerFields(
                    deepEqual(categoryEntity as CategoryEntity),
                    deepEqual(fields),
                ),
            ).once();
        });

        it('should fail on query error', async function() {
            // DECLARE
            const categoryId = 'category_id';
            const groupId = 'group_id';
            const categoryEntity: Partial<CategoryEntity> = {
                id: categoryId,
                group_id: groupId,
            };
            const spiedService = spy(context.groupService);
            const fields = ['address'];
            const result = ['0x0EB246b377E6E267EBC36b2cE5730b5cc3414c8a'];

            // MOCK
            when(
                context.categoriesServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: [
                                        {
                                            term: {
                                                group_id: groupId,
                                            },
                                        },
                                        {
                                            term: {
                                                id: categoryId,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // TRIGGER
            const res = await context.groupService.getGroupIDControllerFields(groupId, categoryId, fields);

            // CHECK RETURNs
            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(
                context.categoriesServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: [
                                        {
                                            term: {
                                                group_id: groupId,
                                            },
                                        },
                                        {
                                            term: {
                                                id: categoryId,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).once();
        });

        it('should fail on empty query', async function() {
            // DECLARE
            const categoryId = 'category_id';
            const groupId = 'group_id';
            const categoryEntity: Partial<CategoryEntity> = {
                id: categoryId,
                group_id: groupId,
            };
            const spiedService = spy(context.groupService);
            const fields = ['address'];
            const result = ['0x0EB246b377E6E267EBC36b2cE5730b5cc3414c8a'];

            // MOCK
            when(
                context.categoriesServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: [
                                        {
                                            term: {
                                                group_id: groupId,
                                            },
                                        },
                                        {
                                            term: {
                                                id: categoryId,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    hits: {
                        total: 0,
                        hits: [],
                    },
                } as ESSearchReturn<CategoryEntity>,
            });

            // TRIGGER
            const res = await context.groupService.getGroupIDControllerFields(groupId, categoryId, fields);

            // CHECK RETURNs
            expect(res.error).toEqual('no_categories_for_group_id');
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(
                context.categoriesServiceMock.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: [
                                        {
                                            term: {
                                                group_id: groupId,
                                            },
                                        },
                                        {
                                            term: {
                                                id: categoryId,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).once();
        });
    });
});
