import { Test, TestingModule } from '@nestjs/testing';
import { deepEqual, instance, mock, when } from 'ts-mockito';
import { uuid } from '@iaminfinity/express-cassandra';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ESSearchReturn } from '@lib/common/utils/ESSearchReturn';
import { DatesController } from '@app/server/controllers/dates/Dates.controller';
import { DatesService } from '@lib/common/dates/Dates.service';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';

const context: {
    datesController: DatesController;
    datesServiceMock: DatesService;
} = {
    datesController: null,
    datesServiceMock: null,
};

describe('Dates Controller', function() {
    beforeEach(async function() {
        const actionsSetsServiceMock: DatesService = mock(DatesService);

        const DatesServiceProvider = {
            provide: DatesService,
            useValue: instance(actionsSetsServiceMock),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [DatesServiceProvider],
            controllers: [DatesController],
        }).compile();

        context.datesController = module.get<DatesController>(DatesController);
        context.datesServiceMock = actionsSetsServiceMock;
    });

    describe('search', function() {
        test('should search for action sets', async function() {
            const query = {
                location_label: {
                    $eq: '3 rue des boulevards',
                },
            };

            const internalEsQuery = {
                body: {
                    query: {
                        bool: {
                            must: {
                                term: {
                                    location_label: '3 rue des boulevards',
                                },
                            },
                        },
                    },
                },
            };

            const entities: DateEntity[] = [
                {
                    id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                    location_label: '3 rue des boulevards',
                    location: {
                        lon: 1,
                        lat: 2,
                    },
                    assigned_city: 123,
                    categories: [],
                    metadata: {
                        name: 'hi',
                    },
                    event_begin: new Date(Date.now()),
                    event_end: new Date(Date.now() + 10000),
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                    parent_id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                    parent_type: 'event',
                    status: 'preview',
                },
            ];

            const esReturn: ESSearchReturn<DateEntity> = {
                took: 1,
                timed_out: false,
                _shards: {
                    total: 1,
                    successful: 1,
                    skipped: 0,
                    failed: 0,
                },
                hits: {
                    total: 1,
                    max_score: 1,
                    hits: [
                        {
                            _index: 'yes',
                            _type: 'actionset',
                            _id: 'yes',
                            _score: 1,
                            _source: entities[0],
                        },
                    ],
                },
            };

            when(context.datesServiceMock.searchElastic(deepEqual(internalEsQuery))).thenResolve({
                error: null,
                response: esReturn,
            });

            const res = await context.datesController.search(query, {
                id: uuid('ec677b12-d420-43a6-a597-ef84bf09f845') as any,
            } as UserDto);

            expect(res.dates).toEqual(entities);
        });
    });
});
