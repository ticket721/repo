import { InputLink, MetadataInput, MetadatasService, MetaRightMode } from '@lib/common/metadatas/Metadatas.service';
import { MetadatasRepository } from '@lib/common/metadatas/Metadatas.repository';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { RightsService } from '@lib/common/rights/Rights.service';
import { deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';
import { RightEntity } from '@lib/common/rights/entities/Right.entity';
import { MetadataEntity } from '@lib/common/metadatas/entities/Metadata.entity';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { ESSearchReturn } from '@lib/common/utils/ESSearchReturn.type';
import { Link } from '@lib/common/utils/Link.type';

class MetadataEntityMock {
    public _properties = null;

    search(options: EsSearchOptionsStatic, callback?: (err: any, ret: any) => void): void {
        return;
    }
}

describe('Metadatas Service', function() {
    const context: {
        metadatasService: MetadatasService;
        metadatasRepositoryMock: MetadatasRepository;
        metadataEntityMock: MetadataEntityMock;
        rightsServiceMock: RightsService;
    } = {
        metadatasService: null,
        metadatasRepositoryMock: null,
        metadataEntityMock: null,
        rightsServiceMock: null,
    };

    beforeEach(async function() {
        context.metadatasRepositoryMock = mock(MetadatasRepository);
        context.metadataEntityMock = mock(MetadataEntityMock);
        context.rightsServiceMock = mock(RightsService);

        when(context.metadataEntityMock._properties).thenReturn({
            schema: {
                fields: {},
            },
        });

        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: MetadatasRepository,
                    useValue: instance(context.metadatasRepositoryMock),
                },
                {
                    provide: getModelToken(MetadataEntity),
                    useValue: instance(context.metadataEntityMock),
                },
                {
                    provide: RightsService,
                    useValue: instance(context.rightsServiceMock),
                },
                MetadatasService,
            ],
        }).compile();

        context.metadatasService = app.get<MetadatasService>(MetadatasService);
    });

    describe('hasMetaRight', function() {
        it('should validate user rights', async function() {
            const entityName = 'event';
            const entityValue = '0xabcdgroupid';
            const user = {
                id: 'userid',
            } as UserDto;
            const mode = MetaRightMode.MetaWrite;
            const className = 'history';

            const rightsConfig = {
                owner: {
                    countAs: ['admin'],
                },
                admin: {
                    countAs: ['metadata_all'],
                },
                metadata_all: {},
                metadata_write_all: {},
                metadata_read_all: {},
                metadata_write_history: {},
                metadata_read_history: {},
            };

            const rightEntity: RightEntity = ({
                grantee_id: user.id,
                entity_type: entityName,
                entity_value: entityValue,
                rights: {
                    owner: true,
                },
            } as any) as RightEntity;

            when(
                context.rightsServiceMock.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rightEntity],
            });

            when(context.rightsServiceMock.getRightsConfig(entityName)).thenResolve({
                error: null,
                response: rightsConfig,
            });

            when(context.rightsServiceMock.getAllRights(deepEqual(rightsConfig), deepEqual(rightEntity))).thenResolve([
                'owner',
                'admin',
                'metadata_all',
            ]);

            const res = await context.metadatasService.hasMetaRight(entityName, entityValue, user, mode, className);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(true);

            verify(
                context.rightsServiceMock.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                    }),
                ),
            ).called();
            verify(context.rightsServiceMock.getRightsConfig(entityName)).called();
            verify(context.rightsServiceMock.getAllRights(deepEqual(rightsConfig), deepEqual(rightEntity))).called();
        });

        it('should fail on rights request error', async function() {
            const entityName = 'event';
            const entityValue = '0xabcdgroupid';
            const user = {
                id: 'userid',
            } as UserDto;
            const mode = MetaRightMode.MetaWrite;
            const className = 'history';

            const rightsConfig = {
                owner: {
                    countAs: ['admin'],
                },
                admin: {
                    countAs: ['metadata_all'],
                },
                metadata_all: {},
                metadata_write_all: {},
                metadata_read_all: {},
                metadata_write_history: {},
                metadata_read_history: {},
            };

            const rightEntity: RightEntity = ({
                grantee_id: user.id,
                entity_type: entityName,
                entity_value: entityValue,
                rights: {
                    owner: true,
                },
            } as any) as RightEntity;

            when(
                context.rightsServiceMock.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: [rightEntity],
            });
            const res = await context.metadatasService.hasMetaRight(entityName, entityValue, user, mode, className);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                context.rightsServiceMock.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                    }),
                ),
            ).called();
        });

        it('should fail on empty rights request', async function() {
            const entityName = 'event';
            const entityValue = '0xabcdgroupid';
            const user = {
                id: 'userid',
            } as UserDto;
            const mode = MetaRightMode.MetaWrite;
            const className = 'history';

            const rightsConfig = {
                owner: {
                    countAs: ['admin'],
                },
                admin: {
                    countAs: ['metadata_all'],
                },
                metadata_all: {},
                metadata_write_all: {},
                metadata_read_all: {},
                metadata_write_history: {},
                metadata_read_history: {},
            };

            const rightEntity: RightEntity = ({
                grantee_id: user.id,
                entity_type: entityName,
                entity_value: entityValue,
                rights: {
                    owner: true,
                },
            } as any) as RightEntity;

            when(
                context.rightsServiceMock.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            const res = await context.metadatasService.hasMetaRight(entityName, entityValue, user, mode, className);

            expect(res.error).toEqual('rights_not_found');
            expect(res.response).toEqual(null);

            verify(
                context.rightsServiceMock.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                    }),
                ),
            ).called();
        });

        it('should fail on rights config fetch error', async function() {
            const entityName = 'event';
            const entityValue = '0xabcdgroupid';
            const user = {
                id: 'userid',
            } as UserDto;
            const mode = MetaRightMode.MetaWrite;
            const className = 'history';

            const rightsConfig = {
                owner: {
                    countAs: ['admin'],
                },
                admin: {
                    countAs: ['metadata_all'],
                },
                metadata_all: {},
                metadata_write_all: {},
                metadata_read_all: {},
                metadata_write_history: {},
                metadata_read_history: {},
            };

            const rightEntity: RightEntity = ({
                grantee_id: user.id,
                entity_type: entityName,
                entity_value: entityValue,
                rights: {
                    owner: true,
                },
            } as any) as RightEntity;

            when(
                context.rightsServiceMock.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rightEntity],
            });

            when(context.rightsServiceMock.getRightsConfig(entityName)).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            when(context.rightsServiceMock.getAllRights(deepEqual(rightsConfig), deepEqual(rightEntity))).thenResolve([
                'owner',
                'admin',
                'metadata_all',
            ]);

            const res = await context.metadatasService.hasMetaRight(entityName, entityValue, user, mode, className);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                context.rightsServiceMock.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                    }),
                ),
            ).called();
            verify(context.rightsServiceMock.getRightsConfig(entityName)).called();
        });

        it('should not validate user without proper rights', async function() {
            const entityName = 'event';
            const entityValue = '0xabcdgroupid';
            const user = {
                id: 'userid',
            } as UserDto;
            const mode = MetaRightMode.MetaWrite;
            const className = 'history';

            const rightsConfig = {
                owner: {
                    countAs: ['admin'],
                },
                admin: {
                    countAs: ['metadata_all'],
                },
                metadata_all: {},
                metadata_write_all: {},
                metadata_read_all: {},
                metadata_write_history: {},
                metadata_read_history: {},
            };

            const rightEntity: RightEntity = ({
                grantee_id: user.id,
                entity_type: entityName,
                entity_value: entityValue,
                rights: {
                    owner: true,
                },
            } as any) as RightEntity;

            when(
                context.rightsServiceMock.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [rightEntity],
            });

            when(context.rightsServiceMock.getRightsConfig(entityName)).thenResolve({
                error: null,
                response: rightsConfig,
            });

            when(context.rightsServiceMock.getAllRights(deepEqual(rightsConfig), deepEqual(rightEntity))).thenResolve([
                'owner',
                'admin',
            ]);

            const res = await context.metadatasService.hasMetaRight(entityName, entityValue, user, mode, className);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual(false);

            verify(
                context.rightsServiceMock.search(
                    deepEqual({
                        grantee_id: user.id,
                        entity_type: entityName,
                        entity_value: entityValue,
                    }),
                ),
            ).called();
            verify(context.rightsServiceMock.getRightsConfig(entityName)).called();
            verify(context.rightsServiceMock.getAllRights(deepEqual(rightsConfig), deepEqual(rightEntity))).called();
        });
    });

    describe('attach', function() {
        it('should attach metadata to entity', async function() {
            const className = 'history';
            const typeName = 'create';
            const links: InputLink[] = [
                {
                    type: 'event',
                    id: '0xid',
                    field: 'id',
                },
            ];
            const readers: InputLink[] = [
                {
                    type: 'event',
                    id: '0xgroup_id_read',
                    field: 'group_id',
                },
                {
                    type: 'user',
                    id: 'userid',
                    field: 'id',
                },
            ];
            const writers: InputLink[] = [
                {
                    type: 'event',
                    id: 'event_id',
                    field: 'id',
                    rightId: '0xgroup_id_write',
                    rightField: 'group_id',
                },
            ];

            const data: MetadataInput = {
                bool: {
                    value: true,
                },
                date: {
                    at: new Date(Date.now()),
                },
            };

            const user = {
                id: 'userid',
            } as UserDto;

            const service = mock(CRUDExtension);
            const spiedService = spy(context.metadatasService);

            when(
                spiedService.hasMetaRight(
                    links[0].type,
                    links[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: true,
            });

            when(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: true,
            });

            when(
                spiedService.hasMetaRight(
                    writers[0].type,
                    writers[0].rightId,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: true,
            });

            when(
                service.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            id: 'event_id',
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
                        hits: [
                            {
                                _source: {
                                    group_id: '0xgroup_id_write',
                                },
                            },
                        ],
                    },
                } as ESSearchReturn<any>,
            });

            when(
                spiedService.create(
                    deepEqual({
                        links,
                        readers,
                        public_read: false,
                        writers,
                        public_write: false,
                        class_name: className,
                        type_name: typeName,
                        bool_: data.bool,
                        str_: data.str,
                        int_: data.int,
                        date_: data.date,
                        double_: data.double,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    id: 'metadataid',
                    links,
                    readers,
                    public_read: false,
                    writers,
                    public_write: false,
                    class_name: className,
                    type_name: typeName,
                    bool_: data.bool,
                    str_: data.str,
                    int_: data.int,
                    date_: data.date,
                    double_: data.double,
                } as MetadataEntity,
            });

            const res = await context.metadatasService.attach(
                className,
                typeName,
                links,
                readers,
                writers,
                data,
                user,
                instance(service),
            );

            expect(res.error).toEqual(null);
            expect(res.response).toEqual({
                id: 'metadataid',
                links,
                readers,
                public_read: false,
                writers,
                public_write: false,
                class_name: className,
                type_name: typeName,
                bool_: data.bool,
                str_: data.str,
                int_: data.int,
                date_: data.date,
                double_: data.double,
            });

            verify(
                spiedService.hasMetaRight(
                    links[0].type,
                    links[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).called();

            verify(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).called();

            verify(
                spiedService.hasMetaRight(
                    writers[0].type,
                    writers[0].rightId,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).called();

            verify(
                service.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            id: 'event_id',
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).called();

            verify(
                spiedService.create(
                    deepEqual({
                        links,
                        readers,
                        public_read: false,
                        writers,
                        public_write: false,
                        class_name: className,
                        type_name: typeName,
                        bool_: data.bool,
                        str_: data.str,
                        int_: data.int,
                        date_: data.date,
                        double_: data.double,
                    }),
                ),
            ).called();
        });

        it('should fail on invalid user linking', async function() {
            const className = 'history';
            const typeName = 'create';
            const links: InputLink[] = [
                {
                    type: 'event',
                    id: '0xid',
                    field: 'id',
                },
            ];
            const readers: InputLink[] = [
                {
                    type: 'event',
                    id: '0xgroup_id_read',
                    field: 'group_id',
                },
                {
                    type: 'user',
                    id: 'userid_wrong',
                    field: 'id',
                },
            ];
            const writers: InputLink[] = [
                {
                    type: 'event',
                    id: 'event_id',
                    field: 'id',
                    rightId: '0xgroup_id_write',
                    rightField: 'group_id',
                },
            ];

            const data: MetadataInput = {
                bool: {
                    value: true,
                },
                date: {
                    at: new Date(Date.now()),
                },
            };

            const user = {
                id: 'userid',
            } as UserDto;

            const service = mock(CRUDExtension);
            const spiedService = spy(context.metadatasService);

            when(
                spiedService.hasMetaRight(
                    links[0].type,
                    links[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: true,
            });

            when(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: true,
            });

            const res = await context.metadatasService.attach(
                className,
                typeName,
                links,
                readers,
                writers,
                data,
                user,
                instance(service),
            );

            expect(res.error).toEqual('unauthorized_user_reader_link');
            expect(res.response).toEqual(null);

            verify(
                spiedService.hasMetaRight(
                    links[0].type,
                    links[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).called();

            verify(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).called();
        });

        it('should fail on entity fetch error', async function() {
            const className = 'history';
            const typeName = 'create';
            const links: InputLink[] = [
                {
                    type: 'event',
                    id: '0xid',
                    field: 'id',
                },
            ];
            const readers: InputLink[] = [
                {
                    type: 'event',
                    id: '0xgroup_id_read',
                    field: 'group_id',
                },
                {
                    type: 'user',
                    id: 'userid',
                    field: 'id',
                },
            ];
            const writers: InputLink[] = [
                {
                    type: 'event',
                    id: 'event_id',
                    field: 'id',
                    rightId: '0xgroup_id_write',
                    rightField: 'group_id',
                },
            ];

            const data: MetadataInput = {
                bool: {
                    value: true,
                },
                date: {
                    at: new Date(Date.now()),
                },
            };

            const user = {
                id: 'userid',
            } as UserDto;

            const service = mock(CRUDExtension);
            const spiedService = spy(context.metadatasService);

            when(
                spiedService.hasMetaRight(
                    links[0].type,
                    links[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: true,
            });

            when(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: true,
            });

            when(
                service.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            id: 'event_id',
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

            const res = await context.metadatasService.attach(
                className,
                typeName,
                links,
                readers,
                writers,
                data,
                user,
                instance(service),
            );

            expect(res.error).toEqual('entity_query_error');
            expect(res.response).toEqual(null);

            verify(
                spiedService.hasMetaRight(
                    links[0].type,
                    links[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).called();

            verify(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).called();

            verify(
                service.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            id: 'event_id',
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).called();
        });

        it('should fail on invalid entity values found', async function() {
            const className = 'history';
            const typeName = 'create';
            const links: InputLink[] = [
                {
                    type: 'event',
                    id: '0xid',
                    field: 'id',
                },
            ];
            const readers: InputLink[] = [
                {
                    type: 'event',
                    id: '0xgroup_id_read',
                    field: 'group_id',
                },
                {
                    type: 'user',
                    id: 'userid',
                    field: 'id',
                },
            ];
            const writers: InputLink[] = [
                {
                    type: 'event',
                    id: 'event_id',
                    field: 'id',
                    rightId: '0xgroup_id_write',
                    rightField: 'group_id',
                },
            ];

            const data: MetadataInput = {
                bool: {
                    value: true,
                },
                date: {
                    at: new Date(Date.now()),
                },
            };

            const user = {
                id: 'userid',
            } as UserDto;

            const service = mock(CRUDExtension);
            const spiedService = spy(context.metadatasService);

            when(
                spiedService.hasMetaRight(
                    links[0].type,
                    links[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: true,
            });

            when(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: true,
            });

            when(
                service.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            id: 'event_id',
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
                        hits: [
                            {
                                _source: {
                                    group_id: '0xgroup_id_read',
                                },
                            },
                        ],
                    },
                } as ESSearchReturn<any>,
            });

            const res = await context.metadatasService.attach(
                className,
                typeName,
                links,
                readers,
                writers,
                data,
                user,
                instance(service),
            );

            expect(res.error).toEqual('unauthorized_link');
            expect(res.response).toEqual(null);

            verify(
                spiedService.hasMetaRight(
                    links[0].type,
                    links[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).called();

            verify(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).called();

            verify(
                service.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            id: 'event_id',
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).called();
        });

        it('should fail on entities not found', async function() {
            const className = 'history';
            const typeName = 'create';
            const links: InputLink[] = [
                {
                    type: 'event',
                    id: '0xid',
                    field: 'id',
                },
            ];
            const readers: InputLink[] = [
                {
                    type: 'event',
                    id: '0xgroup_id_read',
                    field: 'group_id',
                },
                {
                    type: 'user',
                    id: 'userid',
                    field: 'id',
                },
            ];
            const writers: InputLink[] = [
                {
                    type: 'event',
                    id: 'event_id',
                    field: 'id',
                    rightId: '0xgroup_id_write',
                    rightField: 'group_id',
                },
            ];

            const data: MetadataInput = {
                bool: {
                    value: true,
                },
                date: {
                    at: new Date(Date.now()),
                },
            };

            const user = {
                id: 'userid',
            } as UserDto;

            const service = mock(CRUDExtension);
            const spiedService = spy(context.metadatasService);

            when(
                spiedService.hasMetaRight(
                    links[0].type,
                    links[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: true,
            });

            when(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: true,
            });

            when(
                service.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            id: 'event_id',
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

            const res = await context.metadatasService.attach(
                className,
                typeName,
                links,
                readers,
                writers,
                data,
                user,
                instance(service),
            );

            expect(res.error).toEqual('entities_not_found');
            expect(res.response).toEqual(null);

            verify(
                spiedService.hasMetaRight(
                    links[0].type,
                    links[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).called();

            verify(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).called();

            verify(
                service.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            id: 'event_id',
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).called();
        });

        it('should fail on hasMetaRight error', async function() {
            const className = 'history';
            const typeName = 'create';
            const links: InputLink[] = [
                {
                    type: 'event',
                    id: '0xid',
                    field: 'id',
                },
            ];
            const readers: InputLink[] = [
                {
                    type: 'event',
                    id: '0xgroup_id_read',
                    field: 'group_id',
                },
                {
                    type: 'user',
                    id: 'userid',
                    field: 'id',
                },
            ];
            const writers: InputLink[] = [
                {
                    type: 'event',
                    id: 'event_id',
                    field: 'id',
                    rightId: '0xgroup_id_write',
                    rightField: 'group_id',
                },
            ];

            const data: MetadataInput = {
                bool: {
                    value: true,
                },
                date: {
                    at: new Date(Date.now()),
                },
            };

            const user = {
                id: 'userid',
            } as UserDto;

            const service = mock(CRUDExtension);
            const spiedService = spy(context.metadatasService);

            when(
                spiedService.hasMetaRight(
                    links[0].type,
                    links[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.metadatasService.attach(
                className,
                typeName,
                links,
                readers,
                writers,
                data,
                user,
                instance(service),
            );

            expect(res.error).toEqual('unauthorized_entity_link_link');
            expect(res.response).toEqual(null);

            verify(
                spiedService.hasMetaRight(
                    links[0].type,
                    links[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).called();
        });

        it('should fail on hasMetaRight false', async function() {
            const className = 'history';
            const typeName = 'create';
            const links: InputLink[] = [
                {
                    type: 'event',
                    id: '0xid',
                    field: 'id',
                },
            ];
            const readers: InputLink[] = [
                {
                    type: 'event',
                    id: '0xgroup_id_read',
                    field: 'group_id',
                },
                {
                    type: 'user',
                    id: 'userid',
                    field: 'id',
                },
            ];
            const writers: InputLink[] = [
                {
                    type: 'event',
                    id: 'event_id',
                    field: 'id',
                    rightId: '0xgroup_id_write',
                    rightField: 'group_id',
                },
            ];

            const data: MetadataInput = {
                bool: {
                    value: true,
                },
                date: {
                    at: new Date(Date.now()),
                },
            };

            const user = {
                id: 'userid',
            } as UserDto;

            const service = mock(CRUDExtension);
            const spiedService = spy(context.metadatasService);

            when(
                spiedService.hasMetaRight(
                    links[0].type,
                    links[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: false,
            });

            const res = await context.metadatasService.attach(
                className,
                typeName,
                links,
                readers,
                writers,
                data,
                user,
                instance(service),
            );

            expect(res.error).toEqual('unauthorized_entity_link_link');
            expect(res.response).toEqual(null);

            verify(
                spiedService.hasMetaRight(
                    links[0].type,
                    links[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).called();
        });

        it('should fail on metadata entity creation error', async function() {
            const className = 'history';
            const typeName = 'create';
            const links: InputLink[] = [
                {
                    type: 'event',
                    id: '0xid',
                    field: 'id',
                },
            ];
            const readers: InputLink[] = [
                {
                    type: 'event',
                    id: '0xgroup_id_read',
                    field: 'group_id',
                },
                {
                    type: 'user',
                    id: 'userid',
                    field: 'id',
                },
            ];
            const writers: InputLink[] = [
                {
                    type: 'event',
                    id: 'event_id',
                    field: 'id',
                    rightId: '0xgroup_id_write',
                    rightField: 'group_id',
                },
            ];

            const data: MetadataInput = {
                bool: {
                    value: true,
                },
                date: {
                    at: new Date(Date.now()),
                },
            };

            const user = {
                id: 'userid',
            } as UserDto;

            const service = mock(CRUDExtension);
            const spiedService = spy(context.metadatasService);

            when(
                spiedService.hasMetaRight(
                    links[0].type,
                    links[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: true,
            });

            when(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: true,
            });

            when(
                spiedService.hasMetaRight(
                    writers[0].type,
                    writers[0].rightId,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: true,
            });

            when(
                service.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            id: 'event_id',
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
                        hits: [
                            {
                                _source: {
                                    group_id: '0xgroup_id_write',
                                },
                            },
                        ],
                    },
                } as ESSearchReturn<any>,
            });

            when(
                spiedService.create(
                    deepEqual({
                        links,
                        readers,
                        public_read: false,
                        writers,
                        public_write: false,
                        class_name: className,
                        type_name: typeName,
                        bool_: data.bool,
                        str_: data.str,
                        int_: data.int,
                        date_: data.date,
                        double_: data.double,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.metadatasService.attach(
                className,
                typeName,
                links,
                readers,
                writers,
                data,
                user,
                instance(service),
            );

            expect(res.error).toEqual('metadata_creation_error');
            expect(res.response).toEqual(null);

            verify(
                spiedService.hasMetaRight(
                    links[0].type,
                    links[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).called();

            verify(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).called();

            verify(
                spiedService.hasMetaRight(
                    writers[0].type,
                    writers[0].rightId,
                    deepEqual(user),
                    MetaRightMode.MetaWrite,
                    className,
                ),
            ).called();

            verify(
                service.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            id: 'event_id',
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).called();

            verify(
                spiedService.create(
                    deepEqual({
                        links,
                        readers,
                        public_read: false,
                        writers,
                        public_write: false,
                        class_name: className,
                        type_name: typeName,
                        bool_: data.bool,
                        str_: data.str,
                        int_: data.int,
                        date_: data.date,
                        double_: data.double,
                    }),
                ),
            ).called();
        });
    });

    describe('fetch', function() {
        it('should properly fetch metadata', async function() {
            const user = {
                id: 'userid',
            } as UserDto;

            const links: Link[] = [
                {
                    type: 'event',
                    id: 'eventid',
                    field: 'id',
                },
            ];

            const readers: Link[] = [
                {
                    type: 'event',
                    id: 'eventid',
                    field: 'id',
                },
            ];

            const className = 'history';

            const spiedService = spy(context.metadatasService);

            when(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaRead,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: true,
            });

            when(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: [
                                        {
                                            nested: {
                                                path: 'links',
                                                query: {
                                                    bool: {
                                                        must: [
                                                            {
                                                                term: {
                                                                    'links.type': 'event',
                                                                },
                                                            },
                                                            {
                                                                term: {
                                                                    'links.id': 'eventid',
                                                                },
                                                            },
                                                            {
                                                                term: {
                                                                    'links.field': 'id',
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            bool: {
                                                should: [
                                                    {
                                                        nested: {
                                                            path: 'readers',
                                                            query: {
                                                                bool: {
                                                                    must: [
                                                                        {
                                                                            term: {
                                                                                'readers.type': 'event',
                                                                            },
                                                                        },
                                                                        {
                                                                            term: {
                                                                                'readers.id': 'eventid',
                                                                            },
                                                                        },
                                                                        {
                                                                            term: {
                                                                                'readers.field': 'id',
                                                                            },
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                    {
                                                        term: {
                                                            public_read: true,
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            term: {
                                                class_name: 'history',
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
                                _source: {
                                    data: true,
                                },
                            },
                        ],
                    },
                } as ESSearchReturn<any>,
            });

            const res = await context.metadatasService.fetch(user, links, readers, className);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual([{ data: true }]);

            verify(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaRead,
                    className,
                ),
            ).called();

            verify(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: [
                                        {
                                            nested: {
                                                path: 'links',
                                                query: {
                                                    bool: {
                                                        must: [
                                                            {
                                                                term: {
                                                                    'links.type': 'event',
                                                                },
                                                            },
                                                            {
                                                                term: {
                                                                    'links.id': 'eventid',
                                                                },
                                                            },
                                                            {
                                                                term: {
                                                                    'links.field': 'id',
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            bool: {
                                                should: [
                                                    {
                                                        nested: {
                                                            path: 'readers',
                                                            query: {
                                                                bool: {
                                                                    must: [
                                                                        {
                                                                            term: {
                                                                                'readers.type': 'event',
                                                                            },
                                                                        },
                                                                        {
                                                                            term: {
                                                                                'readers.id': 'eventid',
                                                                            },
                                                                        },
                                                                        {
                                                                            term: {
                                                                                'readers.field': 'id',
                                                                            },
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                    {
                                                        term: {
                                                            public_read: true,
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            term: {
                                                class_name: 'history',
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

        it('should properly fetch metadata with typeName', async function() {
            const user = {
                id: 'userid',
            } as UserDto;

            const links: Link[] = [
                {
                    type: 'event',
                    id: 'eventid',
                    field: 'id',
                },
            ];

            const readers: Link[] = [
                {
                    type: 'event',
                    id: 'eventid',
                    field: 'id',
                },
            ];

            const className = 'history';
            const typeName = 'create';

            const spiedService = spy(context.metadatasService);

            when(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaRead,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: true,
            });

            when(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: [
                                        {
                                            nested: {
                                                path: 'links',
                                                query: {
                                                    bool: {
                                                        must: [
                                                            {
                                                                term: {
                                                                    'links.type': 'event',
                                                                },
                                                            },
                                                            {
                                                                term: {
                                                                    'links.id': 'eventid',
                                                                },
                                                            },
                                                            {
                                                                term: {
                                                                    'links.field': 'id',
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            bool: {
                                                should: [
                                                    {
                                                        nested: {
                                                            path: 'readers',
                                                            query: {
                                                                bool: {
                                                                    must: [
                                                                        {
                                                                            term: {
                                                                                'readers.type': 'event',
                                                                            },
                                                                        },
                                                                        {
                                                                            term: {
                                                                                'readers.id': 'eventid',
                                                                            },
                                                                        },
                                                                        {
                                                                            term: {
                                                                                'readers.field': 'id',
                                                                            },
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                    {
                                                        term: {
                                                            public_read: true,
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            term: {
                                                class_name: 'history',
                                            },
                                        },
                                        {
                                            term: {
                                                type_name: 'create',
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
                                _source: {
                                    data: true,
                                },
                            },
                        ],
                    },
                } as ESSearchReturn<any>,
            });

            const res = await context.metadatasService.fetch(user, links, readers, className, typeName);

            expect(res.error).toEqual(null);
            expect(res.response).toEqual([{ data: true }]);

            verify(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaRead,
                    className,
                ),
            ).called();

            verify(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: [
                                        {
                                            nested: {
                                                path: 'links',
                                                query: {
                                                    bool: {
                                                        must: [
                                                            {
                                                                term: {
                                                                    'links.type': 'event',
                                                                },
                                                            },
                                                            {
                                                                term: {
                                                                    'links.id': 'eventid',
                                                                },
                                                            },
                                                            {
                                                                term: {
                                                                    'links.field': 'id',
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            bool: {
                                                should: [
                                                    {
                                                        nested: {
                                                            path: 'readers',
                                                            query: {
                                                                bool: {
                                                                    must: [
                                                                        {
                                                                            term: {
                                                                                'readers.type': 'event',
                                                                            },
                                                                        },
                                                                        {
                                                                            term: {
                                                                                'readers.id': 'eventid',
                                                                            },
                                                                        },
                                                                        {
                                                                            term: {
                                                                                'readers.field': 'id',
                                                                            },
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                    {
                                                        term: {
                                                            public_read: true,
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            term: {
                                                class_name: 'history',
                                            },
                                        },
                                        {
                                            term: {
                                                type_name: 'create',
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

        it('should fail while trying to add rights', async function() {
            const user = {
                id: 'userid',
            } as UserDto;

            const links: Link[] = [
                {
                    type: 'event',
                    id: 'eventid',
                    field: 'id',
                },
            ];

            const readers: Link[] = [
                {
                    type: 'event',
                    id: 'eventid',
                    field: 'id',
                },
            ];

            const className = 'history';

            const spiedService = spy(context.metadatasService);

            when(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaRead,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: false,
            });

            const res = await context.metadatasService.fetch(user, links, readers, className);

            expect(res.error).toEqual('unauthorized_read_rights');
            expect(res.response).toEqual(null);

            verify(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaRead,
                    className,
                ),
            ).called();
        });

        it('should fail on es query error', async function() {
            const user = {
                id: 'userid',
            } as UserDto;

            const links: Link[] = [
                {
                    type: 'event',
                    id: 'eventid',
                    field: 'id',
                },
            ];

            const readers: Link[] = [
                {
                    type: 'event',
                    id: 'eventid',
                    field: 'id',
                },
            ];

            const className = 'history';

            const spiedService = spy(context.metadatasService);

            when(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaRead,
                    className,
                ),
            ).thenResolve({
                error: null,
                response: true,
            });

            when(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: [
                                        {
                                            nested: {
                                                path: 'links',
                                                query: {
                                                    bool: {
                                                        must: [
                                                            {
                                                                term: {
                                                                    'links.type': 'event',
                                                                },
                                                            },
                                                            {
                                                                term: {
                                                                    'links.id': 'eventid',
                                                                },
                                                            },
                                                            {
                                                                term: {
                                                                    'links.field': 'id',
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            bool: {
                                                should: [
                                                    {
                                                        nested: {
                                                            path: 'readers',
                                                            query: {
                                                                bool: {
                                                                    must: [
                                                                        {
                                                                            term: {
                                                                                'readers.type': 'event',
                                                                            },
                                                                        },
                                                                        {
                                                                            term: {
                                                                                'readers.id': 'eventid',
                                                                            },
                                                                        },
                                                                        {
                                                                            term: {
                                                                                'readers.field': 'id',
                                                                            },
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                    {
                                                        term: {
                                                            public_read: true,
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            term: {
                                                class_name: 'history',
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

            const res = await context.metadatasService.fetch(user, links, readers, className);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(
                spiedService.hasMetaRight(
                    readers[0].type,
                    readers[0].id,
                    deepEqual(user),
                    MetaRightMode.MetaRead,
                    className,
                ),
            ).called();

            verify(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: [
                                        {
                                            nested: {
                                                path: 'links',
                                                query: {
                                                    bool: {
                                                        must: [
                                                            {
                                                                term: {
                                                                    'links.type': 'event',
                                                                },
                                                            },
                                                            {
                                                                term: {
                                                                    'links.id': 'eventid',
                                                                },
                                                            },
                                                            {
                                                                term: {
                                                                    'links.field': 'id',
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        },
                                        {
                                            bool: {
                                                should: [
                                                    {
                                                        nested: {
                                                            path: 'readers',
                                                            query: {
                                                                bool: {
                                                                    must: [
                                                                        {
                                                                            term: {
                                                                                'readers.type': 'event',
                                                                            },
                                                                        },
                                                                        {
                                                                            term: {
                                                                                'readers.id': 'eventid',
                                                                            },
                                                                        },
                                                                        {
                                                                            term: {
                                                                                'readers.field': 'id',
                                                                            },
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                        },
                                                    },
                                                    {
                                                        term: {
                                                            public_read: true,
                                                        },
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            term: {
                                                class_name: 'history',
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
    });
});
