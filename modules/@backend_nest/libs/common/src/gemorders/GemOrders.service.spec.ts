import { GemOrdersService } from '@lib/common/gemorders/GemOrders.service';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { GemOrdersRepository } from '@lib/common/gemorders/GemOrders.repository';
import { anyNumber, anything, capture, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { Test } from '@nestjs/testing';
import { ESSearchReturn } from '@lib/common/utils/ESSearchReturn.type';
import { GemOrderEntity } from '@lib/common/gemorders/entities/GemOrder.entity';
import { types } from 'cassandra-driver';
import { keccak256 } from '@common/global';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { RightsService } from '@lib/common/rights/Rights.service';

class GemOrderEntityMock {
    public _properties = null;

    search(options: EsSearchOptionsStatic, callback?: (err: any, ret: any) => void): void {
        return;
    }
}

describe('GemOrders Service', function() {
    const context: {
        gemOrdersService: GemOrdersService;
        gemOrdersEntityMock: GemOrderEntityMock;
        gemOrdersRepositoryMock: GemOrdersRepository;
        rightsServiceMock: RightsService;
    } = {
        gemOrdersService: null,
        gemOrdersEntityMock: null,
        gemOrdersRepositoryMock: null,
        rightsServiceMock: null,
    };

    beforeEach(async function() {
        context.gemOrdersEntityMock = mock(GemOrderEntityMock);
        context.gemOrdersRepositoryMock = mock(GemOrdersRepository);
        when(context.gemOrdersEntityMock._properties).thenReturn({
            schema: {
                fields: {},
            },
        });
        context.rightsServiceMock = mock(RightsService);

        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: 'GemOrderEntityModel',
                    useValue: instance(context.gemOrdersEntityMock),
                },
                {
                    provide: GemOrdersRepository,
                    useValue: instance(context.gemOrdersRepositoryMock),
                },
                {
                    provide: RightsService,
                    useValue: instance(context.rightsServiceMock),
                },
                GemOrdersService,
            ],
        }).compile();

        context.gemOrdersService = app.get<GemOrdersService>(GemOrdersService);
    });

    describe('startGemOrder', function() {
        it('should prepare gem for circuit', async function() {
            const spiedService = spy(context.gemOrdersService);

            when(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            collision_id: anyNumber(),
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
                    },
                } as ESSearchReturn<GemOrderEntity>,
            });

            const collision = keccak256('a stripe payment id');
            const circuit = 'test';
            const user: UserDto = ({
                id: 'userid',
                address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
            } as any) as UserDto;

            const args = {
                initial: 'arguments',
            };

            when(
                spiedService.create(
                    deepEqual({
                        id: collision,
                        distribution_id: anything(),
                        circuit_name: circuit,
                        initial_arguments: JSON.stringify(args),
                        initialized: false,
                        refresh_timer: 1,
                    }),
                    deepEqual({
                        if_not_exist: true,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    id: collision,
                } as GemOrderEntity,
            });

            await context.gemOrdersService.startGemOrder(circuit, user.id, args, collision);

            const searchArgs = capture(spiedService.searchElastic).last();
            const id = searchArgs[0].body.query.bool.must.term.collision_id;

            verify(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            collision_id: id,
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
                        id: collision,
                        distribution_id: (types.Long as any).fromNumber(id),
                        circuit_name: circuit,
                        initial_arguments: JSON.stringify(args),
                        initialized: false,
                        refresh_timer: 1,
                    }),
                    deepEqual({
                        if_not_exist: true,
                    }),
                ),
            ).called();
        });

        it('should fail on collision query error', async function() {
            const spiedService = spy(context.gemOrdersService);

            when(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            collision_id: anyNumber(),
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

            const collision = keccak256('a stripe payment id');
            const circuit = 'test';
            const user: UserDto = ({
                id: 'userid',
                address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
            } as any) as UserDto;

            const args = {
                initial: 'arguments',
            };

            const res = await context.gemOrdersService.startGemOrder(circuit, user.id, args, collision);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            const searchArgs = capture(spiedService.searchElastic).last();
            const id = searchArgs[0].body.query.bool.must.term.collision_id;

            verify(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            collision_id: id,
                                        },
                                    },
                                },
                            },
                        },
                    }),
                ),
            ).called();
        });

        it('should fail creation query error', async function() {
            const spiedService = spy(context.gemOrdersService);

            when(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            collision_id: anyNumber(),
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
                    },
                } as ESSearchReturn<GemOrderEntity>,
            });

            const collision = keccak256('a stripe payment id');
            const circuit = 'test';
            const user: UserDto = ({
                id: 'userid',
                address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
            } as any) as UserDto;

            const args = {
                initial: 'arguments',
            };

            when(
                spiedService.create(
                    deepEqual({
                        id: collision,
                        distribution_id: anything(),
                        circuit_name: circuit,
                        initial_arguments: JSON.stringify(args),
                        initialized: false,
                        refresh_timer: 1,
                    }),
                    deepEqual({
                        if_not_exist: true,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.gemOrdersService.startGemOrder(circuit, user.id, args, collision);

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            const searchArgs = capture(spiedService.searchElastic).last();
            const id = searchArgs[0].body.query.bool.must.term.collision_id;

            verify(
                spiedService.searchElastic(
                    deepEqual({
                        body: {
                            query: {
                                bool: {
                                    must: {
                                        term: {
                                            collision_id: id,
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
                        id: collision,
                        distribution_id: (types.Long as any).fromNumber(id),
                        circuit_name: circuit,
                        initial_arguments: JSON.stringify(args),
                        initialized: false,
                        refresh_timer: 1,
                    }),
                    deepEqual({
                        if_not_exist: true,
                    }),
                ),
            ).called();
        });
    });
});
