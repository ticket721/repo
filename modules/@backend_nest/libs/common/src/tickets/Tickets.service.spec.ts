import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { TicketsRepository } from '@lib/common/tickets/Tickets.repository';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';
import { TicketforgeService } from '@lib/common/contracts/Ticketforge.service';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { TicketsService, TicketsServicePredictionInput } from '@lib/common/tickets/Tickets.service';
import { deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import { TxsRepository } from '@lib/common/txs/Txs.repository';
import { getModelToken } from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';
import { TxEntity } from '@lib/common/txs/entities/Tx.entity';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { T721AdminService } from '@lib/common/contracts/T721Admin.service';
import { RocksideService } from '@lib/common/rockside/Rockside.service';
import { TxsService } from '@lib/common/txs/Txs.service';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';

class TicketEntityMock {
    public _properties = null;

    search(options: EsSearchOptionsStatic, callback?: (err: any, ret: any) => void): void {
        return;
    }
}

describe('Tickets Service', function() {
    const context: {
        ticketsService: TicketsService;
        ticketsRepositoryMock: TicketsRepository;
        ticketEntityMock: TicketEntityMock;
        ticketforgeServiceMock: TicketforgeService;
        categoriesServiceMock: CategoriesService;
    } = {
        ticketsService: null,
        ticketsRepositoryMock: null,
        ticketEntityMock: null,
        ticketforgeServiceMock: null,
        categoriesServiceMock: null,
    };

    beforeEach(async function() {
        context.ticketsRepositoryMock = mock(TicketsRepository);
        context.ticketEntityMock = mock(TicketEntityMock);
        context.ticketforgeServiceMock = mock(TicketforgeService);
        context.categoriesServiceMock = mock(CategoriesService);
        when(context.ticketEntityMock._properties).thenReturn({
            schema: {
                fields: {},
            },
        });

        const app: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: TicketsRepository,
                    useValue: instance(context.ticketsRepositoryMock),
                },
                {
                    provide: getModelToken(TicketEntity),
                    useValue: instance(context.ticketEntityMock),
                },
                {
                    provide: TicketforgeService,
                    useValue: instance(context.ticketforgeServiceMock),
                },
                {
                    provide: CategoriesService,
                    useValue: instance(context.categoriesServiceMock),
                },
                TicketsService,
            ],
        }).compile();

        context.ticketsService = app.get<TicketsService>(TicketsService);
    });

    describe('predictTickets', function() {
        it('should properly predict ticket ids', async function() {
            // DECLARE
            const buyer = '0x2C343e73A594DfD1808b930372A610071bAa9d0E';
            const categoryIdOne = 'category_id_one';
            const authorizationIdOne = 'authorization_id_one';
            const categoryIdTwo = 'category_id_two';
            const authorizationIdTwo = 'authorization_id_two';
            const groupId = 'group_id';
            const parentId = 'event_id';
            const parentType = 'event';
            const input: TicketsServicePredictionInput[] = [
                {
                    buyer,
                    categoryId: categoryIdOne,
                    authorizationId: authorizationIdOne,
                    groupId,
                },
                {
                    buyer,
                    categoryId: categoryIdTwo,
                    authorizationId: authorizationIdTwo,
                    groupId,
                },
            ];
            const categoryEntityOne: Partial<CategoryEntity> = {
                id: categoryIdOne,
                parent_type: parentType,
                parent_id: parentId,
            };
            const categoryEntityTwo: Partial<CategoryEntity> = {
                id: categoryIdTwo,
                parent_type: parentType,
                parent_id: parentId,
            };
            let callIdx = 0;
            const ticketForgeInstance = {
                methods: {
                    getMintNonce: () => ({
                        call: () => 0,
                    }),
                    getTokenID: () => ({
                        call: () => {
                            return callIdx++;
                        },
                    }),
                },
            };
            const ticketEntityOne: Partial<TicketEntity> = {
                id: '0',
                authorization: authorizationIdOne,
                owner: buyer,
                env: 'chain',
                status: 'minting',
                transaction_hash: null,
                category: categoryIdOne,
                group_id: groupId,
                parent_id: parentId,
                parent_type: parentType,
            };
            const ticketEntityTwo: Partial<TicketEntity> = {
                id: '1',
                authorization: authorizationIdTwo,
                owner: buyer,
                env: 'chain',
                status: 'minting',
                transaction_hash: null,
                category: categoryIdTwo,
                group_id: groupId,
                parent_id: parentId,
                parent_type: parentType,
            };
            const spiedService = spy(context.ticketsService);

            // MOCK
            when(context.ticketforgeServiceMock.get()).thenResolve(ticketForgeInstance);
            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryIdOne,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [categoryEntityOne as CategoryEntity],
            });
            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryIdTwo,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [categoryEntityTwo as CategoryEntity],
            });
            when(spiedService.create(deepEqual(ticketEntityOne))).thenResolve({
                error: null,
                response: ticketEntityOne as TicketEntity,
            });
            when(spiedService.create(deepEqual(ticketEntityTwo))).thenResolve({
                error: null,
                response: ticketEntityTwo as TicketEntity,
            });

            // TRIGGER
            const res = await context.ticketsService.predictTickets(input);

            // CHECK RETURNs
            expect(res.error).toEqual(null);
            expect(res.response).toEqual([ticketEntityOne, ticketEntityTwo]);

            // CHECK CALLS
            verify(context.ticketforgeServiceMock.get()).once();
            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryIdOne,
                    }),
                ),
            ).once();
            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryIdTwo,
                    }),
                ),
            ).once();
            verify(spiedService.create(deepEqual(ticketEntityOne))).once();
            verify(spiedService.create(deepEqual(ticketEntityTwo))).once();
        });

        it('should fail on nonce fetch', async function() {
            // DECLARE
            const buyer = '0x2C343e73A594DfD1808b930372A610071bAa9d0E';
            const categoryIdOne = 'category_id_one';
            const authorizationIdOne = 'authorization_id_one';
            const categoryIdTwo = 'category_id_two';
            const authorizationIdTwo = 'authorization_id_two';
            const groupId = 'group_id';
            const input: TicketsServicePredictionInput[] = [
                {
                    buyer,
                    categoryId: categoryIdOne,
                    authorizationId: authorizationIdOne,
                    groupId,
                },
                {
                    buyer,
                    categoryId: categoryIdTwo,
                    authorizationId: authorizationIdTwo,
                    groupId,
                },
            ];
            let callIdx = 0;
            const ticketForgeInstance = {
                methods: {
                    getMintNonce: () => ({
                        call: () => {
                            throw new Error('revert');
                        },
                    }),
                    getTokenID: () => ({
                        call: () => {
                            return callIdx++;
                        },
                    }),
                },
            };

            // MOCK
            when(context.ticketforgeServiceMock.get()).thenResolve(ticketForgeInstance);

            // TRIGGER
            const res = await context.ticketsService.predictTickets(input);

            // CHECK RETURNs
            expect(res.error).toEqual('revert');
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(context.ticketforgeServiceMock.get()).once();
        });

        it('should fail on contract token id prediction', async function() {
            // DECLARE
            const buyer = '0x2C343e73A594DfD1808b930372A610071bAa9d0E';
            const categoryIdOne = 'category_id_one';
            const authorizationIdOne = 'authorization_id_one';
            const categoryIdTwo = 'category_id_two';
            const authorizationIdTwo = 'authorization_id_two';
            const groupId = 'group_id';
            const input: TicketsServicePredictionInput[] = [
                {
                    buyer,
                    categoryId: categoryIdOne,
                    authorizationId: authorizationIdOne,
                    groupId,
                },
                {
                    buyer,
                    categoryId: categoryIdTwo,
                    authorizationId: authorizationIdTwo,
                    groupId,
                },
            ];
            const ticketForgeInstance = {
                methods: {
                    getMintNonce: () => ({
                        call: () => 0,
                    }),
                    getTokenID: () => ({
                        call: () => {
                            throw new Error('revert');
                        },
                    }),
                },
            };

            // MOCK
            when(context.ticketforgeServiceMock.get()).thenResolve(ticketForgeInstance);

            // TRIGGER
            const res = await context.ticketsService.predictTickets(input);

            // CHECK RETURNs
            expect(res.error).toEqual('revert');
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(context.ticketforgeServiceMock.get()).once();
        });

        it('should fail on category fetch error', async function() {
            // DECLARE
            const buyer = '0x2C343e73A594DfD1808b930372A610071bAa9d0E';
            const categoryIdOne = 'category_id_one';
            const authorizationIdOne = 'authorization_id_one';
            const categoryIdTwo = 'category_id_two';
            const authorizationIdTwo = 'authorization_id_two';
            const groupId = 'group_id';
            const input: TicketsServicePredictionInput[] = [
                {
                    buyer,
                    categoryId: categoryIdOne,
                    authorizationId: authorizationIdOne,
                    groupId,
                },
                {
                    buyer,
                    categoryId: categoryIdTwo,
                    authorizationId: authorizationIdTwo,
                    groupId,
                },
            ];
            let callIdx = 0;
            const ticketForgeInstance = {
                methods: {
                    getMintNonce: () => ({
                        call: () => 0,
                    }),
                    getTokenID: () => ({
                        call: () => {
                            return callIdx++;
                        },
                    }),
                },
            };

            // MOCK
            when(context.ticketforgeServiceMock.get()).thenResolve(ticketForgeInstance);
            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryIdOne,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // TRIGGER
            const res = await context.ticketsService.predictTickets(input);

            // CHECK RETURNs
            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(context.ticketforgeServiceMock.get()).once();
            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryIdOne,
                    }),
                ),
            ).once();
        });

        it('should fail on category empty fetch', async function() {
            // DECLARE
            const buyer = '0x2C343e73A594DfD1808b930372A610071bAa9d0E';
            const categoryIdOne = 'category_id_one';
            const authorizationIdOne = 'authorization_id_one';
            const categoryIdTwo = 'category_id_two';
            const authorizationIdTwo = 'authorization_id_two';
            const groupId = 'group_id';
            const input: TicketsServicePredictionInput[] = [
                {
                    buyer,
                    categoryId: categoryIdOne,
                    authorizationId: authorizationIdOne,
                    groupId,
                },
                {
                    buyer,
                    categoryId: categoryIdTwo,
                    authorizationId: authorizationIdTwo,
                    groupId,
                },
            ];
            let callIdx = 0;
            const ticketForgeInstance = {
                methods: {
                    getMintNonce: () => ({
                        call: () => 0,
                    }),
                    getTokenID: () => ({
                        call: () => {
                            return callIdx++;
                        },
                    }),
                },
            };

            // MOCK
            when(context.ticketforgeServiceMock.get()).thenResolve(ticketForgeInstance);
            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryIdOne,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            // TRIGGER
            const res = await context.ticketsService.predictTickets(input);

            // CHECK RETURNs
            expect(res.error).toEqual('category_not_found');
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(context.ticketforgeServiceMock.get()).once();
            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryIdOne,
                    }),
                ),
            ).once();
        });

        it('should fail on creation error', async function() {
            // DECLARE
            const buyer = '0x2C343e73A594DfD1808b930372A610071bAa9d0E';
            const categoryIdOne = 'category_id_one';
            const authorizationIdOne = 'authorization_id_one';
            const categoryIdTwo = 'category_id_two';
            const authorizationIdTwo = 'authorization_id_two';
            const groupId = 'group_id';
            const parentId = 'event_id';
            const parentType = 'event';
            const input: TicketsServicePredictionInput[] = [
                {
                    buyer,
                    categoryId: categoryIdOne,
                    authorizationId: authorizationIdOne,
                    groupId,
                },
                {
                    buyer,
                    categoryId: categoryIdTwo,
                    authorizationId: authorizationIdTwo,
                    groupId,
                },
            ];
            const categoryEntityOne: Partial<CategoryEntity> = {
                id: categoryIdOne,
                parent_type: parentType,
                parent_id: parentId,
            };
            const categoryEntityTwo: Partial<CategoryEntity> = {
                id: categoryIdTwo,
                parent_type: parentType,
                parent_id: parentId,
            };
            let callIdx = 0;
            const ticketForgeInstance = {
                methods: {
                    getMintNonce: () => ({
                        call: () => 0,
                    }),
                    getTokenID: () => ({
                        call: () => {
                            return callIdx++;
                        },
                    }),
                },
            };
            const ticketEntityOne: Partial<TicketEntity> = {
                id: '0',
                authorization: authorizationIdOne,
                owner: buyer,
                env: 'chain',
                status: 'minting',
                transaction_hash: null,
                category: categoryIdOne,
                group_id: groupId,
                parent_id: parentId,
                parent_type: parentType,
            };
            const spiedService = spy(context.ticketsService);

            // MOCK
            when(context.ticketforgeServiceMock.get()).thenResolve(ticketForgeInstance);
            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryIdOne,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [categoryEntityOne as CategoryEntity],
            });
            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryIdTwo,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [categoryEntityTwo as CategoryEntity],
            });
            when(spiedService.create(deepEqual(ticketEntityOne))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            // TRIGGER
            const res = await context.ticketsService.predictTickets(input);

            // CHECK RETURNs
            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            // CHECK CALLS
            verify(context.ticketforgeServiceMock.get()).once();
            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryIdOne,
                    }),
                ),
            ).once();
            verify(spiedService.create(deepEqual(ticketEntityOne))).once();
        });
    });
});
