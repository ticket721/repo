import { EsSearchOptionsStatic } from '@iaminfinity/express-cassandra/dist/orm/interfaces/externals/express-cassandra.interface';
import { EventsService } from '@lib/common/events/Events.service';
import { EventsRepository } from '@lib/common/events/Events.repository';
import { CategoriesService } from '@lib/common/categories/Categories.service';
import { deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@iaminfinity/express-cassandra/dist/utils/cassandra-orm.utils';
import { EventEntity } from '@lib/common/events/entities/Event.entity';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';

class EventEntityMock {
    public _properties = null;

    search(options: EsSearchOptionsStatic, callback?: (err: any, ret: any) => void): void {
        return;
    }
}

describe('Events Service', function() {
    const context: {
        eventsService: EventsService;
        eventsRepositoryMock: EventsRepository;
        eventEntityMock: EventEntityMock;
        categoriesServiceMock: CategoriesService;
    } = {
        eventsService: null,
        eventsRepositoryMock: null,
        eventEntityMock: null,
        categoriesServiceMock: null,
    };

    beforeEach(async function() {
        context.eventsRepositoryMock = mock(EventsRepository);
        context.eventEntityMock = mock(EventEntityMock);
        when(context.eventEntityMock._properties).thenReturn({
            schema: {
                fields: {},
            },
        });
        context.categoriesServiceMock = mock(CategoriesService);

        const app = await Test.createTestingModule({
            providers: [
                {
                    provide: EventsRepository,
                    useValue: instance(context.eventsRepositoryMock),
                },
                {
                    provide: getModelToken(EventEntity),
                    useValue: instance(context.eventEntityMock),
                },
                {
                    provide: CategoriesService,
                    useValue: instance(context.categoriesServiceMock),
                },
                EventsService,
            ],
        }).compile();

        context.eventsService = app.get<EventsService>(EventsService);
    });

    describe('createEventWithDatesAndCategories', function() {
        it('should properly create event with dates and categories', async function() {
            const groupId = 'abcd';

            const dateEntities: DateEntity[] = [
                {
                    metadata: {
                        name: 'date_one',
                    },
                    group_id: groupId,
                    id: 'date',
                } as DateEntity,
            ];

            const categoryEntities: CategoryEntity[] = [
                {
                    display_name: 'cat1',
                    group_id: groupId,
                    id: 'cat',
                } as CategoryEntity,
            ];

            const eventEntity: EventEntity = {
                group_id: groupId,
                id: 'event',
            } as EventEntity;

            when(context.categoriesServiceMock.create(deepEqual(categoryEntities[0]))).thenResolve({
                error: null,
                response: categoryEntities[0],
            });

            const spiedService = spy(context.eventsService);

            when(spiedService.create(deepEqual(eventEntity))).thenResolve({
                error: null,
                response: eventEntity,
            });

            const res = await context.eventsService.createEventWithDatesAndCategories(
                eventEntity,
                dateEntities,
                categoryEntities,
            );

            expect(res.error).toEqual(null);
            expect(res.response).toEqual([eventEntity, categoryEntities]);

            verify(context.categoriesServiceMock.create(deepEqual(categoryEntities[0]))).called();
            verify(spiedService.create(deepEqual(eventEntity))).called();
        });

        it('should fail on category group id mismatch', async function() {
            const groupId = 'abcd';

            const dateEntities: DateEntity[] = [
                {
                    metadata: {
                        name: 'date_one',
                    },
                    group_id: groupId,
                    id: 'date',
                } as DateEntity,
            ];

            const categoryEntities: CategoryEntity[] = [
                {
                    display_name: 'cat1',
                    group_id: 'efgh',
                    id: 'cat',
                } as CategoryEntity,
            ];

            const eventEntity: EventEntity = {
                group_id: groupId,
                id: 'event',
            } as EventEntity;

            const res = await context.eventsService.createEventWithDatesAndCategories(
                eventEntity,
                dateEntities,
                categoryEntities,
            );

            expect(res.error).toEqual('invalid_category_group_id');
            expect(res.response).toEqual(null);
        });

        it('should fail on category creation error', async function() {
            const groupId = 'abcd';

            const dateEntities: DateEntity[] = [
                {
                    metadata: {
                        name: 'date_one',
                    },
                    group_id: groupId,
                    id: 'date',
                } as DateEntity,
            ];

            const categoryEntities: CategoryEntity[] = [
                {
                    display_name: 'cat1',
                    group_id: groupId,
                    id: 'cat',
                } as CategoryEntity,
            ];

            const eventEntity: EventEntity = {
                group_id: groupId,
                id: 'event',
            } as EventEntity;

            when(context.categoriesServiceMock.create(deepEqual(categoryEntities[0]))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.eventsService.createEventWithDatesAndCategories(
                eventEntity,
                dateEntities,
                categoryEntities,
            );

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(context.categoriesServiceMock.create(deepEqual(categoryEntities[0]))).called();
        });

        it('should fail on date group id mismatch', async function() {
            const groupId = 'abcd';

            const dateEntities: DateEntity[] = [
                {
                    metadata: {
                        name: 'date_one',
                    },
                    group_id: 'efgh',
                    id: 'date',
                } as DateEntity,
            ];

            const categoryEntities: CategoryEntity[] = [
                {
                    display_name: 'cat1',
                    group_id: groupId,
                    id: 'cat',
                } as CategoryEntity,
            ];

            const eventEntity: EventEntity = {
                group_id: groupId,
                id: 'event',
            } as EventEntity;

            when(context.categoriesServiceMock.create(deepEqual(categoryEntities[0]))).thenResolve({
                error: null,
                response: categoryEntities[0],
            });

            const res = await context.eventsService.createEventWithDatesAndCategories(
                eventEntity,
                dateEntities,
                categoryEntities,
            );

            expect(res.error).toEqual('invalid_date_group_id');
            expect(res.response).toEqual(null);

            verify(context.categoriesServiceMock.create(deepEqual(categoryEntities[0]))).called();
        });

        it('should fail on event creation error', async function() {
            const groupId = 'abcd';

            const dateEntities: DateEntity[] = [
                {
                    metadata: {
                        name: 'date_one',
                    },
                    group_id: groupId,
                    id: 'date',
                } as DateEntity,
            ];

            const categoryEntities: CategoryEntity[] = [
                {
                    display_name: 'cat1',
                    group_id: groupId,
                    id: 'cat',
                } as CategoryEntity,
            ];

            const eventEntity: EventEntity = {
                group_id: groupId,
                id: 'event',
            } as EventEntity;

            when(context.categoriesServiceMock.create(deepEqual(categoryEntities[0]))).thenResolve({
                error: null,
                response: categoryEntities[0],
            });

            const spiedService = spy(context.eventsService);

            when(spiedService.create(deepEqual(eventEntity))).thenResolve({
                error: 'unexpected_error',
                response: null,
            });

            const res = await context.eventsService.createEventWithDatesAndCategories(
                eventEntity,
                dateEntities,
                categoryEntities,
            );

            expect(res.error).toEqual('unexpected_error');
            expect(res.response).toEqual(null);

            verify(context.categoriesServiceMock.create(deepEqual(categoryEntities[0]))).called();
            verify(spiedService.create(deepEqual(eventEntity))).called();
        });
    });
});
