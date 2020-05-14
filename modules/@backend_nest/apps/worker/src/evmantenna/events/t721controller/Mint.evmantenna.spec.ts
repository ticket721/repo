import { T721ControllerV0Service } from '@lib/common/contracts/t721controller/T721Controller.V0.service';
import { InjectSchedule, Schedule } from 'nest-schedule';
import { getQueueToken, InjectQueue } from '@nestjs/bull';
import { Job, JobOptions, Queue } from 'bull';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { EVMEventSetsService } from '@lib/common/evmeventsets/EVMEventSets.service';
import { TicketsService } from '@lib/common/tickets/Tickets.service';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { GroupService } from '@lib/common/group/Group.service';
import { AuthorizationsService } from '@lib/common/authorizations/Authorizations.service';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { MintT721ControllerEVMAntenna } from '@app/worker/evmantenna/events/t721controller/Mint.evmantenna';
import { deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { AuthorizationEntity } from '@lib/common/authorizations/entities/Authorization.entity';
import { Test } from '@nestjs/testing';
import { decimalToHex, encode, MintAuthorization, toB32 } from '@common/global';

class QueueMock<T = any> {
    add(name: string, data: T, opts?: JobOptions): Promise<Job<T>> {
        return null;
    }
}

describe('Mint EVMAntenna', function() {
    const context: {
        mintEVMAntenna: MintT721ControllerEVMAntenna;
        t721controllerServiceMock: T721ControllerV0Service;
        schedulerMock: Schedule;
        queueMock: QueueMock;
        globalConfigServiceMock: GlobalConfigService;
        shutdownServiceMock: ShutdownService;
        outrospectionServiceMock: OutrospectionService;
        evmEventSetsServiceMock: EVMEventSetsService;
        ticketsServiceMock: TicketsService;
        categoriesServiceMock: CategoriesService;
        groupServiceMock: GroupService;
        authorizationsServiceMock: AuthorizationsService;
        loggerServiceMock: WinstonLoggerService;
    } = {
        mintEVMAntenna: null,
        t721controllerServiceMock: null,
        schedulerMock: null,
        queueMock: null,
        globalConfigServiceMock: null,
        shutdownServiceMock: null,
        outrospectionServiceMock: null,
        evmEventSetsServiceMock: null,
        ticketsServiceMock: null,
        categoriesServiceMock: null,
        groupServiceMock: null,
        authorizationsServiceMock: null,
        loggerServiceMock: null,
    };

    beforeEach(async function() {
        context.t721controllerServiceMock = mock(T721ControllerV0Service);
        context.schedulerMock = mock(Schedule);
        context.queueMock = mock(QueueMock);
        context.globalConfigServiceMock = mock(GlobalConfigService);
        context.shutdownServiceMock = mock(ShutdownService);
        context.outrospectionServiceMock = mock(OutrospectionService);
        context.evmEventSetsServiceMock = mock(EVMEventSetsService);
        context.ticketsServiceMock = mock(TicketsService);
        context.categoriesServiceMock = mock(CategoriesService);
        context.groupServiceMock = mock(GroupService);
        context.authorizationsServiceMock = mock(AuthorizationsService);
        context.loggerServiceMock = mock(WinstonLoggerService);

        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: T721ControllerV0Service,
                    useValue: instance(context.t721controllerServiceMock),
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
                    provide: TicketsService,
                    useValue: instance(context.ticketsServiceMock),
                },
                {
                    provide: CategoriesService,
                    useValue: instance(context.categoriesServiceMock),
                },
                {
                    provide: GroupService,
                    useValue: instance(context.groupServiceMock),
                },
                {
                    provide: AuthorizationsService,
                    useValue: instance(context.authorizationsServiceMock),
                },
                {
                    provide: WinstonLoggerService,
                    useValue: instance(context.loggerServiceMock),
                },
                MintT721ControllerEVMAntenna,
            ],
        }).compile();

        context.mintEVMAntenna = app.get<MintT721ControllerEVMAntenna>(MintT721ControllerEVMAntenna);
    });

    describe('convert', function() {
        it('should properly convert ticket minting into db edits', async function() {
            // DECLARE
            const ticketId = '9384759287435';
            const groupId = '0xgroupid';
            const categoryId = '0xcatid';
            const categoryName = 'category';
            const controllerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6374';
            const ownerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6363';
            const authorizationId = 'authorization_id';
            const code = encode(['uint256'], ['923847592348759']);
            const event = {
                return_values: JSON.stringify({
                    ticket_id: ticketId,
                    group: groupId,
                    category: toB32(categoryName),
                    owner: ownerAddress,
                    code,
                }),
                raw_data: '0xrawdata',
                raw_topics: ['0xtopic'],
                event: '0xevent',
                signature: '0xsignature',
                log_index: 0,
                transaction_index: 0,
                transaction_hash: '0xhash',
                block_hash: '0xbhash',
                block_number: 123,
                address: '0x05FDDB5E30Afd07fd8A6E7Be8feB411A4C26F170',
                artifact_name: 'artifact_name',
            };
            const ticketEntity = {
                id: ticketId,
                group_id: groupId,
                category: categoryId,
                authorization: authorizationId,
                owner: ownerAddress,
            } as TicketEntity;
            const categoryEntity = {
                id: categoryId,
                category_name: categoryName,
            };
            const authorizationEntity = {
                id: authorizationId,
                codes: MintAuthorization.toCodesFormat(code),
            };

            // MOCK
            when(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [ticketEntity as TicketEntity],
            });
            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [categoryEntity as CategoryEntity],
            });
            when(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity as CategoryEntity),
                    deepEqual(['address']),
                ),
            ).thenResolve({
                error: null,
                response: [controllerAddress],
            });
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationEntity as AuthorizationEntity],
            });
            when(
                context.authorizationsServiceMock.dryUpdate(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        consumed: true,
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
                context.ticketsServiceMock.dryUpdate(
                    deepEqual({
                        id: ticketId,
                    }),
                    deepEqual({
                        status: 'ready',
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
                context.authorizationsServiceMock.dryUpdate(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        consumed: false,
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
                context.ticketsServiceMock.dryUpdate(
                    deepEqual({
                        id: ticketId,
                    }),
                    deepEqual({
                        status: 'minting',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: {
                    query: 'query',
                    params: [],
                },
            });
            // TRIGGER

            await context.mintEVMAntenna.convert(event, () => {});

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).once();
            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).once();
            verify(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity as CategoryEntity),
                    deepEqual(['address']),
                ),
            ).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
            verify(
                context.authorizationsServiceMock.dryUpdate(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        consumed: true,
                    }),
                ),
            ).once();
            verify(
                context.ticketsServiceMock.dryUpdate(
                    deepEqual({
                        id: ticketId,
                    }),
                    deepEqual({
                        status: 'ready',
                    }),
                ),
            ).once();
            verify(
                context.authorizationsServiceMock.dryUpdate(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        consumed: false,
                    }),
                ),
            ).once();
            verify(
                context.ticketsServiceMock.dryUpdate(
                    deepEqual({
                        id: ticketId,
                    }),
                    deepEqual({
                        status: 'minting',
                    }),
                ),
            ).once();
        });

        it('should skip on ticket not found', async function() {
            // DECLARE
            const ticketId = '9384759287435';
            const groupId = '0xgroupid';
            const categoryName = 'category';
            const ownerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6363';
            const code = encode(['uint256'], ['923847592348759']);
            const event = {
                return_values: JSON.stringify({
                    ticket_id: ticketId,
                    group: groupId,
                    category: toB32(categoryName),
                    owner: ownerAddress,
                    code,
                }),
                raw_data: '0xrawdata',
                raw_topics: ['0xtopic'],
                event: '0xevent',
                signature: '0xsignature',
                log_index: 0,
                transaction_index: 0,
                transaction_hash: '0xhash',
                block_hash: '0xbhash',
                block_number: 123,
                address: '0x05FDDB5E30Afd07fd8A6E7Be8feB411A4C26F170',
                artifact_name: 'artifact_name',
            };

            // MOCK
            when(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });
            // TRIGGER

            await context.mintEVMAntenna.convert(event, () => {});

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).once();
        });

        it('should fail on ticket fetch error', async function() {
            // DECLARE
            const ticketId = '9384759287435';
            const groupId = '0xgroupid';
            const categoryName = 'category';
            const ownerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6363';
            const code = encode(['uint256'], ['923847592348759']);
            const event = {
                return_values: JSON.stringify({
                    ticket_id: ticketId,
                    group: groupId,
                    category: toB32(categoryName),
                    owner: ownerAddress,
                    code,
                }),
                raw_data: '0xrawdata',
                raw_topics: ['0xtopic'],
                event: '0xevent',
                signature: '0xsignature',
                log_index: 0,
                transaction_index: 0,
                transaction_hash: '0xhash',
                block_hash: '0xbhash',
                block_number: 123,
                address: '0x05FDDB5E30Afd07fd8A6E7Be8feB411A4C26F170',
                artifact_name: 'artifact_name',
            };

            // MOCK
            when(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });
            // TRIGGER

            await expect(context.mintEVMAntenna.convert(event, () => {})).rejects.toMatchObject(
                new Error(`Error while fetching tickets: unexpected_error`),
            );

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).once();
        });

        it('should fail on invalid group id', async function() {
            // DECLARE
            const ticketId = '9384759287435';
            const groupId = '0xgroupid';
            const categoryId = '0xcatid';
            const categoryName = 'category';
            const controllerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6374';
            const ownerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6363';
            const authorizationId = 'authorization_id';
            const code = encode(['uint256'], ['923847592348759']);
            const event = {
                return_values: JSON.stringify({
                    ticket_id: ticketId,
                    group: '0xinvalidgroupid',
                    category: toB32(categoryName),
                    owner: ownerAddress,
                    code,
                }),
                raw_data: '0xrawdata',
                raw_topics: ['0xtopic'],
                event: '0xevent',
                signature: '0xsignature',
                log_index: 0,
                transaction_index: 0,
                transaction_hash: '0xhash',
                block_hash: '0xbhash',
                block_number: 123,
                address: '0x05FDDB5E30Afd07fd8A6E7Be8feB411A4C26F170',
                artifact_name: 'artifact_name',
            };
            const ticketEntity = {
                id: ticketId,
                group_id: groupId,
                category: categoryId,
                authorization: authorizationId,
                owner: ownerAddress,
            } as TicketEntity;
            const categoryEntity = {
                id: categoryId,
                category_name: categoryName,
            };
            const authorizationEntity = {
                id: authorizationId,
                codes: MintAuthorization.toCodesFormat(code),
            };

            // MOCK
            when(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [ticketEntity as TicketEntity],
            });
            // TRIGGER

            await expect(context.mintEVMAntenna.convert(event, () => {})).rejects.toMatchObject(
                new Error(
                    `Invalid group id received from event: ticket got ${groupId} and event gives 0xinvalidgroupid`,
                ),
            );

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).once();
        });

        it('should fail on category search error', async function() {
            // DECLARE
            const ticketId = '9384759287435';
            const groupId = '0xgroupid';
            const categoryId = '0xcatid';
            const categoryName = 'category';
            const controllerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6374';
            const ownerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6363';
            const authorizationId = 'authorization_id';
            const code = encode(['uint256'], ['923847592348759']);
            const event = {
                return_values: JSON.stringify({
                    ticket_id: ticketId,
                    group: groupId,
                    category: toB32(categoryName),
                    owner: ownerAddress,
                    code,
                }),
                raw_data: '0xrawdata',
                raw_topics: ['0xtopic'],
                event: '0xevent',
                signature: '0xsignature',
                log_index: 0,
                transaction_index: 0,
                transaction_hash: '0xhash',
                block_hash: '0xbhash',
                block_number: 123,
                address: '0x05FDDB5E30Afd07fd8A6E7Be8feB411A4C26F170',
                artifact_name: 'artifact_name',
            };
            const ticketEntity = {
                id: ticketId,
                group_id: groupId,
                category: categoryId,
                authorization: authorizationId,
                owner: ownerAddress,
            } as TicketEntity;
            const categoryEntity = {
                id: categoryId,
                category_name: categoryName,
            };
            const authorizationEntity = {
                id: authorizationId,
                codes: MintAuthorization.toCodesFormat(code),
            };

            // MOCK
            when(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [ticketEntity as TicketEntity],
            });
            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });
            // TRIGGER

            await expect(context.mintEVMAntenna.convert(event, () => {})).rejects.toMatchObject(
                new Error(`Cannot find category linked to existing ticket: unexpected_error`),
            );

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).once();
            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).once();
        });

        it('should fail on empty category search', async function() {
            // DECLARE
            const ticketId = '9384759287435';
            const groupId = '0xgroupid';
            const categoryId = '0xcatid';
            const categoryName = 'category';
            const controllerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6374';
            const ownerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6363';
            const authorizationId = 'authorization_id';
            const code = encode(['uint256'], ['923847592348759']);
            const event = {
                return_values: JSON.stringify({
                    ticket_id: ticketId,
                    group: groupId,
                    category: toB32(categoryName),
                    owner: ownerAddress,
                    code,
                }),
                raw_data: '0xrawdata',
                raw_topics: ['0xtopic'],
                event: '0xevent',
                signature: '0xsignature',
                log_index: 0,
                transaction_index: 0,
                transaction_hash: '0xhash',
                block_hash: '0xbhash',
                block_number: 123,
                address: '0x05FDDB5E30Afd07fd8A6E7Be8feB411A4C26F170',
                artifact_name: 'artifact_name',
            };
            const ticketEntity = {
                id: ticketId,
                group_id: groupId,
                category: categoryId,
                authorization: authorizationId,
                owner: ownerAddress,
            } as TicketEntity;
            const categoryEntity = {
                id: categoryId,
                category_name: categoryName,
            };
            const authorizationEntity = {
                id: authorizationId,
                codes: MintAuthorization.toCodesFormat(code),
            };

            // MOCK
            when(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [ticketEntity as TicketEntity],
            });
            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });
            // TRIGGER

            await expect(context.mintEVMAntenna.convert(event, () => {})).rejects.toMatchObject(
                new Error(`Cannot find category linked to existing ticket: category not found`),
            );

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).once();
            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).once();
        });

        it('should fail on invalid category name', async function() {
            // DECLARE
            const ticketId = '9384759287435';
            const groupId = '0xgroupid';
            const categoryId = '0xcatid';
            const categoryName = 'category';
            const controllerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6374';
            const ownerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6363';
            const authorizationId = 'authorization_id';
            const code = encode(['uint256'], ['923847592348759']);
            const event = {
                return_values: JSON.stringify({
                    ticket_id: ticketId,
                    group: groupId,
                    category: toB32('not the same'),
                    owner: ownerAddress,
                    code,
                }),
                raw_data: '0xrawdata',
                raw_topics: ['0xtopic'],
                event: '0xevent',
                signature: '0xsignature',
                log_index: 0,
                transaction_index: 0,
                transaction_hash: '0xhash',
                block_hash: '0xbhash',
                block_number: 123,
                address: '0x05FDDB5E30Afd07fd8A6E7Be8feB411A4C26F170',
                artifact_name: 'artifact_name',
            };
            const ticketEntity = {
                id: ticketId,
                group_id: groupId,
                category: categoryId,
                authorization: authorizationId,
                owner: ownerAddress,
            } as TicketEntity;
            const categoryEntity = {
                id: categoryId,
                category_name: categoryName,
            };
            const authorizationEntity = {
                id: authorizationId,
                codes: MintAuthorization.toCodesFormat(code),
            };

            // MOCK
            when(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [ticketEntity as TicketEntity],
            });
            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [categoryEntity as CategoryEntity],
            });
            // TRIGGER

            await expect(context.mintEVMAntenna.convert(event, () => {})).rejects.toMatchObject(
                new Error(
                    `Invalid category name received from event: ticket got ${toB32(
                        categoryName,
                    ).toLowerCase()} and event gives ${toB32('not the same').toLowerCase()}`,
                ),
            );

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).once();
            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).once();
        });

        it('should fail on invalid owner', async function() {
            // DECLARE
            const ticketId = '9384759287435';
            const groupId = '0xgroupid';
            const categoryId = '0xcatid';
            const categoryName = 'category';
            const controllerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6374';
            const ownerAddress = '0xd44186E0EA326888EA2aBFF33C666787Bba05D90';
            const invalidOwnerAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
            const authorizationId = 'authorization_id';
            const code = encode(['uint256'], ['923847592348759']);
            const event = {
                return_values: JSON.stringify({
                    ticket_id: ticketId,
                    group: groupId,
                    category: toB32(categoryName),
                    owner: invalidOwnerAddress,
                    code,
                }),
                raw_data: '0xrawdata',
                raw_topics: ['0xtopic'],
                event: '0xevent',
                signature: '0xsignature',
                log_index: 0,
                transaction_index: 0,
                transaction_hash: '0xhash',
                block_hash: '0xbhash',
                block_number: 123,
                address: '0x05FDDB5E30Afd07fd8A6E7Be8feB411A4C26F170',
                artifact_name: 'artifact_name',
            };
            const ticketEntity = {
                id: ticketId,
                group_id: groupId,
                category: categoryId,
                authorization: authorizationId,
                owner: ownerAddress,
            } as TicketEntity;
            const categoryEntity = {
                id: categoryId,
                category_name: categoryName,
            };
            const authorizationEntity = {
                id: authorizationId,
                codes: MintAuthorization.toCodesFormat(code),
            };

            // MOCK
            when(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [ticketEntity as TicketEntity],
            });
            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [categoryEntity as CategoryEntity],
            });
            // TRIGGER

            await expect(context.mintEVMAntenna.convert(event, () => {})).rejects.toMatchObject(
                new Error(
                    `Invalid owner address received from event: ticket got ${ownerAddress} and event gives ${invalidOwnerAddress}`,
                ),
            );

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).once();
            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).once();
        });

        it('should fail on controller address fetch error', async function() {
            // DECLARE
            const ticketId = '9384759287435';
            const groupId = '0xgroupid';
            const categoryId = '0xcatid';
            const categoryName = 'category';
            const controllerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6374';
            const ownerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6363';
            const authorizationId = 'authorization_id';
            const code = encode(['uint256'], ['923847592348759']);
            const event = {
                return_values: JSON.stringify({
                    ticket_id: ticketId,
                    group: groupId,
                    category: toB32(categoryName),
                    owner: ownerAddress,
                    code,
                }),
                raw_data: '0xrawdata',
                raw_topics: ['0xtopic'],
                event: '0xevent',
                signature: '0xsignature',
                log_index: 0,
                transaction_index: 0,
                transaction_hash: '0xhash',
                block_hash: '0xbhash',
                block_number: 123,
                address: '0x05FDDB5E30Afd07fd8A6E7Be8feB411A4C26F170',
                artifact_name: 'artifact_name',
            };
            const ticketEntity = {
                id: ticketId,
                group_id: groupId,
                category: categoryId,
                authorization: authorizationId,
                owner: ownerAddress,
            } as TicketEntity;
            const categoryEntity = {
                id: categoryId,
                category_name: categoryName,
            };
            const authorizationEntity = {
                id: authorizationId,
                codes: MintAuthorization.toCodesFormat(code),
            };

            // MOCK
            when(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [ticketEntity as TicketEntity],
            });
            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [categoryEntity as CategoryEntity],
            });
            when(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity as CategoryEntity),
                    deepEqual(['address']),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });
            // TRIGGER

            await expect(context.mintEVMAntenna.convert(event, () => {})).rejects.toMatchObject(
                new Error(`Unable to retrieve group controller`),
            );

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).once();
            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).once();
            verify(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity as CategoryEntity),
                    deepEqual(['address']),
                ),
            ).once();
        });

        it('should fail on authorization search error', async function() {
            // DECLARE
            const ticketId = '9384759287435';
            const groupId = '0xgroupid';
            const categoryId = '0xcatid';
            const categoryName = 'category';
            const controllerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6374';
            const ownerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6363';
            const authorizationId = 'authorization_id';
            const code = encode(['uint256'], ['923847592348759']);
            const event = {
                return_values: JSON.stringify({
                    ticket_id: ticketId,
                    group: groupId,
                    category: toB32(categoryName),
                    owner: ownerAddress,
                    code,
                }),
                raw_data: '0xrawdata',
                raw_topics: ['0xtopic'],
                event: '0xevent',
                signature: '0xsignature',
                log_index: 0,
                transaction_index: 0,
                transaction_hash: '0xhash',
                block_hash: '0xbhash',
                block_number: 123,
                address: '0x05FDDB5E30Afd07fd8A6E7Be8feB411A4C26F170',
                artifact_name: 'artifact_name',
            };
            const ticketEntity = {
                id: ticketId,
                group_id: groupId,
                category: categoryId,
                authorization: authorizationId,
                owner: ownerAddress,
            } as TicketEntity;
            const categoryEntity = {
                id: categoryId,
                category_name: categoryName,
            };
            const authorizationEntity = {
                id: authorizationId,
                codes: MintAuthorization.toCodesFormat(code),
            };

            // MOCK
            when(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [ticketEntity as TicketEntity],
            });
            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [categoryEntity as CategoryEntity],
            });
            when(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity as CategoryEntity),
                    deepEqual(['address']),
                ),
            ).thenResolve({
                error: null,
                response: [controllerAddress],
            });
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: null,
            });
            // TRIGGER

            await expect(context.mintEVMAntenna.convert(event, () => {})).rejects.toMatchObject(
                new Error(`Unable to retrieve linked authorization: unexpected_error`),
            );

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).once();
            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).once();
            verify(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity as CategoryEntity),
                    deepEqual(['address']),
                ),
            ).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
        });

        it('should fail on empty authorization search', async function() {
            // DECLARE
            const ticketId = '9384759287435';
            const groupId = '0xgroupid';
            const categoryId = '0xcatid';
            const categoryName = 'category';
            const controllerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6374';
            const ownerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6363';
            const authorizationId = 'authorization_id';
            const code = encode(['uint256'], ['923847592348759']);
            const event = {
                return_values: JSON.stringify({
                    ticket_id: ticketId,
                    group: groupId,
                    category: toB32(categoryName),
                    owner: ownerAddress,
                    code,
                }),
                raw_data: '0xrawdata',
                raw_topics: ['0xtopic'],
                event: '0xevent',
                signature: '0xsignature',
                log_index: 0,
                transaction_index: 0,
                transaction_hash: '0xhash',
                block_hash: '0xbhash',
                block_number: 123,
                address: '0x05FDDB5E30Afd07fd8A6E7Be8feB411A4C26F170',
                artifact_name: 'artifact_name',
            };
            const ticketEntity = {
                id: ticketId,
                group_id: groupId,
                category: categoryId,
                authorization: authorizationId,
                owner: ownerAddress,
            } as TicketEntity;
            const categoryEntity = {
                id: categoryId,
                category_name: categoryName,
            };
            const authorizationEntity = {
                id: authorizationId,
                codes: MintAuthorization.toCodesFormat(code),
            };

            // MOCK
            when(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [ticketEntity as TicketEntity],
            });
            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [categoryEntity as CategoryEntity],
            });
            when(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity as CategoryEntity),
                    deepEqual(['address']),
                ),
            ).thenResolve({
                error: null,
                response: [controllerAddress],
            });
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });
            // TRIGGER

            await expect(context.mintEVMAntenna.convert(event, () => {})).rejects.toMatchObject(
                new Error(`Unable to retrieve linked authorization: authorization not found`),
            );

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).once();
            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).once();
            verify(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity as CategoryEntity),
                    deepEqual(['address']),
                ),
            ).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
        });

        it('should fail on invalid code', async function() {
            // DECLARE
            const ticketId = '9384759287435';
            const groupId = '0xgroupid';
            const categoryId = '0xcatid';
            const categoryName = 'category';
            const controllerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6374';
            const ownerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6363';
            const authorizationId = 'authorization_id';
            const code = encode(['uint256'], ['923847592348759']);
            const invalidCode = encode(['uint256'], ['23847592348759']);
            const event = {
                return_values: JSON.stringify({
                    ticket_id: ticketId,
                    group: groupId,
                    category: toB32(categoryName),
                    owner: ownerAddress,
                    code: invalidCode,
                }),
                raw_data: '0xrawdata',
                raw_topics: ['0xtopic'],
                event: '0xevent',
                signature: '0xsignature',
                log_index: 0,
                transaction_index: 0,
                transaction_hash: '0xhash',
                block_hash: '0xbhash',
                block_number: 123,
                address: '0x05FDDB5E30Afd07fd8A6E7Be8feB411A4C26F170',
                artifact_name: 'artifact_name',
            };
            const ticketEntity = {
                id: ticketId,
                group_id: groupId,
                category: categoryId,
                authorization: authorizationId,
                owner: ownerAddress,
            } as TicketEntity;
            const categoryEntity = {
                id: categoryId,
                category_name: categoryName,
            };
            const authorizationEntity = {
                id: authorizationId,
                codes: MintAuthorization.toCodesFormat(code),
            };

            // MOCK
            when(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [ticketEntity as TicketEntity],
            });
            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [categoryEntity as CategoryEntity],
            });
            when(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity as CategoryEntity),
                    deepEqual(['address']),
                ),
            ).thenResolve({
                error: null,
                response: [controllerAddress],
            });
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationEntity as AuthorizationEntity],
            });
            // TRIGGER

            await expect(context.mintEVMAntenna.convert(event, () => {})).rejects.toMatchObject(
                new Error(
                    `Invalid broadcasted authorization code: got ${invalidCode.toLowerCase()} but was expecting ${code.toLowerCase()}`,
                ),
            );

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).once();
            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).once();
            verify(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity as CategoryEntity),
                    deepEqual(['address']),
                ),
            ).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
        });

        it('should fail on dry update', async function() {
            // DECLARE
            const ticketId = '9384759287435';
            const groupId = '0xgroupid';
            const categoryId = '0xcatid';
            const categoryName = 'category';
            const controllerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6374';
            const ownerAddress = '0xFa18E5028722CE10fB3542C87893afd9316D6363';
            const authorizationId = 'authorization_id';
            const code = encode(['uint256'], ['923847592348759']);
            const event = {
                return_values: JSON.stringify({
                    ticket_id: ticketId,
                    group: groupId,
                    category: toB32(categoryName),
                    owner: ownerAddress,
                    code,
                }),
                raw_data: '0xrawdata',
                raw_topics: ['0xtopic'],
                event: '0xevent',
                signature: '0xsignature',
                log_index: 0,
                transaction_index: 0,
                transaction_hash: '0xhash',
                block_hash: '0xbhash',
                block_number: 123,
                address: '0x05FDDB5E30Afd07fd8A6E7Be8feB411A4C26F170',
                artifact_name: 'artifact_name',
            };
            const ticketEntity = {
                id: ticketId,
                group_id: groupId,
                category: categoryId,
                authorization: authorizationId,
                owner: ownerAddress,
            } as TicketEntity;
            const categoryEntity = {
                id: categoryId,
                category_name: categoryName,
            };
            const authorizationEntity = {
                id: authorizationId,
                codes: MintAuthorization.toCodesFormat(code),
            };

            // MOCK
            when(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [ticketEntity as TicketEntity],
            });
            when(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [categoryEntity as CategoryEntity],
            });
            when(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity as CategoryEntity),
                    deepEqual(['address']),
                ),
            ).thenResolve({
                error: null,
                response: [controllerAddress],
            });
            when(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [authorizationEntity as AuthorizationEntity],
            });
            when(
                context.authorizationsServiceMock.dryUpdate(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        consumed: true,
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
                context.ticketsServiceMock.dryUpdate(
                    deepEqual({
                        id: ticketId,
                    }),
                    deepEqual({
                        status: 'ready',
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
                context.authorizationsServiceMock.dryUpdate(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        consumed: false,
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
                context.ticketsServiceMock.dryUpdate(
                    deepEqual({
                        id: ticketId,
                    }),
                    deepEqual({
                        status: 'minting',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: {
                    query: 'query',
                    params: [],
                },
            });
            // TRIGGER

            await expect(context.mintEVMAntenna.convert(event, () => {})).rejects.toMatchObject(
                new Error(`Cannot create dry update payloads`),
            );

            // CHECK RETURNs

            // CHECK CALLS
            verify(
                context.ticketsServiceMock.search(
                    deepEqual({
                        id: ticketId,
                    }),
                ),
            ).once();
            verify(
                context.categoriesServiceMock.search(
                    deepEqual({
                        id: categoryId,
                    }),
                ),
            ).once();
            verify(
                context.groupServiceMock.getCategoryControllerFields(
                    deepEqual(categoryEntity as CategoryEntity),
                    deepEqual(['address']),
                ),
            ).once();
            verify(
                context.authorizationsServiceMock.search(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                ),
            ).once();
            verify(
                context.authorizationsServiceMock.dryUpdate(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        consumed: true,
                    }),
                ),
            ).once();
            verify(
                context.ticketsServiceMock.dryUpdate(
                    deepEqual({
                        id: ticketId,
                    }),
                    deepEqual({
                        status: 'ready',
                    }),
                ),
            ).once();
            verify(
                context.authorizationsServiceMock.dryUpdate(
                    deepEqual({
                        id: authorizationId,
                        grantee: ownerAddress,
                        granter: controllerAddress,
                        mode: 'mint',
                    }),
                    deepEqual({
                        consumed: false,
                    }),
                ),
            ).once();
            verify(
                context.ticketsServiceMock.dryUpdate(
                    deepEqual({
                        id: ticketId,
                    }),
                    deepEqual({
                        status: 'minting',
                    }),
                ),
            ).once();
        });
    });
});
