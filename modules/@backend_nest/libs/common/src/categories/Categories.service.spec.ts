import { CategoriesRepository } from '@lib/common/categories/Categories.repository';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';

class CategoryEntityMock {
    public _properties = null;

    search(options: EsSearchOptionsStatic, callback?: (err: any, ret: any) => void): void {
        return;
    }
}

describe('Categories Service', function() {
    const context: {
        categoriesService: CategoriesService;
        categoriesRepositoryMock: CategoriesRepository;
        categoryEntityMock: CategoryEntityMock;
    } = {
        categoriesService: null,
        categoriesRepositoryMock: null,
        categoryEntityMock: null,
    };

    beforeEach(async function() {
        context.categoryEntityMock = mock(CategoryEntityMock);
        context.categoriesRepositoryMock = mock(CategoriesRepository);
        when(context.categoryEntityMock._properties).thenReturn({
            schema: {
                fields: {},
            },
        });

        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: getModelToken(CategoryEntity),
                    useValue: instance(context.categoryEntityMock),
                },
                {
                    provide: CategoriesRepository,
                    useValue: instance(context.categoriesRepositoryMock),
                },
                CategoriesService,
            ],
        }).compile();

        context.categoriesService = app.get<CategoriesService>(CategoriesService);
    });

    describe('bind', function() {
        it('should bind category to event entity', async function() {
            const category: Partial<CategoryEntity> = {
                id: 'category_id',
                parent_id: null,
                parent_type: null,
            };

            const entityName = 'event';
            const entityId = 'event_id';

            const serviceSpy = spy(context.categoriesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [category as CategoryEntity],
            });

            when(
                serviceSpy.update(
                    deepEqual({
                        id: category.id,
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

            const res = await context.categoriesService.bind(category.id, entityName, entityId);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                id: category.id,
                parent_id: entityId,
                parent_type: entityName,
            });

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).called();

            verify(
                serviceSpy.update(
                    deepEqual({
                        id: category.id,
                    }),
                    deepEqual({
                        parent_id: entityId,
                        parent_type: entityName,
                    }),
                ),
            ).called();
        });

        it('should fail on category fetch error', async function() {
            const category: Partial<CategoryEntity> = {
                id: 'category_id',
                parent_id: null,
                parent_type: null,
            };

            const entityName = 'event';
            const entityId = 'event_id';

            const serviceSpy = spy(context.categoriesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.categoriesService.bind(category.id, entityName, entityId);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).called();
        });

        it('should fail on category not found', async function() {
            const category: Partial<CategoryEntity> = {
                id: 'category_id',
                parent_id: null,
                parent_type: null,
            };

            const entityName = 'event';
            const entityId = 'event_id';

            const serviceSpy = spy(context.categoriesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            const res = await context.categoriesService.bind(category.id, entityName, entityId);

            expect(res.error).toEqual('entity_not_found');
            expect(res.response).toEqual(null);

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).called();
        });

        it('should fail on already bound category', async function() {
            const category: Partial<CategoryEntity> = {
                id: 'category_id',
                parent_id: 'event_id',
                parent_type: 'event',
            };

            const entityName = 'event';
            const entityId = 'event_id';

            const serviceSpy = spy(context.categoriesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [category as CategoryEntity],
            });

            const res = await context.categoriesService.bind(category.id, entityName, entityId);

            expect(res.error).toEqual('entity_already_bound');
            expect(res.response).toEqual(null);

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).called();
        });

        it('should fail on update fail', async function() {
            const category: Partial<CategoryEntity> = {
                id: 'category_id',
                parent_id: null,
                parent_type: null,
            };

            const entityName = 'event';
            const entityId = 'event_id';

            const serviceSpy = spy(context.categoriesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [category as CategoryEntity],
            });

            when(
                serviceSpy.update(
                    deepEqual({
                        id: category.id,
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

            const res = await context.categoriesService.bind(category.id, entityName, entityId);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).called();

            verify(
                serviceSpy.update(
                    deepEqual({
                        id: category.id,
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
            const category: Partial<CategoryEntity> = {
                id: 'category_id',
                parent_id: 'event_id',
                parent_type: 'event',
            };

            expect(context.categoriesService.isBound(category as CategoryEntity)).toBeTruthy();
        });

        it('should return false on unbound entity', function() {
            const category: Partial<CategoryEntity> = {
                id: 'category_id',
                parent_id: null,
                parent_type: null,
            };

            expect(context.categoriesService.isBound(category as CategoryEntity)).toBeFalsy();
        });
    });

    describe('unbind', function() {
        it('should unbind already bound entity', async function() {
            const category: Partial<CategoryEntity> = {
                id: 'category_id',
                parent_id: 'event_id',
                parent_type: 'event',
            };

            const serviceSpy = spy(context.categoriesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [category as CategoryEntity],
            });

            when(
                serviceSpy.update(
                    deepEqual({
                        id: category.id,
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

            const res = await context.categoriesService.unbind(category.id);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                id: category.id,
                parent_id: null,
                parent_type: null,
            });

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).called();

            verify(
                serviceSpy.update(
                    deepEqual({
                        id: category.id,
                    }),
                    deepEqual({
                        parent_type: null,
                        parent_id: null,
                    }),
                ),
            ).called();
        });

        it('should fail on category fetch error', async function() {
            const category: Partial<CategoryEntity> = {
                id: 'category_id',
                parent_id: 'event_id',
                parent_type: 'event',
            };

            const serviceSpy = spy(context.categoriesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.categoriesService.unbind(category.id);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).called();
        });

        it('should fail on category not found', async function() {
            const category: Partial<CategoryEntity> = {
                id: 'category_id',
                parent_id: 'event_id',
                parent_type: 'event',
            };

            const serviceSpy = spy(context.categoriesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            const res = await context.categoriesService.unbind(category.id);

            expect(res.error).toEqual('entity_not_found');
            expect(res.response).toEqual(null);

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).called();
        });

        it('should fail on entity not bound', async function() {
            const category: Partial<CategoryEntity> = {
                id: 'category_id',
                parent_id: null,
                parent_type: null,
            };

            const serviceSpy = spy(context.categoriesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [category as CategoryEntity],
            });

            const res = await context.categoriesService.unbind(category.id);

            expect(res.error).toEqual('entity_not_bound');
            expect(res.response).toEqual(null);

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).called();
        });

        it('should fail on update fail', async function() {
            const category: Partial<CategoryEntity> = {
                id: 'category_id',
                parent_id: 'event_id',
                parent_type: 'event',
            };

            const serviceSpy = spy(context.categoriesService);

            when(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [category as CategoryEntity],
            });

            when(
                serviceSpy.update(
                    deepEqual({
                        id: category.id,
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

            const res = await context.categoriesService.unbind(category.id);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                serviceSpy.search(
                    deepEqual({
                        id: category.id,
                    }),
                ),
            ).called();

            verify(
                serviceSpy.update(
                    deepEqual({
                        id: category.id,
                    }),
                    deepEqual({
                        parent_type: null,
                        parent_id: null,
                    }),
                ),
            ).called();
        });
    });
});
