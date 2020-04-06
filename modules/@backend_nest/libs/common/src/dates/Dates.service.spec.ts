import { DatesRepository } from '@lib/common/dates/Dates.repository';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { DatesService } from '@lib/common/dates/Dates.service';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';

class DateEntityMock {
    public _properties = null;

    search(options: EsSearchOptionsStatic, callback?: (err: any, ret: any) => void): void {
        return;
    }
}

describe('Dates Service', function() {
    const context: {
        datesService: DatesService;
        datesRepositoryMock: DatesRepository;
        dateEntityMock: DateEntityMock;
        categoriesServiceMock: CategoriesService;
    } = {
        datesService: null,
        datesRepositoryMock: null,
        dateEntityMock: null,
        categoriesServiceMock: null,
    };

    beforeEach(async function() {
        context.dateEntityMock = mock(DateEntityMock);
        context.datesRepositoryMock = mock(DatesRepository);
        when(context.dateEntityMock._properties).thenReturn({
            schema: {
                fields: {},
            },
        });
        context.categoriesServiceMock = mock(CategoriesService);

        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: getModelToken(DateEntity),
                    useValue: instance(context.dateEntityMock),
                },
                {
                    provide: DatesRepository,
                    useValue: instance(context.datesRepositoryMock),
                },
                {
                    provide: CategoriesService,
                    useValue: instance(context.categoriesServiceMock),
                },
                DatesService,
            ],
        }).compile();

        context.datesService = app.get<DatesService>(DatesService);
    });

    describe('bind', function() {
        it('should bind date to event entity', async function() {
            const date: Partial<DateEntity> = {
                id: 'date_id',
                parent_id: null,
                parent_type: null,
            };

            const entityName = 'event';
            const entityId = 'event_id';

            const serviceSpy = spy(context.datesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [date as DateEntity],
            });

            when(
                serviceSpy.update(
                    deepEqual({
                        id: date.id,
                    }),
                    deepEqual({
                        parent_id: entityId,
                        parent_type: entityName,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            const res = await context.datesService.bind(date.id, entityName, entityId);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                id: date.id,
                parent_id: entityId,
                parent_type: entityName,
            });

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).called();

            verify(
                serviceSpy.update(
                    deepEqual({
                        id: date.id,
                    }),
                    deepEqual({
                        parent_id: entityId,
                        parent_type: entityName,
                    }),
                ),
            ).called();
        });

        it('should fail on date fetch error', async function() {
            const date: Partial<DateEntity> = {
                id: 'date_id',
                parent_id: null,
                parent_type: null,
            };

            const entityName = 'event';
            const entityId = 'event_id';

            const serviceSpy = spy(context.datesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.datesService.bind(date.id, entityName, entityId);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).called();
        });

        it('should fail on date not found', async function() {
            const date: Partial<DateEntity> = {
                id: 'date_id',
                parent_id: null,
                parent_type: null,
            };

            const entityName = 'event';
            const entityId = 'event_id';

            const serviceSpy = spy(context.datesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            const res = await context.datesService.bind(date.id, entityName, entityId);

            expect(res.error).toEqual('entity_not_found');
            expect(res.response).toEqual(null);

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).called();
        });

        it('should fail on already bound date', async function() {
            const date: Partial<DateEntity> = {
                id: 'date_id',
                parent_id: 'event_id',
                parent_type: 'event',
            };

            const entityName = 'event';
            const entityId = 'event_id';

            const serviceSpy = spy(context.datesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [date as DateEntity],
            });

            const res = await context.datesService.bind(date.id, entityName, entityId);

            expect(res.error).toEqual('entity_already_bound');
            expect(res.response).toEqual(null);

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).called();
        });

        it('should fail on update fail', async function() {
            const date: Partial<DateEntity> = {
                id: 'date_id',
                parent_id: null,
                parent_type: null,
            };

            const entityName = 'event';
            const entityId = 'event_id';

            const serviceSpy = spy(context.datesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [date as DateEntity],
            });

            when(
                serviceSpy.update(
                    deepEqual({
                        id: date.id,
                    }),
                    deepEqual({
                        parent_id: entityId,
                        parent_type: entityName,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.datesService.bind(date.id, entityName, entityId);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).called();

            verify(
                serviceSpy.update(
                    deepEqual({
                        id: date.id,
                    }),
                    deepEqual({
                        parent_id: entityId,
                        parent_type: entityName,
                    }),
                ),
            ).called();
        });
    });

    describe('isBound', function() {
        it('should return true on bound entity', function() {
            const date: Partial<DateEntity> = {
                id: 'date_id',
                parent_id: 'event_id',
                parent_type: 'event',
            };

            expect(context.datesService.isBound(date as DateEntity)).toBeTruthy();
        });

        it('should return false on unbound entity', function() {
            const date: Partial<DateEntity> = {
                id: 'date_id',
                parent_id: null,
                parent_type: null,
            };

            expect(context.datesService.isBound(date as DateEntity)).toBeFalsy();
        });
    });

    describe('unbind', function() {
        it('should unbind already bound entity', async function() {
            const date: Partial<DateEntity> = {
                id: 'date_id',
                parent_id: 'event_id',
                parent_type: 'event',
            };

            const serviceSpy = spy(context.datesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [date as DateEntity],
            });

            when(
                serviceSpy.update(
                    deepEqual({
                        id: date.id,
                    }),
                    deepEqual({
                        parent_type: null,
                        parent_id: null,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            const res = await context.datesService.unbind(date.id);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                id: date.id,
                parent_id: null,
                parent_type: null,
            });

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).called();

            verify(
                serviceSpy.update(
                    deepEqual({
                        id: date.id,
                    }),
                    deepEqual({
                        parent_type: null,
                        parent_id: null,
                    }),
                ),
            ).called();
        });

        it('should fail on date fetch error', async function() {
            const date: Partial<DateEntity> = {
                id: 'date_id',
                parent_id: 'event_id',
                parent_type: 'event',
            };

            const serviceSpy = spy(context.datesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.datesService.unbind(date.id);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).called();
        });

        it('should fail on date not found', async function() {
            const date: Partial<DateEntity> = {
                id: 'date_id',
                parent_id: 'event_id',
                parent_type: 'event',
            };

            const serviceSpy = spy(context.datesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            const res = await context.datesService.unbind(date.id);

            expect(res.error).toEqual('entity_not_found');
            expect(res.response).toEqual(null);

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).called();
        });

        it('should fail on entity not bound', async function() {
            const date: Partial<DateEntity> = {
                id: 'date_id',
                parent_id: null,
                parent_type: null,
            };

            const serviceSpy = spy(context.datesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [date as DateEntity],
            });

            const res = await context.datesService.unbind(date.id);

            expect(res.error).toEqual('entity_not_bound');
            expect(res.response).toEqual(null);

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).called();
        });

        it('should fail on update fail', async function() {
            const date: Partial<DateEntity> = {
                id: 'date_id',
                parent_id: 'event_id',
                parent_type: 'event',
            };

            const serviceSpy = spy(context.datesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [date as DateEntity],
            });

            when(
                serviceSpy.update(
                    deepEqual({
                        id: date.id,
                    }),
                    deepEqual({
                        parent_type: null,
                        parent_id: null,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.datesService.unbind(date.id);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: date.id,
                    }),
                ),
            ).called();

            verify(
                serviceSpy.update(
                    deepEqual({
                        id: date.id,
                    }),
                    deepEqual({
                        parent_type: null,
                        parent_id: null,
                    }),
                ),
            ).called();
        });
    });

    describe('createDateWithCategories', function() {
        it('should create a new date with additional categories', async function() {
            const date: Partial<DateEntity> = {
                group_id: 'abcd',
                metadata: {
                    name: 'Date',
                    description: 'This is a date',
                    tags: ['hmm'],
                    avatar: 'abcd',
                },
                location: {
                    location: {
                        lon: 1,
                        lat: 2,
                    },
                    location_label: 'Chez Moi',
                    assigned_city: 1,
                },
                timestamps: {
                    event_begin: new Date(),
                    event_end: new Date(),
                },
            };

            const categories: Partial<CategoryEntity>[] = [
                {
                    group_id: 'abcd',
                    category_name: 'cat',
                    display_name: 'Category',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    scope: 'ticket721_0',
                    prices: [],
                    seats: 100,
                },
                {
                    group_id: 'abcd',
                    category_name: 'vip',
                    display_name: 'VIP',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    scope: 'ticket721_0',
                    prices: [],
                    seats: 100,
                },
            ];

            const serviceSpy = spy(context.datesService);

            when(context.categoriesServiceMock.create(deepEqual(categories[0]))).thenResolve({
                error: null,
                response: {
                    ...(categories[0] as CategoryEntity),
                    id: 'cat0',
                },
            });

            when(context.categoriesServiceMock.create(deepEqual(categories[1]))).thenResolve({
                error: null,
                response: {
                    ...(categories[1] as CategoryEntity),
                    id: 'cat1',
                },
            });

            when(
                serviceSpy.create(
                    deepEqual({
                        ...date,
                        categories: ['cat0', 'cat1'],
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    ...date,
                    categories: ['cat0', 'cat1'],
                } as DateEntity,
            });

            const res = await context.datesService.createDateWithCategories(date, categories);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual([
                {
                    ...date,
                    categories: ['cat0', 'cat1'],
                },
                [
                    {
                        ...(categories[0] as CategoryEntity),
                        id: 'cat0',
                    },
                    {
                        ...(categories[1] as CategoryEntity),
                        id: 'cat1',
                    },
                ],
            ]);

            verify(context.categoriesServiceMock.create(deepEqual(categories[0]))).called();

            verify(context.categoriesServiceMock.create(deepEqual(categories[1]))).called();

            verify(
                serviceSpy.create(
                    deepEqual({
                        ...date,
                        categories: ['cat0', 'cat1'],
                    }),
                ),
            ).called();
        });

        it('should fail on invalid group id', async function() {
            const date: Partial<DateEntity> = {
                group_id: 'abcd',
                metadata: {
                    name: 'Date',
                    description: 'This is a date',
                    tags: ['hmm'],
                    avatar: 'abcd',
                },
                location: {
                    location: {
                        lon: 1,
                        lat: 2,
                    },
                    location_label: 'Chez Moi',
                    assigned_city: 1,
                },
                timestamps: {
                    event_begin: new Date(),
                    event_end: new Date(),
                },
            };

            const categories: Partial<CategoryEntity>[] = [
                {
                    group_id: 'abcdef',
                    category_name: 'cat',
                    display_name: 'Category',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    scope: 'ticket721_0',
                    prices: [],
                    seats: 100,
                },
                {
                    group_id: 'abcd',
                    category_name: 'vip',
                    display_name: 'VIP',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    scope: 'ticket721_0',
                    prices: [],
                    seats: 100,
                },
            ];

            const res = await context.datesService.createDateWithCategories(date, categories);

            expect(res.error).toEqual('invalid_category_group_id');
            expect(res.response).toEqual(null);
        });

        it('should fail on category creation error', async function() {
            const date: Partial<DateEntity> = {
                group_id: 'abcd',
                metadata: {
                    name: 'Date',
                    description: 'This is a date',
                    tags: ['hmm'],
                    avatar: 'abcd',
                },
                location: {
                    location: {
                        lon: 1,
                        lat: 2,
                    },
                    location_label: 'Chez Moi',
                    assigned_city: 1,
                },
                timestamps: {
                    event_begin: new Date(),
                    event_end: new Date(),
                },
            };

            const categories: Partial<CategoryEntity>[] = [
                {
                    group_id: 'abcd',
                    category_name: 'cat',
                    display_name: 'Category',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    scope: 'ticket721_0',
                    prices: [],
                    seats: 100,
                },
                {
                    group_id: 'abcd',
                    category_name: 'vip',
                    display_name: 'VIP',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    scope: 'ticket721_0',
                    prices: [],
                    seats: 100,
                },
            ];

            when(context.categoriesServiceMock.create(deepEqual(categories[0]))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.datesService.createDateWithCategories(date, categories);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(context.categoriesServiceMock.create(deepEqual(categories[0]))).called();
        });

        it('should fail on date creation error', async function() {
            const date: Partial<DateEntity> = {
                group_id: 'abcd',
                metadata: {
                    name: 'Date',
                    description: 'This is a date',
                    tags: ['hmm'],
                    avatar: 'abcd',
                },
                location: {
                    location: {
                        lon: 1,
                        lat: 2,
                    },
                    location_label: 'Chez Moi',
                    assigned_city: 1,
                },
                timestamps: {
                    event_begin: new Date(),
                    event_end: new Date(),
                },
            };

            const categories: Partial<CategoryEntity>[] = [
                {
                    group_id: 'abcd',
                    category_name: 'cat',
                    display_name: 'Category',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    scope: 'ticket721_0',
                    prices: [],
                    seats: 100,
                },
                {
                    group_id: 'abcd',
                    category_name: 'vip',
                    display_name: 'VIP',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    scope: 'ticket721_0',
                    prices: [],
                    seats: 100,
                },
            ];

            const serviceSpy = spy(context.datesService);

            when(context.categoriesServiceMock.create(deepEqual(categories[0]))).thenResolve({
                error: null,
                response: {
                    ...(categories[0] as CategoryEntity),
                    id: 'cat0',
                },
            });

            when(context.categoriesServiceMock.create(deepEqual(categories[1]))).thenResolve({
                error: null,
                response: {
                    ...(categories[1] as CategoryEntity),
                    id: 'cat1',
                },
            });

            when(
                serviceSpy.create(
                    deepEqual({
                        ...date,
                        categories: ['cat0', 'cat1'],
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.datesService.createDateWithCategories(date, categories);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(context.categoriesServiceMock.create(deepEqual(categories[0]))).called();

            verify(context.categoriesServiceMock.create(deepEqual(categories[1]))).called();

            verify(
                serviceSpy.create(
                    deepEqual({
                        ...date,
                        categories: ['cat0', 'cat1'],
                    }),
                ),
            ).called();
        });
    });
});
