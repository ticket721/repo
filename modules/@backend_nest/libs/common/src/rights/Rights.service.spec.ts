import { RightsService } from '@lib/common/rights/Rights.service';
import { RightsRepository } from '@lib/common/rights/Rights.repository';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { ModuleRef } from '@nestjs/core';
import { deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { Test } from '@nestjs/testing';
import { getConnectionToken, getModelToken } from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';
import { RightEntity } from '@lib/common/rights/entities/Right.entity';
import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ESSearchReturn } from '@lib/common/utils/ESSearchReturn.type';

class RightEntityMock {
    public _properties = null;

    search(options: EsSearchOptionsStatic, callback?: (err: any, ret: any) => void): void {
        return;
    }
}

class ConnectionMock {
    doBatchAsync(...args: any[]): Promise<any> {
        return null;
    }
}

class ModuleRefMock {
    async get(...arg: any[]): Promise<any> {
        return null;
    }
}

describe('Rights Service', function() {
    const context: {
        rightsService: RightsService;
        rightsRepositoryMock: RightsRepository;
        rightEntityMock: RightEntityMock;
        connectionMock: ConnectionMock;
        moduleRefMock: ModuleRefMock;
        crudServiceMock: CRUDExtension<any, any>;
    } = {
        rightsService: null,
        rightsRepositoryMock: null,
        rightEntityMock: null,
        connectionMock: null,
        moduleRefMock: null,
        crudServiceMock: null,
    };

    beforeEach(async function() {
        context.rightEntityMock = mock(RightEntityMock);
        when(context.rightEntityMock._properties).thenReturn({
            schema: {
                fields: {},
            },
        });
        context.rightsRepositoryMock = mock(RightsRepository);
        context.connectionMock = mock(ConnectionMock);
        context.moduleRefMock = mock(ModuleRefMock);
        context.crudServiceMock = mock(CRUDExtension);

        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: RightsRepository,
                    useValue: instance(context.rightsRepositoryMock),
                },
                {
                    provide: getModelToken(RightEntity),
                    useValue: instance(context.rightEntityMock),
                },
                {
                    provide: getConnectionToken(),
                    useValue: instance(context.connectionMock),
                },
                {
                    provide: ModuleRef,
                    useValue: instance(context.moduleRefMock),
                },
                RightsService,
            ],
        }).compile();

        context.rightsService = app.get<RightsService>(RightsService);
    });

    describe('hasGlobalRightsUpon', function() {
        it('should check for global rights', async function() {
            const entityName = 'entity';

            const entityValue = 'entity_value';

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights: Partial<RightEntity>[] = [
                {
                    rights: {
                        owner: true,
                    },
                },
            ];

            when(context.crudServiceMock.name).thenReturn(entityName);

            when(
                context.moduleRefMock.get(
                    `@rights/${entityName}`,
                    deepEqual({
                        strict: false,
                    }),
                ),
            ).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
                public: {
                    public: true,
                },
            });

            const serviceSpy = spy(context.rightsService);

            when(
                serviceSpy.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_value: entityValue,
                        entity_type: entityName,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: rights as RightEntity[],
            });

            const res = await context.rightsService.hasGlobalRightsUpon(
                instance(context.crudServiceMock),
                user,
                entityValue,
                ['owner'],
            );

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(null);

            verify(context.crudServiceMock.name).called();

            verify(
                context.moduleRefMock.get(
                    `@rights/${entityName}`,
                    deepEqual({
                        strict: false,
                    }),
                ),
            ).called();

            verify(
                serviceSpy.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_value: entityValue,
                        entity_type: entityName,
                    }),
                ),
            ).called();
        });

        it('should fail on rights config fetch fail', async function() {
            const entityName = 'entity';

            const entityValue = 'entity_value';

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights: Partial<RightEntity>[] = [
                {
                    rights: {
                        owner: true,
                    },
                },
            ];

            when(context.crudServiceMock.name).thenReturn(entityName);

            when(
                context.moduleRefMock.get(
                    `@rights/${entityName}`,
                    deepEqual({
                        strict: false,
                    }),
                ),
            ).thenThrow(new Error('unexpected_error'));

            const res = await context.rightsService.hasGlobalRightsUpon(
                instance(context.crudServiceMock),
                user,
                entityValue,
                ['owner'],
            );

            expect(res.error).toEqual('cannot_find_config');
            expect(res.response).toEqual(null);

            verify(context.crudServiceMock.name).called();

            verify(
                context.moduleRefMock.get(
                    `@rights/${entityName}`,
                    deepEqual({
                        strict: false,
                    }),
                ),
            ).called();
        });

        it('should return on public right', async function() {
            const entityName = 'entity';

            const entityValue = 'entity_value';

            const user = {
                id: 'user_id',
            } as UserDto;

            when(context.crudServiceMock.name).thenReturn(entityName);

            when(
                context.moduleRefMock.get(
                    `@rights/${entityName}`,
                    deepEqual({
                        strict: false,
                    }),
                ),
            ).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
                public: {
                    public: true,
                },
            });

            const res = await context.rightsService.hasGlobalRightsUpon(
                instance(context.crudServiceMock),
                user,
                entityValue,
                ['public'],
            );

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(null);

            verify(context.crudServiceMock.name).called();

            verify(
                context.moduleRefMock.get(
                    `@rights/${entityName}`,
                    deepEqual({
                        strict: false,
                    }),
                ),
            ).called();
        });

        it('should fail on rights query error', async function() {
            const entityName = 'entity';

            const entityValue = 'entity_value';

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights: Partial<RightEntity>[] = [
                {
                    rights: {
                        owner: true,
                    },
                },
            ];

            when(context.crudServiceMock.name).thenReturn(entityName);

            when(
                context.moduleRefMock.get(
                    `@rights/${entityName}`,
                    deepEqual({
                        strict: false,
                    }),
                ),
            ).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
                public: {
                    public: true,
                },
            });

            const serviceSpy = spy(context.rightsService);

            when(
                serviceSpy.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_value: entityValue,
                        entity_type: entityName,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.rightsService.hasGlobalRightsUpon(
                instance(context.crudServiceMock),
                user,
                entityValue,
                ['owner'],
            );

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(context.crudServiceMock.name).called();

            verify(
                context.moduleRefMock.get(
                    `@rights/${entityName}`,
                    deepEqual({
                        strict: false,
                    }),
                ),
            ).called();

            verify(
                serviceSpy.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_value: entityValue,
                        entity_type: entityName,
                    }),
                ),
            ).called();
        });

        it('should fail on empty rights query', async function() {
            const entityName = 'entity';

            const entityValue = 'entity_value';

            const user = {
                id: 'user_id',
            } as UserDto;

            when(context.crudServiceMock.name).thenReturn(entityName);

            when(
                context.moduleRefMock.get(
                    `@rights/${entityName}`,
                    deepEqual({
                        strict: false,
                    }),
                ),
            ).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
                public: {
                    public: true,
                },
            });

            const serviceSpy = spy(context.rightsService);

            when(
                serviceSpy.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_value: entityValue,
                        entity_type: entityName,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            const res = await context.rightsService.hasGlobalRightsUpon(
                instance(context.crudServiceMock),
                user,
                entityValue,
                ['owner'],
            );

            expect(res.error).toEqual('rights_not_found');
            expect(res.response).toEqual(null);

            verify(context.crudServiceMock.name).called();

            verify(
                context.moduleRefMock.get(
                    `@rights/${entityName}`,
                    deepEqual({
                        strict: false,
                    }),
                ),
            ).called();

            verify(
                serviceSpy.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_value: entityValue,
                        entity_type: entityName,
                    }),
                ),
            ).called();
        });

        it('should as unauthorized', async function() {
            const entityName = 'entity';

            const entityValue = 'entity_value';

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights: Partial<RightEntity>[] = [
                {
                    rights: {
                        public: true,
                    },
                },
            ];

            when(context.crudServiceMock.name).thenReturn(entityName);

            when(
                context.moduleRefMock.get(
                    `@rights/${entityName}`,
                    deepEqual({
                        strict: false,
                    }),
                ),
            ).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
                public: {
                    public: true,
                },
            });

            const serviceSpy = spy(context.rightsService);

            when(
                serviceSpy.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_value: entityValue,
                        entity_type: entityName,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: rights as RightEntity[],
            });

            const res = await context.rightsService.hasGlobalRightsUpon(
                instance(context.crudServiceMock),
                user,
                entityValue,
                ['owner'],
            );

            expect(res.error).toEqual('unauthorized');
            expect(res.response).toEqual(null);

            verify(context.crudServiceMock.name).called();

            verify(
                context.moduleRefMock.get(
                    `@rights/${entityName}`,
                    deepEqual({
                        strict: false,
                    }),
                ),
            ).called();

            verify(
                serviceSpy.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_value: entityValue,
                        entity_type: entityName,
                    }),
                ),
            ).called();
        });
    });

    describe('hasRightsUpon', function() {
        it('should check rights upon specific entity', async function() {
            const entityName = 'entity';

            const query = {
                id: 'entity_id',
            };

            const entity = {
                id: 'entity_id',
                field: 'entity_value',
            };

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights: Partial<RightEntity>[] = [
                {
                    rights: {
                        owner: true,
                    },
                },
            ];

            const field = 'field';

            when(context.crudServiceMock.name).thenReturn(entityName);

            when(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
                public: {
                    public: true,
                },
            });

            when(context.crudServiceMock.search(deepEqual(query))).thenResolve({
                error: null,
                response: [entity],
            });

            const serviceSpy = spy(context.rightsService);
            when(
                serviceSpy.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entity[field],
                    }),
                ),
            ).thenResolve({
                error: null,
                response: rights as RightEntity[],
            });

            const res = await context.rightsService.hasRightsUpon(
                instance(context.crudServiceMock),
                user,
                query,
                field,
                ['owner'],
            );

            expect(res.error).toEqual(null);
            expect(res.response).toEqual([entity]);

            verify(context.crudServiceMock.name).called();

            verify(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).called();

            verify(context.crudServiceMock.search(deepEqual(query))).called();

            verify(
                serviceSpy.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entity[field],
                    }),
                ),
            ).called();
        });

        it('should check public rights', async function() {
            const entityName = 'entity';

            const query = {
                id: 'entity_id',
            };

            const entity = {
                id: 'entity_id',
                field: 'entity_value',
            };

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights: Partial<RightEntity>[] = [
                {
                    rights: {
                        owner: true,
                    },
                },
            ];

            const field = 'field';

            when(context.crudServiceMock.name).thenReturn(entityName);

            when(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
                public: {
                    public: true,
                },
            });

            const res = await context.rightsService.hasRightsUpon(
                instance(context.crudServiceMock),
                user,
                query,
                field,
                ['public'],
            );

            expect(res.error).toEqual(null);
            expect(res.response).toEqual([]);

            verify(context.crudServiceMock.name).called();

            verify(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).called();
        });

        it('should fail on rights fetch error', async function() {
            const entityName = 'entity';

            const query = {
                id: 'entity_id',
            };

            const entity = {
                id: 'entity_id',
                field: 'entity_value',
            };

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights: Partial<RightEntity>[] = [
                {
                    rights: {
                        owner: true,
                    },
                },
            ];

            const field = 'field';

            when(context.crudServiceMock.name).thenReturn(entityName);

            when(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).thenThrow(
                new Error('unexpected_error'),
            );

            const res = await context.rightsService.hasRightsUpon(
                instance(context.crudServiceMock),
                user,
                query,
                field,
                ['owner'],
            );

            expect(res.error).toEqual('cannot_find_config');
            expect(res.response).toEqual(null);

            verify(context.crudServiceMock.name).called();

            verify(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).called();
        });

        it('should fail on entity search error', async function() {
            const entityName = 'entity';

            const query = {
                id: 'entity_id',
            };

            const entity = {
                id: 'entity_id',
                field: 'entity_value',
            };

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights: Partial<RightEntity>[] = [
                {
                    rights: {
                        owner: true,
                    },
                },
            ];

            const field = 'field';

            when(context.crudServiceMock.name).thenReturn(entityName);

            when(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
                public: {
                    public: true,
                },
            });

            when(context.crudServiceMock.search(deepEqual(query))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.rightsService.hasRightsUpon(
                instance(context.crudServiceMock),
                user,
                query,
                field,
                ['owner'],
            );

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(context.crudServiceMock.name).called();

            verify(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).called();

            verify(context.crudServiceMock.search(deepEqual(query))).called();
        });

        it('should fail on entity not found', async function() {
            const entityName = 'entity';

            const query = {
                id: 'entity_id',
            };

            const entity = {
                id: 'entity_id',
                field: 'entity_value',
            };

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights: Partial<RightEntity>[] = [
                {
                    rights: {
                        owner: true,
                    },
                },
            ];

            const field = 'field';

            when(context.crudServiceMock.name).thenReturn(entityName);

            when(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
                public: {
                    public: true,
                },
            });

            when(context.crudServiceMock.search(deepEqual(query))).thenResolve({
                error: null,
                response: [],
            });

            const res = await context.rightsService.hasRightsUpon(
                instance(context.crudServiceMock),
                user,
                query,
                field,
                ['owner'],
            );

            expect(res.error).toEqual('entity_not_found');
            expect(res.response).toEqual(null);

            verify(context.crudServiceMock.name).called();

            verify(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).called();

            verify(context.crudServiceMock.search(deepEqual(query))).called();
        });

        it('should fail on rights query error', async function() {
            const entityName = 'entity';

            const query = {
                id: 'entity_id',
            };

            const entity = {
                id: 'entity_id',
                field: 'entity_value',
            };

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights: Partial<RightEntity>[] = [
                {
                    rights: {
                        owner: true,
                    },
                },
            ];

            const field = 'field';

            when(context.crudServiceMock.name).thenReturn(entityName);

            when(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
                public: {
                    public: true,
                },
            });

            when(context.crudServiceMock.search(deepEqual(query))).thenResolve({
                error: null,
                response: [entity],
            });

            const serviceSpy = spy(context.rightsService);
            when(
                serviceSpy.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entity[field],
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.rightsService.hasRightsUpon(
                instance(context.crudServiceMock),
                user,
                query,
                field,
                ['owner'],
            );

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(context.crudServiceMock.name).called();

            verify(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).called();

            verify(context.crudServiceMock.search(deepEqual(query))).called();

            verify(
                serviceSpy.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entity[field],
                    }),
                ),
            ).called();
        });

        it('should fail on empty rights query', async function() {
            const entityName = 'entity';

            const query = {
                id: 'entity_id',
            };

            const entity = {
                id: 'entity_id',
                field: 'entity_value',
            };

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights: Partial<RightEntity>[] = [
                {
                    rights: {
                        owner: true,
                    },
                },
            ];

            const field = 'field';

            when(context.crudServiceMock.name).thenReturn(entityName);

            when(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
                public: {
                    public: true,
                },
            });

            when(context.crudServiceMock.search(deepEqual(query))).thenResolve({
                error: null,
                response: [entity],
            });

            const serviceSpy = spy(context.rightsService);
            when(
                serviceSpy.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entity[field],
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            const res = await context.rightsService.hasRightsUpon(
                instance(context.crudServiceMock),
                user,
                query,
                field,
                ['owner'],
            );

            expect(res.error).toEqual('rights_not_found');
            expect(res.response).toEqual(null);

            verify(context.crudServiceMock.name).called();

            verify(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).called();

            verify(context.crudServiceMock.search(deepEqual(query))).called();

            verify(
                serviceSpy.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entity[field],
                    }),
                ),
            ).called();
        });

        it('should fail on unauthorized', async function() {
            const entityName = 'entity';

            const query = {
                id: 'entity_id',
            };

            const entity = {
                id: 'entity_id',
                field: 'entity_value',
            };

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights: Partial<RightEntity>[] = [
                {
                    rights: {
                        public: true,
                    },
                },
            ];

            const field = 'field';

            when(context.crudServiceMock.name).thenReturn(entityName);

            when(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
                public: {
                    public: true,
                },
            });

            when(context.crudServiceMock.search(deepEqual(query))).thenResolve({
                error: null,
                response: [entity],
            });

            const serviceSpy = spy(context.rightsService);
            when(
                serviceSpy.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entity[field],
                    }),
                ),
            ).thenResolve({
                error: null,
                response: rights as RightEntity[],
            });

            const res = await context.rightsService.hasRightsUpon(
                instance(context.crudServiceMock),
                user,
                query,
                field,
                ['owner'],
            );

            expect(res.error).toEqual('unauthorized');
            expect(res.response).toEqual(null);

            verify(context.crudServiceMock.name).called();

            verify(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).called();

            verify(context.crudServiceMock.search(deepEqual(query))).called();

            verify(
                serviceSpy.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entity[field],
                    }),
                ),
            ).called();
        });
    });

    describe('addRights', function() {
        it('should add rights to specific entity', async function() {
            const entityName = 'entity';
            const entityValue = 'entity_value';

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights = {
                owner: true,
            };

            when(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
            });

            const spiedService = spy(context.rightsService);

            when(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
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
                                                entity_value: entityValue,
                                            },
                                        },
                                        {
                                            nested: {
                                                path: 'rights',
                                                query: {
                                                    bool: {
                                                        must: {
                                                            term: {
                                                                [`rights.owner`]: true,
                                                            },
                                                        },
                                                    },
                                                },
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
                    },
                } as ESSearchReturn<any>,
            });

            when(
                spiedService.dryCreate(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                        rights,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'query',
                    params: [],
                },
            });

            when(
                context.connectionMock.doBatchAsync(
                    deepEqual([
                        {
                            query: 'query',
                            params: [],
                        },
                    ]),
                ),
            ).thenResolve('res');

            const res = await context.rightsService.addRights(user, [
                {
                    entity: entityName,
                    entityValue: entityValue,
                    rights,
                },
            ]);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual('res');

            verify(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).called();

            verify(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
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
                                                entity_value: entityValue,
                                            },
                                        },
                                        {
                                            nested: {
                                                path: 'rights',
                                                query: {
                                                    bool: {
                                                        must: {
                                                            term: {
                                                                [`rights.owner`]: true,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).called();

            verify(
                spiedService.dryCreate(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                        rights,
                    }),
                ),
            ).called();

            verify(
                context.connectionMock.doBatchAsync(
                    deepEqual([
                        {
                            query: 'query',
                            params: [],
                        },
                    ]),
                ),
            ).called();
        });

        it('should add rights without count limit', async function() {
            const entityName = 'entity';
            const entityValue = 'entity_value';

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights = {
                owner: true,
            };

            when(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).thenResolve({
                owner: {
                    can_edit_rights: true,
                },
            });

            const spiedService = spy(context.rightsService);

            when(
                spiedService.dryCreate(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                        rights,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'query',
                    params: [],
                },
            });

            when(
                context.connectionMock.doBatchAsync(
                    deepEqual([
                        {
                            query: 'query',
                            params: [],
                        },
                    ]),
                ),
            ).thenResolve('res');

            const res = await context.rightsService.addRights(user, [
                {
                    entity: entityName,
                    entityValue: entityValue,
                    rights,
                },
            ]);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual('res');

            verify(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).called();

            verify(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
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
                                                entity_value: entityValue,
                                            },
                                        },
                                        {
                                            nested: {
                                                path: 'rights',
                                                query: {
                                                    bool: {
                                                        must: {
                                                            term: {
                                                                [`rights.owner`]: true,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).never();

            verify(
                spiedService.dryCreate(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                        rights,
                    }),
                ),
            ).called();

            verify(
                context.connectionMock.doBatchAsync(
                    deepEqual([
                        {
                            query: 'query',
                            params: [],
                        },
                    ]),
                ),
            ).called();
        });

        it('should fail on config fetch error', async function() {
            const entityName = 'entity';
            const entityValue = 'entity_value';

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights = {
                owner: true,
            };

            when(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).thenReject(
                new Error('unexpected_error'),
            );

            const res = await context.rightsService.addRights(user, [
                {
                    entity: entityName,
                    entityValue: entityValue,
                    rights,
                },
            ]);

            expect(res.error).toEqual('cannot_find_config');
            expect(res.response).toEqual(null);

            verify(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).called();
        });

        it('should fail on unknown right added', async function() {
            const entityName = 'entity';
            const entityValue = 'entity_value';

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights = {
                unknown: true,
            };

            when(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
            });

            const res = await context.rightsService.addRights(user, [
                {
                    entity: entityName,
                    entityValue: entityValue,
                    rights,
                },
            ]);

            expect(res.error).toEqual('unknown_right');
            expect(res.response).toEqual(null);

            verify(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).called();
        });

        it('should fail on count conflit fetch error', async function() {
            const entityName = 'entity';
            const entityValue = 'entity_value';

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights = {
                owner: true,
            };

            when(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
            });

            const spiedService = spy(context.rightsService);

            when(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
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
                                                entity_value: entityValue,
                                            },
                                        },
                                        {
                                            nested: {
                                                path: 'rights',
                                                query: {
                                                    bool: {
                                                        must: {
                                                            term: {
                                                                [`rights.owner`]: true,
                                                            },
                                                        },
                                                    },
                                                },
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

            const res = await context.rightsService.addRights(user, [
                {
                    entity: entityName,
                    entityValue: entityValue,
                    rights,
                },
            ]);

            expect(res.error).toEqual('internal_fetch_error');
            expect(res.response).toEqual(null);

            verify(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).called();

            verify(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
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
                                                entity_value: entityValue,
                                            },
                                        },
                                        {
                                            nested: {
                                                path: 'rights',
                                                query: {
                                                    bool: {
                                                        must: {
                                                            term: {
                                                                [`rights.owner`]: true,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).called();
        });

        it('should fail on existing count conflict', async function() {
            const entityName = 'entity';
            const entityValue = 'entity_value';

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights = {
                owner: true,
            };

            when(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
            });

            const spiedService = spy(context.rightsService);

            when(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
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
                                                entity_value: entityValue,
                                            },
                                        },
                                        {
                                            nested: {
                                                path: 'rights',
                                                query: {
                                                    bool: {
                                                        must: {
                                                            term: {
                                                                [`rights.owner`]: true,
                                                            },
                                                        },
                                                    },
                                                },
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
                    },
                } as ESSearchReturn<any>,
            });

            const res = await context.rightsService.addRights(user, [
                {
                    entity: entityName,
                    entityValue: entityValue,
                    rights,
                },
            ]);

            expect(res.error).toEqual('maximum_right_count_reached');
            expect(res.response).toEqual(null);

            verify(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).called();

            verify(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
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
                                                entity_value: entityValue,
                                            },
                                        },
                                        {
                                            nested: {
                                                path: 'rights',
                                                query: {
                                                    bool: {
                                                        must: {
                                                            term: {
                                                                [`rights.owner`]: true,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).called();
        });

        it('should fail on dry creation error', async function() {
            const entityName = 'entity';
            const entityValue = 'entity_value';

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights = {
                owner: true,
            };

            when(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
            });

            const spiedService = spy(context.rightsService);

            when(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
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
                                                entity_value: entityValue,
                                            },
                                        },
                                        {
                                            nested: {
                                                path: 'rights',
                                                query: {
                                                    bool: {
                                                        must: {
                                                            term: {
                                                                [`rights.owner`]: true,
                                                            },
                                                        },
                                                    },
                                                },
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
                    },
                } as ESSearchReturn<any>,
            });

            when(
                spiedService.dryCreate(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                        rights,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.rightsService.addRights(user, [
                {
                    entity: entityName,
                    entityValue: entityValue,
                    rights,
                },
            ]);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).called();

            verify(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
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
                                                entity_value: entityValue,
                                            },
                                        },
                                        {
                                            nested: {
                                                path: 'rights',
                                                query: {
                                                    bool: {
                                                        must: {
                                                            term: {
                                                                [`rights.owner`]: true,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).called();

            verify(
                spiedService.dryCreate(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                        rights,
                    }),
                ),
            ).called();
        });

        it('should fail on batched query error', async function() {
            const entityName = 'entity';
            const entityValue = 'entity_value';

            const user = {
                id: 'user_id',
            } as UserDto;

            const rights = {
                owner: true,
            };

            when(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).thenResolve({
                owner: {
                    count: 1,
                    can_edit_rights: true,
                },
            });

            const spiedService = spy(context.rightsService);

            when(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
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
                                                entity_value: entityValue,
                                            },
                                        },
                                        {
                                            nested: {
                                                path: 'rights',
                                                query: {
                                                    bool: {
                                                        must: {
                                                            term: {
                                                                [`rights.owner`]: true,
                                                            },
                                                        },
                                                    },
                                                },
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
                    },
                } as ESSearchReturn<any>,
            });

            when(
                spiedService.dryCreate(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                        rights,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'query',
                    params: [],
                },
            });

            when(
                context.connectionMock.doBatchAsync(
                    deepEqual([
                        {
                            query: 'query',
                            params: [],
                        },
                    ]),
                ),
            ).thenReject(new Error('unexpected_error'));

            const res = await context.rightsService.addRights(user, [
                {
                    entity: entityName,
                    entityValue: entityValue,
                    rights,
                },
            ]);

            expect(res.error).toEqual('internal_batch_query_error');
            expect(res.response).toEqual(null);

            verify(context.moduleRefMock.get(`@rights/${entityName}`, deepEqual({ strict: false }))).called();

            verify(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
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
                                                entity_value: entityValue,
                                            },
                                        },
                                        {
                                            nested: {
                                                path: 'rights',
                                                query: {
                                                    bool: {
                                                        must: {
                                                            term: {
                                                                [`rights.owner`]: true,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    }),
                ),
            ).called();

            verify(
                spiedService.dryCreate(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                        rights,
                    }),
                ),
            ).called();

            verify(
                context.connectionMock.doBatchAsync(
                    deepEqual([
                        {
                            query: 'query',
                            params: [],
                        },
                    ]),
                ),
            ).called();
        });
    });
});
