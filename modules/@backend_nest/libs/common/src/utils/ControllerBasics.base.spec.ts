import { anything, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { Repository } from '@iaminfinity/express-cassandra';
import { Boundable } from '@lib/common/utils/Boundable.type';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { RightsService } from '@lib/common/rights/Rights.service';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { RightEntity } from '@lib/common/rights/entities/Right.entity';
import { ESSearchReturn } from '@lib/common/utils/ESSearchReturn.type';
import { EventsService } from '@lib/common/events/Events.service';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';

class FakeEntity {
    id: string;
    name: string;
}

const context: {
    controllerBasics: ControllerBasics<FakeEntity>;
    CRUDServiceMock: CRUDExtension<Repository<FakeEntity>, FakeEntity>;
} = {
    controllerBasics: null,
    CRUDServiceMock: null,
};

const throwWith = async (promise: Promise<any>, code: StatusCodes, message: string): Promise<void> => {
    await expect(promise).rejects.toMatchObject({});
};

const syncThrowWith = async (call: () => void): Promise<void> => {
    expect(call).toThrow();
};

describe('Controller Basics', function() {
    beforeEach(async function() {
        context.controllerBasics = new ControllerBasics();
        context.CRUDServiceMock = mock(CRUDExtension);
    });

    describe('_bind', function() {
        it('should properly bind', async function() {
            const boundable: Boundable<CategoryEntity> = mock(CategoriesService);

            const id = 'id';
            const entity = 'ent';
            const entityId = 'entid';

            when(boundable.bind(id, entity, entityId)).thenResolve({
                error: null,
                response: ('test' as any) as CategoryEntity,
            });

            const res = await context.controllerBasics._bind<CategoryEntity>(instance(boundable), id, entity, entityId);

            expect(res).toEqual('test');

            verify(boundable.bind(id, entity, entityId)).called();
        });

        it('should fail on bind error', async function() {
            const boundable: Boundable<CategoryEntity> = mock(CategoriesService);

            const id = 'id';
            const entity = 'ent';
            const entityId = 'entid';

            when(boundable.bind(id, entity, entityId)).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await throwWith(
                context.controllerBasics._bind<CategoryEntity>(instance(boundable), id, entity, entityId),
                StatusCodes.InternalServerError,
                'unexpected_error',
            );

            verify(boundable.bind(id, entity, entityId)).called();
        });
    });
    describe('_unbind', function() {
        it('shoud properly unbind', async function() {
            const boundable: Boundable<CategoryEntity> = mock(CategoriesService);

            const id = 'id';

            when(boundable.unbind(id)).thenResolve({
                error: null,
                response: ('test' as any) as CategoryEntity,
            });

            const res = await context.controllerBasics._unbind<CategoryEntity>(instance(boundable), id);

            expect(res).toEqual('test');

            verify(boundable.unbind(id)).called();
        });

        it('shoud fail on unbind error', async function() {
            const boundable: Boundable<CategoryEntity> = mock(CategoriesService);

            const id = 'id';

            when(boundable.unbind(id)).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await throwWith(
                context.controllerBasics._unbind<CategoryEntity>(instance(boundable), id),
                StatusCodes.InternalServerError,
                'unexpected_error',
            );

            verify(boundable.unbind(id)).called();
        });
    });
    describe('_crudCall', function() {
        it('should properly process crud response', async function() {
            const boundable: Boundable<CategoryEntity> & CRUDExtension<any, any> = mock(CategoriesService);

            const entity = {
                id: 'test',
            };

            when(boundable.create(deepEqual(entity))).thenResolve({
                error: null,
                response: 'test',
            });

            const res = await context.controllerBasics._crudCall<any>(
                instance(boundable).create(entity),
                StatusCodes.InternalServerError,
            );

            expect(res).toEqual('test');
        });

        it('should properly catch and handle error', async function() {
            const boundable: Boundable<CategoryEntity> & CRUDExtension<any, any> = mock(CategoriesService);

            const entity = {
                id: 'test',
            };

            when(boundable.create(deepEqual(entity))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await throwWith(
                context.controllerBasics._crudCall<any>(
                    instance(boundable).create(entity),
                    StatusCodes.InternalServerError,
                ),
                StatusCodes.InternalServerError,
                'unexpected_error',
            );
        });
    });
    describe('_servicaCall', function() {
        it('should properly process service response', async function() {
            const boundable: Boundable<CategoryEntity> & CRUDExtension<any, any> = mock(CategoriesService);

            const id = 'id';
            const entity = 'ent';
            const entityId = 'entid';

            when(boundable.bind(id, entity, entityId)).thenResolve({
                error: null,
                response: ('test' as any) as CategoryEntity,
            });

            const res = await context.controllerBasics._serviceCall<any>(
                instance(boundable).bind(id, entity, entityId),
                StatusCodes.InternalServerError,
            );

            expect(res).toEqual('test');
        });

        it('should properly catch and handle error', async function() {
            const boundable: Boundable<CategoryEntity> & CRUDExtension<any, any> = mock(CategoriesService);

            const id = 'id';
            const entity = 'ent';
            const entityId = 'entid';

            when(boundable.bind(id, entity, entityId)).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await throwWith(
                context.controllerBasics._serviceCall<any>(
                    instance(boundable).bind(id, entity, entityId),
                    StatusCodes.InternalServerError,
                ),
                StatusCodes.InternalServerError,
                'unexpected_error',
            );
        });
    });
    describe('_searchRestricted', function() {
        it('should search on allowed entities only', async function() {
            const eventsServiceMock = mock(EventsService);
            const rightsServiceMock = mock(RightsService);
            const entityName = 'event';
            when(eventsServiceMock.name).thenReturn(entityName);
            const user = {
                id: 'user_id',
            } as UserDto;
            const rightsQuery = {
                body: {
                    size: 2147483647, // int max value
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        entity_type: entityName,
                                    },
                                },
                                {
                                    term: {
                                        grantee_id: user.id,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const right = {
                entity_type: entityName,
                grantee_id: user.id,
                entity_value: 'abcd',
            } as RightEntity;

            const entityQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                terms: {
                                    id: ['abcd'],
                                },
                            },
                        },
                    },
                },
            };

            const entity = {
                id: 'abcd',
            };

            when(rightsServiceMock.searchElastic(deepEqual(rightsQuery))).thenResolve({
                error: null,
                response: {
                    hits: {
                        hits: [
                            {
                                _source: right,
                            },
                        ],
                    },
                } as ESSearchReturn<any>,
            });

            const spiedService = spy(context.controllerBasics);

            when(
                spiedService._elasticGet(
                    anything(),
                    deepEqual({
                        id: {
                            $in: ['abcd'],
                        },
                    } as SortablePagedSearch),
                ),
            ).thenResolve([entity]);

            const res = await context.controllerBasics._searchRestricted(
                instance(eventsServiceMock),
                instance(rightsServiceMock),
                user,
                'id',
                {},
            );

            expect(res).toEqual([entity]);

            verify(rightsServiceMock.searchElastic(deepEqual(rightsQuery))).called();
            verify(
                spiedService._elasticGet(
                    anything(),
                    deepEqual({
                        id: {
                            $in: ['abcd'],
                        },
                    } as SortablePagedSearch),
                ),
            ).called();
        });

        it('should search on allowed entities only with custom query', async function() {
            const eventsServiceMock = mock(EventsService);
            const rightsServiceMock = mock(RightsService);
            const entityName = 'event';
            when(eventsServiceMock.name).thenReturn(entityName);
            const user = {
                id: 'user_id',
            } as UserDto;
            const rightsQuery = {
                body: {
                    size: 2147483647, // int max value
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        entity_type: entityName,
                                    },
                                },
                                {
                                    term: {
                                        grantee_id: user.id,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const right = {
                entity_type: entityName,
                grantee_id: user.id,
                entity_value: 'abcd',
            } as RightEntity;

            const entityQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                terms: {
                                    id: ['abcd'],
                                },
                            },
                        },
                    },
                },
            };

            const entity = {
                id: 'abcd',
            };

            when(rightsServiceMock.searchElastic(deepEqual(rightsQuery))).thenResolve({
                error: null,
                response: {
                    hits: {
                        hits: [
                            {
                                _source: right,
                            },
                        ],
                    },
                } as ESSearchReturn<any>,
            });

            const spiedService = spy(context.controllerBasics);

            when(
                spiedService._elasticGet(
                    anything(),
                    deepEqual({
                        id: {
                            $in: ['abcd'],
                        },
                    } as SortablePagedSearch),
                ),
            ).thenResolve([entity]);

            const res = await context.controllerBasics._searchRestricted(
                instance(eventsServiceMock),
                instance(rightsServiceMock),
                user,
                'id',
                {
                    id: {
                        $in: ['abcd'],
                    },
                } as SortablePagedSearch,
            );

            expect(res).toEqual([entity]);

            verify(rightsServiceMock.searchElastic(deepEqual(rightsQuery))).called();
            verify(
                spiedService._elasticGet(
                    anything(),
                    deepEqual({
                        id: {
                            $in: ['abcd'],
                        },
                    } as SortablePagedSearch),
                ),
            ).called();
        });

        it('should fail on rights query fail', async function() {
            const eventsServiceMock = mock(EventsService);
            const rightsServiceMock = mock(RightsService);
            const entityName = 'event';
            when(eventsServiceMock.name).thenReturn(entityName);
            const user = {
                id: 'user_id',
            } as UserDto;
            const rightsQuery = {
                body: {
                    size: 2147483647, // int max value
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        entity_type: entityName,
                                    },
                                },
                                {
                                    term: {
                                        grantee_id: user.id,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const right = {
                entity_type: entityName,
                grantee_id: user.id,
                entity_value: 'abcd',
            } as RightEntity;

            const entityQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                terms: {
                                    id: ['abcd'],
                                },
                            },
                        },
                    },
                },
            };

            const entity = {
                id: 'abcd',
            };

            when(rightsServiceMock.searchElastic(deepEqual(rightsQuery))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await throwWith(
                context.controllerBasics._searchRestricted(
                    instance(eventsServiceMock),
                    instance(rightsServiceMock),
                    user,
                    'id',
                    {},
                ),
                StatusCodes.InternalServerError,
                'unexpected_error',
            );

            verify(rightsServiceMock.searchElastic(deepEqual(rightsQuery))).called();
        });

        it('should fail invalid field in query', async function() {
            const eventsServiceMock = mock(EventsService);
            const rightsServiceMock = mock(RightsService);
            const entityName = 'event';
            when(eventsServiceMock.name).thenReturn(entityName);
            const user = {
                id: 'user_id',
            } as UserDto;
            const rightsQuery = {
                body: {
                    size: 2147483647, // int max value
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        entity_type: entityName,
                                    },
                                },
                                {
                                    term: {
                                        grantee_id: user.id,
                                    },
                                },
                            ],
                        },
                    },
                },
            };

            const right = {
                entity_type: entityName,
                grantee_id: user.id,
                entity_value: 'abcd',
            } as RightEntity;

            const entityQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                terms: {
                                    id: ['abcd'],
                                },
                            },
                        },
                    },
                },
            };

            const entity = {
                id: 'abcd',
            };

            when(rightsServiceMock.searchElastic(deepEqual(rightsQuery))).thenResolve({
                error: null,
                response: {
                    hits: {
                        hits: [
                            {
                                _source: right,
                            },
                        ],
                    },
                } as ESSearchReturn<any>,
            });

            await throwWith(
                context.controllerBasics._searchRestricted(
                    instance(eventsServiceMock),
                    instance(rightsServiceMock),
                    user,
                    'id',
                    {
                        id: {
                            $in: ['efgh'],
                        },
                    } as SortablePagedSearch,
                ),
                StatusCodes.Unauthorized,
                'unauthorized_value_in_filter',
            );

            verify(rightsServiceMock.searchElastic(deepEqual(rightsQuery))).called();
        });
    });
    describe('_esQueryBuilder', function() {
        it('should properly build an es query', function() {
            const query = {
                id: {
                    $eq: 'abcd',
                },
            } as SortablePagedSearch;

            expect(context.controllerBasics._esQueryBuilder(query)).toEqual({
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    id: 'abcd',
                                },
                            },
                        },
                    },
                },
            });
        });

        it('should fail on invalid body', function() {
            const query = {
                id: null,
            } as SortablePagedSearch;

            syncThrowWith(() => {
                context.controllerBasics._esQueryBuilder(query);
            });
        });

        it('should fail on page index without page size', function() {
            const query = {
                id: {
                    $eq: 'abcd',
                },
                $page_index: 3,
            } as SortablePagedSearch;

            syncThrowWith(() => {
                context.controllerBasics._esQueryBuilder(query);
            });
        });
    });
    describe('_search', function() {
        it('should properly search', async function() {
            const query = {
                id: {
                    $eq: 'abcd',
                },
            } as SortablePagedSearch;

            const service = mock(CRUDExtension);

            when(
                service.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            id: 'abcd',
                                        },
                                    },
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
                        hits: [],
                    },
                } as ESSearchReturn<any>,
            });

            const res = await context.controllerBasics._search(instance(service), query);

            expect(res).toEqual([]);
        });

        it('should properly search empty query', async function() {
            const query = {
                id: {
                    $eq: 'abcd',
                },
            } as SortablePagedSearch;

            const service = mock(CRUDExtension);

            when(
                service.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            id: 'abcd',
                                        },
                                    },
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
                } as ESSearchReturn<any>,
            });

            const res = await context.controllerBasics._search(instance(service), query);

            expect(res).toEqual([]);
        });

        it('should throw on error', async function() {
            const query = {
                id: {
                    $eq: 'abcd',
                },
            } as SortablePagedSearch;

            const service = mock(CRUDExtension);

            when(
                service.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            id: 'abcd',
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await throwWith(
                context.controllerBasics._search(instance(service), query),
                StatusCodes.InternalServerError,
                'lol',
            );
        });
    });
    describe('_authorizeGlobal', function() {
        it('should properly check global rights', async function() {
            const user = {
                id: 'abcd',
            } as UserDto;

            const entityValue = 'abcd';

            const requiredRights = ['owner'];

            const serviceMock = mock(CRUDExtension);

            const rightsServiceMock = mock(RightsService);

            when(
                rightsServiceMock.hasGlobalRightsUpon(
                    anything(),
                    deepEqual(user),
                    entityValue,
                    deepEqual(requiredRights),
                ),
            ).thenResolve({
                error: null,
                response: null,
            });

            await context.controllerBasics._authorizeGlobal(
                instance(rightsServiceMock),
                instance(serviceMock),
                user,
                entityValue,
                requiredRights,
            );

            verify(
                rightsServiceMock.hasGlobalRightsUpon(
                    anything(),
                    deepEqual(user),
                    entityValue,
                    deepEqual(requiredRights),
                ),
            ).called();
        });

        it('should throw when no rights', async function() {
            const user = {
                id: 'abcd',
            } as UserDto;

            const entityValue = 'abcd';

            const requiredRights = ['owner'];

            const serviceMock = mock(CRUDExtension);

            const rightsServiceMock = mock(RightsService);

            when(
                rightsServiceMock.hasGlobalRightsUpon(
                    anything(),
                    deepEqual(user),
                    entityValue,
                    deepEqual(requiredRights),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await throwWith(
                context.controllerBasics._authorizeGlobal(
                    instance(rightsServiceMock),
                    instance(serviceMock),
                    user,
                    entityValue,
                    requiredRights,
                ),
                StatusCodes.Unauthorized,
                'unexpected_error',
            );

            verify(
                rightsServiceMock.hasGlobalRightsUpon(
                    anything(),
                    deepEqual(user),
                    entityValue,
                    deepEqual(requiredRights),
                ),
            ).called();
        });
    });
    describe('_authorizeOne', function() {
        it('should authorize upon a specific entity', async function() {
            const user = {
                id: 'abcd',
            } as UserDto;

            const requiredRights = ['owner'];

            const serviceMock = mock(CRUDExtension);

            const rightsServiceMock = mock(RightsService);

            const query = {
                id: 'abcd',
            };

            const field = 'id';

            when(
                rightsServiceMock.hasRightsUpon(
                    anything(),
                    deepEqual(user),
                    deepEqual(query),
                    field,
                    deepEqual(requiredRights),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'abcd',
                    },
                ],
            });

            const res = await context.controllerBasics._authorizeOne(
                instance(rightsServiceMock),
                instance(serviceMock),
                user,
                query,
                field,
                requiredRights,
            );

            expect(res).toEqual({ id: 'abcd' });

            verify(
                rightsServiceMock.hasRightsUpon(
                    anything(),
                    deepEqual(user),
                    deepEqual(query),
                    field,
                    deepEqual(requiredRights),
                ),
            ).called();
        });

        it('should fail on authorization error', async function() {
            const user = {
                id: 'abcd',
            } as UserDto;

            const requiredRights = ['owner'];

            const serviceMock = mock(CRUDExtension);

            const rightsServiceMock = mock(RightsService);

            const query = {
                id: 'abcd',
            };

            const field = 'id';

            when(
                rightsServiceMock.hasRightsUpon(
                    anything(),
                    deepEqual(user),
                    deepEqual(query),
                    field,
                    deepEqual(requiredRights),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await throwWith(
                context.controllerBasics._authorizeOne(
                    instance(rightsServiceMock),
                    instance(serviceMock),
                    user,
                    query,
                    field,
                    requiredRights,
                ),
                StatusCodes.Unauthorized,
                'unauthorized_action',
            );

            verify(
                rightsServiceMock.hasRightsUpon(
                    anything(),
                    deepEqual(user),
                    deepEqual(query),
                    field,
                    deepEqual(requiredRights),
                ),
            ).called();
        });

        it('should fail on multiple response error', async function() {
            const user = {
                id: 'abcd',
            } as UserDto;

            const requiredRights = ['owner'];

            const serviceMock = mock(CRUDExtension);

            const rightsServiceMock = mock(RightsService);

            const query = {
                id: 'abcd',
            };

            const field = 'id';

            when(
                rightsServiceMock.hasRightsUpon(
                    anything(),
                    deepEqual(user),
                    deepEqual(query),
                    field,
                    deepEqual(requiredRights),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'abcd',
                    },
                    {
                        id: 'efgh',
                    },
                ],
            });

            await throwWith(
                context.controllerBasics._authorizeOne(
                    instance(rightsServiceMock),
                    instance(serviceMock),
                    user,
                    query,
                    field,
                    requiredRights,
                ),
                StatusCodes.Conflict,
                'multiple_entities_found',
            );

            verify(
                rightsServiceMock.hasRightsUpon(
                    anything(),
                    deepEqual(user),
                    deepEqual(query),
                    field,
                    deepEqual(requiredRights),
                ),
            ).called();
        });
    });

    describe('_elasticGet', function() {
        it('should properly do elastic search', async function() {
            const serviceMock = mock(CRUDExtension);

            when(
                serviceMock.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        terms: {
                                            id: 'abcd',
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    hits: {
                        hits: [
                            {
                                _source: {},
                            },
                        ],
                    },
                } as ESSearchReturn<any>,
            });

            const res = await context.controllerBasics._elasticGet(instance(serviceMock), {
                id: {
                    $in: 'abcd',
                },
            } as SortablePagedSearch);

            expect(res).toEqual([{}]);

            verify(
                serviceMock.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        terms: {
                                            id: 'abcd',
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).called();
        });

        it('should fail on query error', async function() {
            const serviceMock = mock(CRUDExtension);

            when(
                serviceMock.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        terms: {
                                            id: 'abcd',
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await throwWith(
                context.controllerBasics._elasticGet(instance(serviceMock), {
                    id: {
                        $in: 'abcd',
                    },
                } as SortablePagedSearch),
                StatusCodes.InternalServerError,
                'unexpected_error',
            );

            verify(
                serviceMock.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        terms: {
                                            id: 'abcd',
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).called();
        });
    });

    describe('_get', function() {
        it('should properly search entities', async function() {
            const serviceMock = mock(CRUDExtension);

            const query = {
                id: 'abcd',
            };

            when(serviceMock.search(deepEqual(query), undefined)).thenResolve({
                error: null,
                response: [{}] as any,
            });

            const res = await context.controllerBasics._get(instance(serviceMock), query);

            expect(res).toEqual([{}]);

            verify(serviceMock.search(deepEqual(query), undefined)).called();
        });

        it('should fail on query error', async function() {
            const serviceMock = mock(CRUDExtension);

            const query = {
                id: 'abcd',
            };

            when(serviceMock.search(deepEqual(query), undefined)).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await throwWith(
                context.controllerBasics._get(instance(serviceMock), query),
                StatusCodes.InternalServerError,
                'unexpected_error',
            );

            verify(serviceMock.search(deepEqual(query), undefined)).called();
        });
    });

    describe('_getOne', function() {
        it('should properly search entities', async function() {
            const serviceMock = mock(CRUDExtension);

            const query = {
                id: 'abcd',
            };

            when(serviceMock.search(deepEqual(query), undefined)).thenResolve({
                error: null,
                response: [{}] as any,
            });

            const res = await context.controllerBasics._getOne(instance(serviceMock), query);

            expect(res).toEqual({});

            verify(serviceMock.search(deepEqual(query), undefined)).called();
        });

        it('should fail on query error', async function() {
            const serviceMock = mock(CRUDExtension);

            const query = {
                id: 'abcd',
            };

            when(serviceMock.search(deepEqual(query), undefined)).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await throwWith(
                context.controllerBasics._getOne(instance(serviceMock), query),
                StatusCodes.InternalServerError,
                'unexpected_error',
            );

            verify(serviceMock.search(deepEqual(query), undefined)).called();
        });

        it('should fail on empty result', async function() {
            const serviceMock = mock(CRUDExtension);

            const query = {
                id: 'abcd',
            };

            when(serviceMock.search(deepEqual(query), undefined)).thenResolve({
                error: null,
                response: [],
            });

            await throwWith(
                context.controllerBasics._getOne(instance(serviceMock), query),
                StatusCodes.NotFound,
                'entity_not_found',
            );

            verify(serviceMock.search(deepEqual(query), undefined)).called();
        });

        it('should fail on multiple results', async function() {
            const serviceMock = mock(CRUDExtension);

            const query = {
                id: 'abcd',
            };

            when(serviceMock.search(deepEqual(query), undefined)).thenResolve({
                error: null,
                response: [{}, {}] as any,
            });

            await throwWith(
                context.controllerBasics._getOne(instance(serviceMock), query),
                StatusCodes.Conflict,
                'multiple_entities_found',
            );

            verify(serviceMock.search(deepEqual(query), undefined)).called();
        });
    });

    describe('_edit', function() {
        it('should properly edit entity', async function() {
            const serviceMock = mock(CRUDExtension);

            const query = {
                id: 'abcd',
            };

            const entity = {
                name: 'hi',
            };

            when(serviceMock.update(deepEqual(query), deepEqual(entity), undefined)).thenResolve({
                error: null,
                response: [{}, {}] as any,
            });

            await context.controllerBasics._edit(instance(serviceMock), query, entity);

            verify(serviceMock.update(deepEqual(query), deepEqual(entity), undefined)).called();
        });

        it('should fail on edit error', async function() {
            const serviceMock = mock(CRUDExtension);

            const query = {
                id: 'abcd',
            };

            const entity = {
                name: 'hi',
            };

            when(serviceMock.update(deepEqual(query), deepEqual(entity), undefined)).thenResolve({
                error: 'unexpected_error',
                response: [{}, {}] as any,
            });

            await throwWith(
                context.controllerBasics._edit(instance(serviceMock), query, entity),
                StatusCodes.InternalServerError,
                'unexpected_error',
            );

            verify(serviceMock.update(deepEqual(query), deepEqual(entity), undefined)).called();
        });
    });

    describe('_new', function() {
        it('should properly create entity', async function() {
            const serviceMock = mock(CRUDExtension);

            const entity = {
                name: 'hi',
            };

            when(serviceMock.create(deepEqual(entity), undefined)).thenResolve({
                error: null,
                response: [{}, {}] as any,
            });

            await context.controllerBasics._new(instance(serviceMock), entity);

            verify(serviceMock.create(deepEqual(entity), undefined)).called();
        });

        it('should fail on creation error', async function() {
            const serviceMock = mock(CRUDExtension);

            const entity = {
                name: 'hi',
            };

            when(serviceMock.create(deepEqual(entity), undefined)).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            await throwWith(
                context.controllerBasics._new(instance(serviceMock), entity),
                StatusCodes.InternalServerError,
                'unexpected_error',
            );

            verify(serviceMock.create(deepEqual(entity), undefined)).called();
        });
    });
});
