import { anything, capture, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import {
    BaseModel,
    BaseModelStatic,
    FindQuery,
} from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { Repository, uuid } from '@iaminfinity/express-cassandra';
import {
    CreateOptions,
    CRUDExtension,
    DeleteOptions,
    DryResponse,
    ESSearchQuery,
    SearchOptions,
    SearchQuery,
    UpdateOptions,
} from '@lib/common/crud/CRUDExtension.base';

class FakeEntity {
    id: string;
    name: string;
    updated_at?: Date;
}

const context: {
    modelMock: BaseModel<FakeEntity>;
    repositoryMock: Repository;
} = {
    modelMock: null,
    repositoryMock: null,
};

const entityBuilder = (entity: FakeEntity): FakeEntity => entity;

describe('CRUD Extension', function() {
    beforeEach(async function() {
        context.modelMock = mock<BaseModel<FakeEntity>>();
        context.repositoryMock = mock(Repository);
    });

    describe('create', function() {
        it('creates an entity', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const newEntity: FakeEntity = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
                name: 'test',
            };

            const newEntityProcessed = {
                id: uuid(newEntity.id),
                name: 'test',
            };

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            when(context.repositoryMock.create(deepEqual(newEntityProcessed))).thenReturn(newEntityProcessed);
            when(context.repositoryMock.save(deepEqual(newEntityProcessed), undefined)).thenCall(() => {
                return {
                    toPromise: () => Promise.resolve(newEntityProcessed),
                };
            });

            const res = await crudext.create(newEntity);

            verify(
                context.repositoryMock.create(
                    deepEqual({
                        id: uuid('016d3680-c2ac-4c6a-98f8-c63b22b3542f'),
                        name: 'test',
                    }),
                ),
            ).called();
            verify(context.repositoryMock.save(deepEqual(newEntityProcessed), undefined)).called();

            expect(res.response).toEqual(newEntityProcessed);
            expect(res.error).toEqual(null);
        });

        it('creates an entity with options', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const createOptions: CreateOptions = {
                ttl: 3,
            };

            const newEntity: FakeEntity = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
                name: 'test',
            };

            const newEntityProcessed = {
                id: uuid(newEntity.id),
                name: 'test',
            };

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            when(context.repositoryMock.create(deepEqual(newEntityProcessed))).thenReturn(newEntityProcessed);
            when(context.repositoryMock.save(deepEqual(newEntityProcessed), deepEqual(createOptions))).thenCall(() => {
                return {
                    toPromise: () => Promise.resolve(newEntityProcessed),
                };
            });

            const res = await crudext.create(newEntity, createOptions);

            verify(
                context.repositoryMock.create(
                    deepEqual({
                        id: uuid('016d3680-c2ac-4c6a-98f8-c63b22b3542f'),
                        name: 'test',
                    }),
                ),
            ).called();
            verify(context.repositoryMock.save(deepEqual(newEntityProcessed), deepEqual(createOptions))).called();

            expect(res.response).toEqual(newEntityProcessed);
            expect(res.error).toEqual(null);
        });

        it('reports errors', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const newEntity: FakeEntity = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
                name: 'test',
            };

            const newEntityProcessed = {
                id: uuid(newEntity.id),
                name: 'test',
            };

            when(context.repositoryMock.create(deepEqual(newEntityProcessed))).thenReturn(newEntityProcessed);
            when(context.repositoryMock.save(deepEqual(newEntityProcessed), undefined)).thenCall(() => {
                return {
                    toPromise: () => Promise.reject(new Error('unexpected error')),
                };
            });

            const res = await crudext.create(newEntity);

            verify(context.repositoryMock.create(deepEqual(newEntityProcessed))).called();
            verify(context.repositoryMock.save(deepEqual(newEntityProcessed), undefined)).called();

            expect(res.error).toEqual('unexpected error');
            expect(res.response).toEqual(null);
        });
    });

    describe('dryCreate', function() {
        it('creates an entity', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const modelBuilderMock = mock<any>();
            const newModelMock = mock<BaseModelStatic<FakeEntity>>();

            when(modelBuilderMock.build(anything())).thenReturn(instance(newModelMock));

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(
                instance(context.modelMock),
                instance(context.repositoryMock),
                instance(modelBuilderMock).build,
                entityBuilder,
            );

            const newEntity: FakeEntity = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
                name: 'test',
            };

            const newEntityProcessed = {
                id: uuid(newEntity.id),
                name: 'test',
            };

            const dryResponse = {
                query: 'this is a cassandra query',
                params: [],
            } as DryResponse;

            when(context.repositoryMock.create(deepEqual(newEntityProcessed))).thenReturn(newEntityProcessed);

            when(
                newModelMock.save(
                    deepEqual({
                        return_query: true,
                    }),
                ),
            ).thenResolve(dryResponse as any);

            const res = await crudext.dryCreate(newEntity);

            verify(context.repositoryMock.create(deepEqual(newEntityProcessed))).called();

            verify(
                newModelMock.save(
                    deepEqual({
                        return_query: true,
                    }),
                ),
            ).called();

            expect(res.response).toEqual(dryResponse);
            expect(res.error).toEqual(null);
        });

        it('creates an entity with options', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const modelBuilderMock = mock<any>();
            const newModelMock = mock<BaseModelStatic<FakeEntity>>();

            when(modelBuilderMock.build(anything())).thenReturn(instance(newModelMock));

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(
                instance(context.modelMock),
                instance(context.repositoryMock),
                instance(modelBuilderMock).build,
                entityBuilder,
            );

            const createOptions: CreateOptions = {
                ttl: 3,
            };

            const newEntity: FakeEntity = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
                name: 'test',
            };

            const newEntityProcessed = {
                id: uuid(newEntity.id),
                name: 'test',
            };

            const dryResponse = {
                query: 'this is a cassandra query',
                params: [],
            } as DryResponse;

            when(context.repositoryMock.create(deepEqual(newEntityProcessed))).thenReturn(newEntityProcessed);

            when(
                newModelMock.save(
                    deepEqual({
                        ...createOptions,
                        return_query: true,
                    }),
                ),
            ).thenResolve(dryResponse as any);

            const res = await crudext.dryCreate(newEntity, createOptions);

            verify(context.repositoryMock.create(deepEqual(newEntityProcessed))).called();

            verify(
                newModelMock.save(
                    deepEqual({
                        ...createOptions,
                        return_query: true,
                    }),
                ),
            ).called();

            expect(res.response).toEqual(dryResponse);
            expect(res.error).toEqual(null);
        });

        it('reports errors', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const modelBuilderMock = mock<any>();
            const newModelMock = mock<BaseModelStatic<FakeEntity>>();

            when(modelBuilderMock.build(anything())).thenThrow(new Error('query creation error'));

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(
                instance(context.modelMock),
                instance(context.repositoryMock),
                instance(modelBuilderMock).build,
                entityBuilder,
            );

            const createOptions: CreateOptions = {
                ttl: 3,
            };

            const newEntity: FakeEntity = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
                name: 'test',
            };

            const newEntityProcessed = {
                id: uuid(newEntity.id),
                name: 'test',
            };

            when(context.repositoryMock.create(deepEqual(newEntityProcessed))).thenReturn(newEntityProcessed);

            const res = await crudext.dryCreate(newEntity, createOptions);

            verify(context.repositoryMock.create(deepEqual(newEntityProcessed))).called();

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('query creation error');
        });
    });

    describe('read', function() {
        it('search for entities', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const searchEntity: SearchQuery<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
                name: 'salut',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
                name: 'salut',
            };

            const newEntityProcessed = {
                id: searchEntity.id,
                name: 'salut',
            };

            when(context.repositoryMock.find(deepEqual(searchEntityProcessed), undefined)).thenCall(() => {
                return {
                    toPromise: () => Promise.resolve([newEntityProcessed]),
                };
            });

            const res = await crudext.search(searchEntity);

            verify(context.repositoryMock.find(deepEqual(searchEntityProcessed), undefined)).called();

            expect(res.response).toEqual([newEntityProcessed]);
            expect(res.error).toEqual(null);
        });

        it('search for with no results', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const searchEntity: SearchQuery<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
                name: 'salut',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
                name: 'salut',
            };

            const newEntityProcessed = {
                id: searchEntity.id,
                name: 'salut',
            };

            when(context.repositoryMock.find(deepEqual(searchEntityProcessed), undefined)).thenCall(() => {
                return {
                    toPromise: () => Promise.resolve(null),
                };
            });

            const res = await crudext.search(searchEntity);

            verify(context.repositoryMock.find(deepEqual(searchEntityProcessed), undefined)).called();

            expect(res.response).toEqual(null);
            expect(res.error).toEqual(null);
        });

        it('search for entities with options', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const searchOptions: SearchOptions<FakeEntity> = {
                allow_filtering: true,
            };

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const searchEntity: Partial<FakeEntity> = {
                id: true as any,
            };

            const searchEntityProcessed = {
                id: true as any,
            };

            const newEntityProcessed = {
                id: searchEntity.id,
                name: 'test',
            };

            when(context.repositoryMock.find(deepEqual(searchEntityProcessed), deepEqual(searchOptions))).thenCall(
                () => {
                    return {
                        toPromise: () => Promise.resolve([newEntityProcessed]),
                    };
                },
            );

            const res = await crudext.search(searchEntity, searchOptions);

            verify(context.repositoryMock.find(deepEqual(searchEntityProcessed), deepEqual(searchOptions))).called();

            expect(res.response).toEqual([newEntityProcessed]);
            expect(res.error).toEqual(null);
        });

        it('search for entities nested uuid parameters', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const searchEntity: SearchQuery<FakeEntity> = {
                id: {
                    $eq: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
                    $contains_key: ['016d3680-c2ac-4c6a-98f8-c63b22b3542f'],
                    $lt: {},
                },
            };

            const searchEntityProcessed = {
                id: {
                    $eq: uuid('016d3680-c2ac-4c6a-98f8-c63b22b3542f'),
                    $contains_key: [uuid('016d3680-c2ac-4c6a-98f8-c63b22b3542f')],
                    $lt: {},
                },
            };

            const newEntityProcessed = {
                id: searchEntity.id,
                name: true as any,
            };

            when(context.repositoryMock.find(deepEqual(searchEntityProcessed), undefined)).thenCall(() => {
                return {
                    toPromise: () => Promise.resolve([newEntityProcessed]),
                };
            });

            const res = await crudext.search(searchEntity);

            verify(context.repositoryMock.find(deepEqual(searchEntityProcessed), undefined)).called();

            expect(res.response).toEqual([newEntityProcessed]);
            expect(res.error).toEqual(null);
        });

        it('reports errors', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const searchEntity: Partial<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
            };

            when(context.repositoryMock.find(deepEqual(searchEntityProcessed), undefined)).thenCall(() => {
                return {
                    toPromise: () => Promise.reject(new Error('unexpected error')),
                };
            });

            const res = await crudext.search(searchEntity);

            verify(context.repositoryMock.find(deepEqual(searchEntityProcessed), undefined)).called();

            expect(res.error).toEqual('unexpected error');
            expect(res.response).toEqual(null);
        });
    });

    describe('dryRead', function() {
        it('search for entities', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const searchEntity: SearchQuery<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
                name: 'salut',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
                name: 'salut',
            };

            const newEntityProcessed = {
                id: searchEntity.id,
                name: 'salut',
            };

            const dryResponse = {
                query: 'this is a cassandra query',
                params: [],
            } as DryResponse;

            when(
                context.modelMock.find(
                    deepEqual(searchEntityProcessed as FindQuery<FakeEntity>),
                    deepEqual({
                        return_query: true,
                    }),
                ),
            ).thenResolve(dryResponse as any);

            const res = await crudext.drySearch(searchEntity);

            verify(
                context.modelMock.find(
                    deepEqual(searchEntityProcessed as FindQuery<FakeEntity>),
                    deepEqual({
                        return_query: true,
                    }),
                ),
            ).called();

            expect(res.response).toEqual(dryResponse);
            expect(res.error).toEqual(null);
        });

        it('search for entities with options', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const searchOptions: SearchOptions<FakeEntity> = {
                allow_filtering: true,
            };

            const searchEntity: SearchQuery<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
                name: 'salut',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
                name: 'salut',
            };

            const newEntityProcessed = {
                id: searchEntity.id,
                name: 'salut',
            };

            const dryResponse = {
                query: 'this is a cassandra query',
                params: [],
            } as DryResponse;

            when(
                context.modelMock.find(
                    deepEqual(searchEntityProcessed as FindQuery<FakeEntity>),
                    deepEqual({
                        ...searchOptions,
                        return_query: true,
                    }),
                ),
            ).thenResolve(dryResponse as any);

            const res = await crudext.drySearch(searchEntity, searchOptions);

            verify(
                context.modelMock.find(
                    deepEqual(searchEntityProcessed as FindQuery<FakeEntity>),
                    deepEqual({
                        ...searchOptions,
                        return_query: true,
                    }),
                ),
            ).called();

            expect(res.response).toEqual(dryResponse);
            expect(res.error).toEqual(null);
        });

        it('reports errors', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const searchOptions: SearchOptions<FakeEntity> = {
                allow_filtering: true,
            };

            const searchEntity: SearchQuery<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
                name: 'salut',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
                name: 'salut',
            };

            const newEntityProcessed = {
                id: searchEntity.id,
                name: 'salut',
            };

            const dryResponse = {
                query: 'this is a cassandra query',
                params: [],
            } as DryResponse;

            when(
                context.modelMock.find(
                    deepEqual(searchEntityProcessed as FindQuery<FakeEntity>),
                    deepEqual({
                        ...searchOptions,
                        return_query: true,
                    }),
                ),
            ).thenThrow(new Error(`query creation error`));

            const res = await crudext.drySearch(searchEntity, searchOptions);

            verify(
                context.modelMock.find(
                    deepEqual(searchEntityProcessed as FindQuery<FakeEntity>),
                    deepEqual({
                        ...searchOptions,
                        return_query: true,
                    }),
                ),
            ).called();

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('query creation error');
        });
    });

    describe('update', function() {
        it('updates an entity', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const searchEntity: Partial<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
            };

            const newEntity = {
                id: searchEntity.id,
                name: 'test',
            };
            const newEntityProcessed = {
                id: uuid(searchEntity.id),
                name: 'test',
                updated_at: anything(),
            };

            when(
                context.repositoryMock.update(
                    deepEqual(searchEntityProcessed),
                    deepEqual(newEntityProcessed),
                    undefined,
                ),
            ).thenCall(() => {
                return {
                    toPromise: () => Promise.resolve(newEntity),
                };
            });

            const res = await crudext.update(searchEntity, newEntity);

            verify(
                context.repositoryMock.update(
                    deepEqual(searchEntityProcessed),
                    deepEqual(newEntityProcessed),
                    undefined,
                ),
            ).called();

            expect(res.response).toEqual(newEntity);
            expect(res.error).toEqual(null);
        });

        it('updates an entity with options', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const updateOptions: UpdateOptions<FakeEntity> = {
                ttl: 3,
            };

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const searchEntity: Partial<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
            };

            const newEntity = {
                id: searchEntity.id,
                name: 'test',
            };
            const newEntityProcessed = {
                id: uuid(searchEntity.id),
                name: 'test',
                updated_at: anything(),
            };

            when(
                context.repositoryMock.update(
                    deepEqual(searchEntityProcessed),
                    deepEqual(newEntityProcessed),
                    deepEqual(updateOptions),
                ),
            ).thenCall(() => {
                return {
                    toPromise: () => Promise.resolve(newEntity),
                };
            });

            const res = await crudext.update(searchEntity, newEntity, updateOptions);

            verify(
                context.repositoryMock.update(
                    deepEqual(searchEntityProcessed),
                    deepEqual(newEntityProcessed),
                    deepEqual(updateOptions),
                ),
            ).called();

            expect(res.response).toEqual(newEntity);
            expect(res.error).toEqual(null);
        });

        it('reports errors', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const updateOptions: UpdateOptions<FakeEntity> = {
                ttl: 3,
            };

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const searchEntity: Partial<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
            };

            const newEntity = {
                id: searchEntity.id,
                name: 'test',
            };
            const newEntityProcessed = {
                id: uuid(searchEntity.id),
                name: 'test',
                updated_at: anything(),
            };

            when(
                context.repositoryMock.update(
                    deepEqual(searchEntityProcessed),
                    deepEqual(newEntityProcessed),
                    deepEqual(updateOptions),
                ),
            ).thenCall(() => {
                return {
                    toPromise: () => Promise.reject(new Error('unexpected error')),
                };
            });

            const res = await crudext.update(searchEntity, newEntity, updateOptions);

            verify(
                context.repositoryMock.update(
                    deepEqual(searchEntityProcessed),
                    deepEqual(newEntityProcessed),
                    deepEqual(updateOptions),
                ),
            ).called();

            expect(res.error).toEqual('unexpected error');
            expect(res.response).toEqual(null);
        });
    });

    describe('dryUpdate', function() {
        it('updates an entity', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const searchEntity: Partial<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
            };

            const newEntity = {
                id: searchEntity.id,
                name: 'test',
            };
            const newEntityProcessed = {
                id: uuid(searchEntity.id),
                name: 'test',
                updated_at: anything(),
            };

            const dryResponse = {
                query: 'this is a cassandra query',
                params: [],
            } as DryResponse;

            when(
                context.modelMock.update(
                    deepEqual(searchEntityProcessed as FindQuery<FakeEntity>),
                    deepEqual(newEntityProcessed as any),
                    deepEqual({
                        return_query: true,
                    }),
                ),
            ).thenReturn(dryResponse as any);

            const res = await crudext.dryUpdate(searchEntity, newEntity);

            verify(
                context.modelMock.update(
                    deepEqual(searchEntityProcessed as FindQuery<FakeEntity>),
                    deepEqual(newEntityProcessed as any),
                    deepEqual({
                        return_query: true,
                    }),
                ),
            ).called();

            expect(res.response).toEqual(dryResponse);
            expect(res.error).toEqual(null);
        });

        it('updates an entity with options', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const updateOptions: UpdateOptions<FakeEntity> = {
                ttl: 3,
            };

            const searchEntity: Partial<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
            };

            const newEntity = {
                id: searchEntity.id,
                name: 'test',
            };
            const newEntityProcessed = {
                id: uuid(searchEntity.id),
                name: 'test',
                updated_at: anything(),
            };

            const dryResponse = {
                query: 'this is a cassandra query',
                params: [],
            } as DryResponse;

            when(
                context.modelMock.update(
                    deepEqual(searchEntityProcessed as FindQuery<FakeEntity>),
                    deepEqual(newEntityProcessed as any),
                    deepEqual({
                        ...updateOptions,
                        return_query: true,
                    }),
                ),
            ).thenReturn(dryResponse as any);

            const res = await crudext.dryUpdate(searchEntity, newEntity, updateOptions);

            verify(
                context.modelMock.update(
                    deepEqual(searchEntityProcessed as FindQuery<FakeEntity>),
                    deepEqual(newEntityProcessed as any),
                    deepEqual({
                        ...updateOptions,
                        return_query: true,
                    }),
                ),
            ).called();

            expect(res.response).toEqual(dryResponse);
            expect(res.error).toEqual(null);
        });

        it('reports errors', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const updateOptions: UpdateOptions<FakeEntity> = {
                ttl: 3,
            };

            const searchEntity: Partial<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
            };

            const newEntity = {
                id: searchEntity.id,
                name: 'test',
            };
            const newEntityProcessed = {
                id: uuid(searchEntity.id),
                name: 'test',
                updated_at: anything(),
            };

            const dryResponse = {
                query: 'this is a cassandra query',
                params: [],
            } as DryResponse;

            when(
                context.modelMock.update(
                    deepEqual(searchEntityProcessed as FindQuery<FakeEntity>),
                    deepEqual(newEntityProcessed as any),
                    deepEqual({
                        ...updateOptions,
                        return_query: true,
                    }),
                ),
            ).thenThrow(new Error('error while creating query'));

            const res = await crudext.dryUpdate(searchEntity, newEntity, updateOptions);

            verify(
                context.modelMock.update(
                    deepEqual(searchEntityProcessed as FindQuery<FakeEntity>),
                    deepEqual(newEntityProcessed as any),
                    deepEqual({
                        ...updateOptions,
                        return_query: true,
                    }),
                ),
            ).called();

            expect(res.response).toEqual(null);
            expect(res.error).toEqual('error while creating query');
        });
    });

    describe('delete', function() {
        it('deletes an entity', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const searchEntity: Partial<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
            };

            when(context.repositoryMock.delete(deepEqual(searchEntityProcessed), undefined)).thenCall(() => {
                return {
                    toPromise: () => Promise.resolve(void 0),
                };
            });

            const res = await crudext.delete(searchEntity);

            verify(context.repositoryMock.delete(deepEqual(searchEntityProcessed), undefined)).called();

            expect(res.error).toEqual(null);
        });

        it('deletes an entity with options', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const searchEntity: Partial<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
            };

            const deleteOptions: DeleteOptions = {
                if_exists: true,
            };

            when(context.repositoryMock.delete(deepEqual(searchEntityProcessed), deepEqual(deleteOptions))).thenCall(
                () => {
                    return {
                        toPromise: () => Promise.resolve(void 0),
                    };
                },
            );

            const res = await crudext.delete(searchEntity, deleteOptions);

            verify(context.repositoryMock.delete(deepEqual(searchEntityProcessed), deepEqual(deleteOptions))).called();

            expect(res.error).toEqual(null);
        });

        it('reports errors', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const searchEntity: Partial<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
            };

            const deleteOptions: DeleteOptions = {
                if_exists: true,
            };

            when(context.repositoryMock.delete(deepEqual(searchEntityProcessed), deepEqual(deleteOptions))).thenCall(
                () => {
                    return {
                        toPromise: () => Promise.reject(new Error('unexpected error')),
                    };
                },
            );

            const res = await crudext.delete(searchEntity, deleteOptions);

            verify(context.repositoryMock.delete(deepEqual(searchEntityProcessed), deepEqual(deleteOptions))).called();

            expect(res.error).toEqual('unexpected error');
        });
    });

    describe('dryDelete', function() {
        it('deletes an entity', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const dryResponse = {
                query: 'this is a cassandra query',
                params: [],
            } as DryResponse;

            const searchEntity: Partial<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
            };

            when(
                context.modelMock.delete(
                    deepEqual(searchEntityProcessed as any),
                    deepEqual({
                        return_query: true,
                    }),
                ),
            ).thenReturn(dryResponse as any);

            const res = await crudext.dryDelete(searchEntity);

            verify(
                context.modelMock.delete(
                    deepEqual(searchEntityProcessed as any),
                    deepEqual({
                        return_query: true,
                    }),
                ),
            ).called();

            expect(res.error).toEqual(null);
        });

        it('deletes an entity with options', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const deleteOptions: DeleteOptions = {
                if_exists: true,
            };

            const dryResponse = {
                query: 'this is a cassandra query',
                params: [],
            } as DryResponse;

            const searchEntity: Partial<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
            };

            when(
                context.modelMock.delete(
                    deepEqual(searchEntityProcessed as any),
                    deepEqual({
                        ...deleteOptions,
                        return_query: true,
                    }),
                ),
            ).thenReturn(dryResponse as any);

            const res = await crudext.dryDelete(searchEntity, deleteOptions);

            verify(
                context.modelMock.delete(
                    deepEqual(searchEntityProcessed as any),
                    deepEqual({
                        ...deleteOptions,
                        return_query: true,
                    }),
                ),
            ).called();

            expect(res.error).toEqual(null);
        });

        it('reports errors', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const deleteOptions: DeleteOptions = {
                if_exists: true,
            };

            const dryResponse = {
                query: 'this is a cassandra query',
                params: [],
            } as DryResponse;

            const searchEntity: Partial<FakeEntity> = {
                id: '016d3680-c2ac-4c6a-98f8-c63b22b3542f',
            };

            const searchEntityProcessed = {
                id: uuid(searchEntity.id),
            };

            when(
                context.modelMock.delete(
                    deepEqual(searchEntityProcessed as any),
                    deepEqual({
                        ...deleteOptions,
                        return_query: true,
                    }),
                ),
            ).thenThrow(new Error('unable to build query'));

            const res = await crudext.dryDelete(searchEntity, deleteOptions);

            verify(
                context.modelMock.delete(
                    deepEqual(searchEntityProcessed as any),
                    deepEqual({
                        ...deleteOptions,
                        return_query: true,
                    }),
                ),
            ).called();

            expect(res.error).toEqual('unable to build query');
        });
    });

    describe('searchElastic', function() {
        it('search for entities', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const elasticSearchOptions: ESSearchQuery<FakeEntity> = {
                body: {},
            };

            const newEntity = {
                name: 'test',
            };

            when(context.modelMock.search(elasticSearchOptions, anything())).thenCall(() => {
                const [osef, cb] = capture<ESSearchQuery<FakeEntity>, (...args: any[]) => void>(
                    context.modelMock.search,
                ).last();
                cb(null, newEntity);
            });

            const res = await crudext.searchElastic(elasticSearchOptions);

            verify(context.modelMock.search(elasticSearchOptions, anything())).called();

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(newEntity);
        });

        it('search for very complex entities entities', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const elasticSearchOptions: ESSearchQuery<FakeEntity> = {
                body: {},
            };

            const newEntity = {
                ids: [
                    {
                        name: 'hi',
                        current_id: uuid('86573c78-acd5-44d1-bf68-2c833aa9d65f'),
                    },
                    {
                        name: 'hi',
                        current_id: uuid('86573c78-acd5-44d1-bf68-2c833aa9d65f'),
                    },
                ],
                hmm: uuid('86573c78-acd5-44d1-bf68-2c833aa9d65f'),
            };

            when(context.modelMock.search(elasticSearchOptions, anything())).thenCall(() => {
                const [osef, cb] = capture<ESSearchQuery<FakeEntity>, (...args: any[]) => void>(
                    context.modelMock.search,
                ).last();
                cb(null, newEntity);
            });

            const res = await crudext.searchElastic(elasticSearchOptions);

            verify(context.modelMock.search(elasticSearchOptions, anything())).called();

            expect(res.error).toEqual(null);
            expect(typeof (res.response as any).ids[0].current_id).toEqual('string');
            expect(typeof (res.response as any).ids[1].current_id).toEqual('string');
            expect(typeof (res.response as any).hmm).toEqual('string');
            expect(res.response).toEqual(newEntity);
        });

        it('reports errors', async function() {
            when(context.modelMock._properties).thenReturn({
                schema: {
                    table_name: 'fake',
                    keyspace: 't721',
                    key: ['id'],
                    fields: {
                        id: {
                            type: 'uuid',
                        },
                        name: {
                            type: 'text',
                        },
                    },
                },
            });

            const crudext: CRUDExtension<Repository<FakeEntity>, FakeEntity> = new CRUDExtension<
                Repository<FakeEntity>,
                FakeEntity
            >(instance(context.modelMock), instance(context.repositoryMock), null, entityBuilder);

            const elasticSearchOptions: ESSearchQuery<FakeEntity> = {
                body: {},
            };

            when(context.modelMock.search(elasticSearchOptions, anything())).thenCall(() => {
                const [osef, cb] = capture<ESSearchQuery<FakeEntity>, (...args: any[]) => void>(
                    context.modelMock.search,
                ).last();
                cb(new Error('unexpected error'), null);
            });

            const res = await crudext.searchElastic(elasticSearchOptions);

            verify(context.modelMock.search(elasticSearchOptions, anything())).called();

            expect(res.error).toEqual('unexpected error');
            expect(res.response).toEqual(null);
        });
    });
});
