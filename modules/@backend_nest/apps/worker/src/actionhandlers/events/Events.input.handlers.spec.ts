import { deepEqual, instance, mock, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ImagesService } from '@lib/common/images/Images.service';
import {
    EventsCreateImagesMetadata,
    EventsInputHandlers,
} from '@app/worker/actionhandlers/events/Events.input.handlers';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { ActionSet } from '@lib/common/actionsets/helper/ActionSet.class';

const context: {
    actionSetsServiceMock: ActionSetsService;
    imagesServiceMock: ImagesService;
    eventsInputHandler: EventsInputHandlers;
} = {
    actionSetsServiceMock: null,
    imagesServiceMock: null,
    eventsInputHandler: null,
};

describe('Event Input Handlers', function() {
    beforeEach(async function() {
        context.actionSetsServiceMock = mock(ActionSetsService);
        context.imagesServiceMock = mock(ImagesService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ActionSetsService,
                    useValue: instance(context.actionSetsServiceMock),
                },
                {
                    provide: ImagesService,
                    useValue: instance(context.imagesServiceMock),
                },
                EventsInputHandlers,
            ],
        }).compile();

        context.eventsInputHandler = module.get<EventsInputHandlers>(EventsInputHandlers);
    });

    describe('@events/textMetadata', function() {
        it('should validate text metadata', async function() {
            const textData = {
                name: 'event name',
                description: 'event description',
                tags: ['event', 'test'],
            };

            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'waiting',
                        name: '@events/textMetadata',
                        data: JSON.stringify(textData),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.textMetadataHandler(
                context.eventsInputHandler.textMetadataFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/textMetadata',
                        data: JSON.stringify(textData),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'complete',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should error on invalid name', async function() {
            const textData = {
                description: 'event description',
                tags: ['event', 'test'],
                name: 123,
            };

            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'waiting',
                        name: '@events/textMetadata',
                        data: JSON.stringify(textData),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.textMetadataHandler(
                context.eventsInputHandler.textMetadataFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'error',
                        name: '@events/textMetadata',
                        data: JSON.stringify(textData),
                        type: 'input',
                        error:
                            '{"details":{"_original":{"description":"event description","tags":["event","test"],"name":123},"details":[{"message":"\\"name\\" must be a string","path":["name"],"type":"string.base","context":{"label":"name","value":123,"key":"name"}}]},"error":"validation_error"}',
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:error',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should incomplete on missing name', async function() {
            const textData = {
                description: 'event description',
                tags: ['event', 'test'],
            };

            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'waiting',
                        name: '@events/textMetadata',
                        data: JSON.stringify(textData),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.textMetadataHandler(
                context.eventsInputHandler.textMetadataFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'incomplete',
                        name: '@events/textMetadata',
                        data: JSON.stringify(textData),
                        type: 'input',
                        error: '{"details":["name"],"error":"incomplete_error"}',
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:incomplete',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });
    });

    describe('@events/modulesConfiguration', function() {
        it('should validate modules configuration', async function() {
            const modulesConfiguration = {};

            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'waiting',
                        name: '@events/modulesConfiguration',
                        data: JSON.stringify(modulesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.modulesConfigurationHandler(
                context.eventsInputHandler.modulesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/modulesConfiguration',
                        data: JSON.stringify(modulesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'complete',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should error on extra config field', async function() {
            const modulesConfiguration = {
                name: 'useless',
            };

            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'waiting',
                        name: '@events/modulesConfiguration',
                        data: JSON.stringify(modulesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.modulesConfigurationHandler(
                context.eventsInputHandler.modulesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'error',
                        name: '@events/modulesConfiguration',
                        data: JSON.stringify(modulesConfiguration),
                        type: 'input',
                        error:
                            '{"details":{"_original":{"name":"useless"},"details":[{"message":"\\"name\\" is not allowed","path":["name"],"type":"object.unknown","context":{"child":"name","label":"name","value":"useless","key":"name"}}]},"error":"validation_error"}',
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:error',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });
    });

    describe('@events/datesConfiguration', function() {
        it('should validate dates configuration', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const datesConfiguration = {
                dates: [
                    {
                        name: 'Bataclan',
                        eventBegin: created_at,
                        eventEnd: new Date(created_at.getTime() + 1000 * 60 * 60 * 24),
                        location: {
                            label: '50 Boulevard Voltaire, 75011 Paris',
                            lat: 48.86311,
                            lon: 2.37087,
                        },
                    },
                ],
            };

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'waiting',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.datesConfigurationHandler(
                context.eventsInputHandler.datesConfigurationFields,
                actionSet,
                progress,
            );

            (datesConfiguration as any).dates[0].city = {
                name: 'Paris',
                nameAscii: 'Paris',
                nameAdmin: 'Île-de-France',
                country: 'France',
                coord: {
                    lat: 48.8667,
                    lon: 2.3333,
                },
                population: 9904000,
                id: 1250015082,
            };

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'complete',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should fail on missing date name', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const datesConfiguration = {
                dates: [
                    {
                        eventBegin: created_at,
                        eventEnd: new Date(created_at.getTime() + 1000 * 60 * 60 * 24),
                        location: {
                            label: '50 Boulevard Voltaire, 75011 Paris',
                            lat: 48.86311,
                            lon: 2.37087,
                        },
                    },
                ],
            };

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'waiting',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.datesConfigurationHandler(
                context.eventsInputHandler.datesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'error',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: `{\"details\":{\"_original\":{\"dates\":[{\"eventBegin\":"${created_at.toISOString()}",\"eventEnd\":"${new Date(
                            created_at.getTime() + 1000 * 60 * 60 * 24,
                        ).toISOString()}",\"location\":{\"label\":\"50 Boulevard Voltaire, 75011 Paris\",\"lat\":48.86311,\"lon\":2.37087}}]},\"details\":[{\"message\":\"\\\"dates[0].name\\\" is required\",\"path\":[\"dates\",0,\"name\"],\"type\":\"any.required\",\"context\":{\"label\":\"dates[0].name\",\"key\":\"name\"}}]},\"error\":\"validation_error\"}`,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:error',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should incomplete on missing date', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const datesConfiguration = {};

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'waiting',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.datesConfigurationHandler(
                context.eventsInputHandler.datesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'incomplete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: '{"details":["dates"],"error":"incomplete_error"}',
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:incomplete',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should throw on invalid end date', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const datesConfiguration = {
                dates: [
                    {
                        name: 'Bataclan',
                        eventEnd: created_at,
                        eventBegin: new Date(created_at.getTime() + 1000 * 60 * 60 * 24),
                        location: {
                            label: '50 Boulevard Voltaire, 75011 Paris',
                            lat: 48.86311,
                            lon: 2.37087,
                        },
                    },
                ],
            };

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'waiting',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.datesConfigurationHandler(
                context.eventsInputHandler.datesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'error',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: '{"details":null,"error":"event_end_before_event_begin"}',
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:error',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });
    });

    describe('@events/categoriesConfiguration', function() {
        it('should validate categories configuration', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const datesConfiguration = {
                dates: [
                    {
                        name: 'Bataclan',
                        eventBegin: created_at,
                        eventEnd: new Date(created_at.getTime() + 1000 * 60 * 60 * 24),
                        location: {
                            label: '50 Boulevard Voltaire, 75011 Paris',
                            lat: 48.86311,
                            lon: 2.37087,
                        },
                    },
                ],
            };

            const resaleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const saleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const categoriesConfiguration = {
                global: [
                    {
                        name: 'vip',
                        resaleBegin,
                        resaleEnd: created_at,
                        saleBegin,
                        saleEnd: created_at,
                        seats: 100,
                        currencies: [
                            {
                                currency: 'Fiat',
                                price: '100',
                            },
                        ],
                    },
                ],
                dates: [
                    [
                        {
                            name: 'regular',
                            resaleBegin,
                            resaleEnd: created_at,
                            saleBegin,
                            saleEnd: created_at,
                            seats: 1000,
                            currencies: [
                                {
                                    currency: 'Fiat',
                                    price: '10',
                                },
                            ],
                        },
                    ],
                ],
            };

            const resultingCategoriesConfiguration = {
                global: [
                    {
                        name: 'vip',
                        resaleBegin,
                        resaleEnd: created_at,
                        saleBegin,
                        saleEnd: created_at,
                        seats: 100,
                        currencies: [
                            {
                                currency: 'Fiat',
                                price: '100',
                            },
                        ],
                        serializedName: 'vip',
                    },
                ],
                dates: [
                    [
                        {
                            name: 'regular',
                            resaleBegin,
                            resaleEnd: created_at,
                            saleBegin,
                            saleEnd: created_at,
                            seats: 1000,
                            currencies: [
                                {
                                    currency: 'Fiat',
                                    price: '10',
                                },
                            ],
                            serializedName: 'regular_0',
                        },
                    ],
                ],
            };

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'waiting',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.categoriesConfigurationHandler(
                context.eventsInputHandler.categoriesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(resultingCategoriesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'complete',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should validate categories configuration with no resale', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const datesConfiguration = {
                dates: [
                    {
                        name: 'Bataclan',
                        eventBegin: created_at,
                        eventEnd: new Date(created_at.getTime() + 1000 * 60 * 60 * 24),
                        location: {
                            label: '50 Boulevard Voltaire, 75011 Paris',
                            lat: 48.86311,
                            lon: 2.37087,
                        },
                    },
                ],
            };

            const saleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const categoriesConfiguration = {
                global: [
                    {
                        name: 'vip',
                        seats: 100,
                        saleBegin,
                        saleEnd: created_at,
                        currencies: [
                            {
                                currency: 'Fiat',
                                price: '100',
                            },
                        ],
                    },
                ],
                dates: [
                    [
                        {
                            name: 'regular',
                            seats: 1000,
                            saleBegin,
                            saleEnd: created_at,
                            currencies: [
                                {
                                    currency: 'Fiat',
                                    price: '10',
                                },
                            ],
                        },
                    ],
                ],
            };

            const resultingCategoriesConfiguration = {
                global: [
                    {
                        name: 'vip',
                        seats: 100,
                        saleBegin,
                        saleEnd: created_at,
                        currencies: [
                            {
                                currency: 'Fiat',
                                price: '100',
                            },
                        ],
                        serializedName: 'vip',
                        resaleBegin: null,
                        resaleEnd: null,
                    },
                ],
                dates: [
                    [
                        {
                            name: 'regular',
                            seats: 1000,
                            saleBegin,
                            saleEnd: created_at,
                            currencies: [
                                {
                                    currency: 'Fiat',
                                    price: '10',
                                },
                            ],
                            serializedName: 'regular_0',
                            resaleBegin: null,
                            resaleEnd: null,
                        },
                    ],
                ],
            };

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'waiting',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.categoriesConfigurationHandler(
                context.eventsInputHandler.categoriesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'complete',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(resultingCategoriesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'complete',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should incomplete on missing payload', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const datesConfiguration = {
                dates: [
                    {
                        name: 'Bataclan',
                        eventBegin: created_at,
                        eventEnd: new Date(created_at.getTime() + 1000 * 60 * 60 * 24),
                        location: {
                            label: '50 Boulevard Voltaire, 75011 Paris',
                            lat: 48.86311,
                            lon: 2.37087,
                        },
                    },
                ],
            };

            const saleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const categoriesConfiguration = {};

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'waiting',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.categoriesConfigurationHandler(
                context.eventsInputHandler.categoriesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'incomplete',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: '{"details":["global","dates"],"error":"incomplete_error"}',
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:incomplete',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should fail on invalid payload', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const datesConfiguration = {
                dates: [
                    {
                        name: 'Bataclan',
                        eventBegin: created_at,
                        eventEnd: new Date(created_at.getTime() + 1000 * 60 * 60 * 24),
                        location: {
                            label: '50 Boulevard Voltaire, 75011 Paris',
                            lat: 48.86311,
                            lon: 2.37087,
                        },
                    },
                ],
            };

            const saleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const categoriesConfiguration = {
                global: [
                    {
                        name: 'vip',
                        seats: 100,
                        saleBegin,
                        saleEnd: created_at,
                    },
                ],
                dates: [
                    [
                        {
                            name: 'regular',
                            seats: 1000,
                            saleBegin,
                            saleEnd: created_at,
                            currencies: [
                                {
                                    currency: 'Fiat',
                                    price: '10',
                                },
                            ],
                        },
                    ],
                ],
            };

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'waiting',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.categoriesConfigurationHandler(
                context.eventsInputHandler.categoriesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'error',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: `{"details":{"_original":{"global":[{"name":"vip","seats":100,"saleBegin":"${saleBegin.toISOString()}","saleEnd":"${created_at.toISOString()}"}],"dates":[[{"name":"regular","seats":1000,"saleBegin":"${saleBegin.toISOString()}","saleEnd":"${created_at.toISOString()}","currencies":[{"currency":"Fiat","price":"10"}]}]]},"details":[{"message":"\\"global[0].currencies\\" is required","path":["global",0,"currencies"],"type":"any.required","context":{"label":"global[0].currencies","key":"currencies"}}]},"error":"validation_error"}`,
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:error',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should fail on missing global resaleBegin', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const datesConfiguration = {
                dates: [
                    {
                        name: 'Bataclan',
                        eventBegin: created_at,
                        eventEnd: new Date(created_at.getTime() + 1000 * 60 * 60 * 24),
                        location: {
                            label: '50 Boulevard Voltaire, 75011 Paris',
                            lat: 48.86311,
                            lon: 2.37087,
                        },
                    },
                ],
            };

            const resaleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const saleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const categoriesConfiguration = {
                global: [
                    {
                        name: 'vip',
                        resaleEnd: created_at,
                        saleBegin,
                        saleEnd: created_at,
                        seats: 100,
                        currencies: [
                            {
                                currency: 'Fiat',
                                price: '100',
                            },
                        ],
                    },
                ],
                dates: [
                    [
                        {
                            name: 'regular',
                            resaleBegin,
                            resaleEnd: created_at,
                            saleBegin,
                            saleEnd: created_at,
                            seats: 1000,
                            currencies: [
                                {
                                    currency: 'Fiat',
                                    price: '10',
                                },
                            ],
                        },
                    ],
                ],
            };

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'waiting',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.categoriesConfigurationHandler(
                context.eventsInputHandler.categoriesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'error',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: '{"details":null,"error":"resale_dates_should_both_be_defined"}',
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:error',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should fail on missing global resaleEnd', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const datesConfiguration = {
                dates: [
                    {
                        name: 'Bataclan',
                        eventBegin: created_at,
                        eventEnd: new Date(created_at.getTime() + 1000 * 60 * 60 * 24),
                        location: {
                            label: '50 Boulevard Voltaire, 75011 Paris',
                            lat: 48.86311,
                            lon: 2.37087,
                        },
                    },
                ],
            };

            const resaleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const saleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const categoriesConfiguration = {
                global: [
                    {
                        name: 'vip',
                        resaleBegin: created_at,
                        saleBegin,
                        saleEnd: created_at,
                        seats: 100,
                        currencies: [
                            {
                                currency: 'Fiat',
                                price: '100',
                            },
                        ],
                    },
                ],
                dates: [
                    [
                        {
                            name: 'regular',
                            resaleBegin,
                            resaleEnd: created_at,
                            saleBegin,
                            saleEnd: created_at,
                            seats: 1000,
                            currencies: [
                                {
                                    currency: 'Fiat',
                                    price: '10',
                                },
                            ],
                        },
                    ],
                ],
            };

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'waiting',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.categoriesConfigurationHandler(
                context.eventsInputHandler.categoriesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'error',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: '{"details":null,"error":"resale_dates_should_both_be_defined"}',
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:error',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should fail on missing date resaleBegin', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const datesConfiguration = {
                dates: [
                    {
                        name: 'Bataclan',
                        eventBegin: created_at,
                        eventEnd: new Date(created_at.getTime() + 1000 * 60 * 60 * 24),
                        location: {
                            label: '50 Boulevard Voltaire, 75011 Paris',
                            lat: 48.86311,
                            lon: 2.37087,
                        },
                    },
                ],
            };

            const resaleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const saleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const categoriesConfiguration = {
                global: [
                    {
                        name: 'vip',
                        resaleBegin,
                        resaleEnd: created_at,
                        saleBegin,
                        saleEnd: created_at,
                        seats: 100,
                        currencies: [
                            {
                                currency: 'Fiat',
                                price: '100',
                            },
                        ],
                    },
                ],
                dates: [
                    [
                        {
                            name: 'regular',
                            resaleEnd: created_at,
                            saleBegin,
                            saleEnd: created_at,
                            seats: 1000,
                            currencies: [
                                {
                                    currency: 'Fiat',
                                    price: '10',
                                },
                            ],
                        },
                    ],
                ],
            };

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'waiting',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.categoriesConfigurationHandler(
                context.eventsInputHandler.categoriesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'error',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: '{"details":null,"error":"resale_dates_should_both_be_defined"}',
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:error',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should fail on missing date resaleEnd', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const datesConfiguration = {
                dates: [
                    {
                        name: 'Bataclan',
                        eventBegin: created_at,
                        eventEnd: new Date(created_at.getTime() + 1000 * 60 * 60 * 24),
                        location: {
                            label: '50 Boulevard Voltaire, 75011 Paris',
                            lat: 48.86311,
                            lon: 2.37087,
                        },
                    },
                ],
            };

            const resaleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const saleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const categoriesConfiguration = {
                global: [
                    {
                        name: 'vip',
                        resaleBegin,
                        resaleEnd: created_at,
                        saleBegin,
                        saleEnd: created_at,
                        seats: 100,
                        currencies: [
                            {
                                currency: 'Fiat',
                                price: '100',
                            },
                        ],
                    },
                ],
                dates: [
                    [
                        {
                            name: 'regular',
                            resaleBegin,
                            saleBegin,
                            saleEnd: created_at,
                            seats: 1000,
                            currencies: [
                                {
                                    currency: 'Fiat',
                                    price: '10',
                                },
                            ],
                        },
                    ],
                ],
            };

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'waiting',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.categoriesConfigurationHandler(
                context.eventsInputHandler.categoriesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'error',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: '{"details":null,"error":"resale_dates_should_both_be_defined"}',
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:error',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should fail on resaleEnd before resaleBegin', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const datesConfiguration = {
                dates: [
                    {
                        name: 'Bataclan',
                        eventBegin: created_at,
                        eventEnd: new Date(created_at.getTime() + 1000 * 60 * 60 * 24),
                        location: {
                            label: '50 Boulevard Voltaire, 75011 Paris',
                            lat: 48.86311,
                            lon: 2.37087,
                        },
                    },
                ],
            };

            const resaleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const saleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const categoriesConfiguration = {
                global: [
                    {
                        name: 'vip',
                        resaleBegin: created_at,
                        resaleEnd: resaleBegin,
                        saleBegin,
                        saleEnd: created_at,
                        seats: 100,
                        currencies: [
                            {
                                currency: 'Fiat',
                                price: '100',
                            },
                        ],
                    },
                ],
                dates: [
                    [
                        {
                            name: 'regular',
                            resaleBegin,
                            saleBegin,
                            saleEnd: created_at,
                            seats: 1000,
                            currencies: [
                                {
                                    currency: 'Fiat',
                                    price: '10',
                                },
                            ],
                        },
                    ],
                ],
            };

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'waiting',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.categoriesConfigurationHandler(
                context.eventsInputHandler.categoriesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'error',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: '{"details":null,"error":"resale_end_before_resale_begin"}',
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:error',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should fail on saleEnd before saleBegin', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const datesConfiguration = {
                dates: [
                    {
                        name: 'Bataclan',
                        eventBegin: created_at,
                        eventEnd: new Date(created_at.getTime() + 1000 * 60 * 60 * 24),
                        location: {
                            label: '50 Boulevard Voltaire, 75011 Paris',
                            lat: 48.86311,
                            lon: 2.37087,
                        },
                    },
                ],
            };

            const resaleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const saleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const categoriesConfiguration = {
                global: [
                    {
                        name: 'vip',
                        resaleBegin,
                        resaleEnd: created_at,
                        saleBegin: created_at,
                        saleEnd: saleBegin,
                        seats: 100,
                        currencies: [
                            {
                                currency: 'Fiat',
                                price: '100',
                            },
                        ],
                    },
                ],
                dates: [
                    [
                        {
                            name: 'regular',
                            saleBegin,
                            saleEnd: created_at,
                            seats: 1000,
                            currencies: [
                                {
                                    currency: 'Fiat',
                                    price: '10',
                                },
                            ],
                        },
                    ],
                ],
            };

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'waiting',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.categoriesConfigurationHandler(
                context.eventsInputHandler.categoriesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'error',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: '{"details":null,"error":"sale_end_before_sale_begin"}',
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:error',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('invalid dates length', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const datesConfiguration = {
                dates: [
                    {
                        name: 'Bataclan',
                        eventBegin: created_at,
                        eventEnd: new Date(created_at.getTime() + 1000 * 60 * 60 * 24),
                        location: {
                            label: '50 Boulevard Voltaire, 75011 Paris',
                            lat: 48.86311,
                            lon: 2.37087,
                        },
                    },
                ],
            };

            const resaleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const saleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const categoriesConfiguration = {
                global: [
                    {
                        name: 'vip',
                        resaleBegin,
                        resaleEnd: created_at,
                        saleBegin,
                        saleEnd: created_at,
                        seats: 100,
                        currencies: [
                            {
                                currency: 'Fiat',
                                price: '100',
                            },
                        ],
                    },
                ],
                dates: [
                    [
                        {
                            name: 'regular',
                            resaleBegin,
                            resaleEnd: created_at,
                            saleBegin,
                            saleEnd: created_at,
                            seats: 1000,
                            currencies: [
                                {
                                    currency: 'Fiat',
                                    price: '10',
                                },
                            ],
                        },
                    ],
                    [
                        {
                            name: 'regular',
                            resaleBegin,
                            resaleEnd: created_at,
                            saleBegin,
                            saleEnd: created_at,
                            seats: 1000,
                            currencies: [
                                {
                                    currency: 'Fiat',
                                    price: '10',
                                },
                            ],
                        },
                    ],
                ],
            };

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'waiting',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.categoriesConfigurationHandler(
                context.eventsInputHandler.categoriesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'error',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: '{"details":null,"error":"invalid_categories_per_dates_ratio"}',
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:error',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('global category name conflict', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const datesConfiguration = {
                dates: [
                    {
                        name: 'Bataclan',
                        eventBegin: created_at,
                        eventEnd: new Date(created_at.getTime() + 1000 * 60 * 60 * 24),
                        location: {
                            label: '50 Boulevard Voltaire, 75011 Paris',
                            lat: 48.86311,
                            lon: 2.37087,
                        },
                    },
                ],
            };

            const resaleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const saleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const categoriesConfiguration = {
                global: [
                    {
                        name: 'vip',
                        resaleBegin,
                        resaleEnd: created_at,
                        saleBegin,
                        saleEnd: created_at,
                        seats: 100,
                        currencies: [
                            {
                                currency: 'Fiat',
                                price: '100',
                            },
                        ],
                    },
                    {
                        name: 'vip',
                        resaleBegin,
                        resaleEnd: created_at,
                        saleBegin,
                        saleEnd: created_at,
                        seats: 100,
                        currencies: [
                            {
                                currency: 'Fiat',
                                price: '100',
                            },
                        ],
                    },
                ],
                dates: [
                    [
                        {
                            name: 'regular',
                            resaleBegin,
                            resaleEnd: created_at,
                            saleBegin,
                            saleEnd: created_at,
                            seats: 1000,
                            currencies: [
                                {
                                    currency: 'Fiat',
                                    price: '10',
                                },
                            ],
                        },
                    ],
                ],
            };

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'waiting',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.categoriesConfigurationHandler(
                context.eventsInputHandler.categoriesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'error',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: '{"details":null,"error":"categories_name_conflict"}',
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:error',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('dates category name conflict', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const datesConfiguration = {
                dates: [
                    {
                        name: 'Bataclan',
                        eventBegin: created_at,
                        eventEnd: new Date(created_at.getTime() + 1000 * 60 * 60 * 24),
                        location: {
                            label: '50 Boulevard Voltaire, 75011 Paris',
                            lat: 48.86311,
                            lon: 2.37087,
                        },
                    },
                ],
            };

            const resaleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const saleBegin = new Date(created_at.getTime() - 1000 * 60 * 60 * 24);

            const categoriesConfiguration = {
                global: [
                    {
                        name: 'vip',
                        resaleBegin,
                        resaleEnd: created_at,
                        saleBegin,
                        saleEnd: created_at,
                        seats: 100,
                        currencies: [
                            {
                                currency: 'Fiat',
                                price: '100',
                            },
                        ],
                    },
                ],
                dates: [
                    [
                        {
                            name: 'regular',
                            resaleBegin,
                            resaleEnd: created_at,
                            saleBegin,
                            saleEnd: created_at,
                            seats: 1000,
                            currencies: [
                                {
                                    currency: 'Fiat',
                                    price: '10',
                                },
                            ],
                        },
                        {
                            name: 'regular',
                            resaleBegin,
                            resaleEnd: created_at,
                            saleBegin,
                            saleEnd: created_at,
                            seats: 1000,
                            currencies: [
                                {
                                    currency: 'Fiat',
                                    price: '10',
                                },
                            ],
                        },
                    ],
                ],
            };

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'waiting',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.categoriesConfigurationHandler(
                context.eventsInputHandler.categoriesConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/datesConfiguration',
                        data: JSON.stringify(datesConfiguration),
                        type: 'input',
                        error: null,
                    },
                    {
                        status: 'error',
                        name: '@events/categoriesConfiguration',
                        data: JSON.stringify(categoriesConfiguration),
                        type: 'input',
                        error: '{"details":null,"error":"categories_name_conflict"}',
                    },
                ],
                links: [],
                current_action: 1,
                current_status: 'input:error',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });
    });

    describe('@events/imagesMetadata', function() {
        it('should validate images configuration', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const imagesMetadata: EventsCreateImagesMetadata = {
                avatar: 'ec677b12-d420-43a6-a597-ef84bf09f845',
            };

            when(
                context.imagesServiceMock.search(
                    deepEqual({
                        id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [
                    {
                        id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                        mimetype: 'type',
                        size: 10000,
                        encoding: 'encoding',
                        hash: 'hash',
                        links: 0,
                        created_at,
                        updated_at,
                    },
                ],
            });

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'waiting',
                        name: '@events/imagesMetadata',
                        data: JSON.stringify(imagesMetadata),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.imagesMetadataHandler(
                context.eventsInputHandler.imagesMetadataFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/imagesMetadata',
                        data: JSON.stringify(imagesMetadata),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'complete',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should fail on avatar empty res', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const imagesMetadata = {
                avatar: 'ec677b12-d420-43a6-a597-ef84bf09f845',
            };

            when(
                context.imagesServiceMock.search(
                    deepEqual({
                        id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                    }),
                ),
            ).thenResolve({
                error: null,
                response: [],
            });

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'waiting',
                        name: '@events/imagesMetadata',
                        data: JSON.stringify(imagesMetadata),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.imagesMetadataHandler(
                context.eventsInputHandler.imagesMetadataFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'error',
                        name: '@events/imagesMetadata',
                        data: JSON.stringify(imagesMetadata),
                        type: 'input',
                        error: '{"error":"cannot_find_image"}',
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:error',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should fail on avatar error res', async function() {
            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const imagesMetadata = {
                avatar: 'ec677b12-d420-43a6-a597-ef84bf09f845',
            };

            when(
                context.imagesServiceMock.search(
                    deepEqual({
                        id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                    }),
                ),
            ).thenResolve({
                error: 'unexpected_error',
                response: [
                    {
                        id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                        mimetype: 'type',
                        size: 10000,
                        encoding: 'encoding',
                        hash: 'hash',
                        links: 0,
                        created_at,
                        updated_at,
                    },
                ],
            });

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'waiting',
                        name: '@events/imagesMetadata',
                        data: JSON.stringify(imagesMetadata),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.imagesMetadataHandler(
                context.eventsInputHandler.imagesMetadataFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'error',
                        name: '@events/imagesMetadata',
                        data: JSON.stringify(imagesMetadata),
                        type: 'input',
                        error: '{"error":"cannot_find_image"}',
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:error',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });
    });

    describe('@events/adminsConfiguration', function() {
        it('should admins Configuration', async function() {
            const adminsConfiguration = {
                admins: [],
            };

            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'waiting',
                        name: '@events/adminsConfiguration',
                        data: JSON.stringify(adminsConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.adminsConfigurationHandler(
                context.eventsInputHandler.adminsConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'complete',
                        name: '@events/adminsConfiguration',
                        data: JSON.stringify(adminsConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'complete',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should error on extra field', async function() {
            const adminsConfiguration = {
                name: 'useless',
            };

            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'waiting',
                        name: '@events/adminsConfiguration',
                        data: JSON.stringify(adminsConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.adminsConfigurationHandler(
                context.eventsInputHandler.adminsConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'error',
                        name: '@events/adminsConfiguration',
                        data: JSON.stringify(adminsConfiguration),
                        type: 'input',
                        error:
                            '{"details":{"_original":{"name":"useless"},"details":[{"message":"\\"name\\" is not allowed","path":["name"],"type":"object.unknown","context":{"child":"name","label":"name","value":"useless","key":"name"}}]},"error":"validation_error"}',
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:error',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });

        it('should error on missing admin field', async function() {
            const adminsConfiguration = {};

            const created_at = new Date(Date.now());
            const updated_at = created_at;
            const dispatched_at = created_at;

            const actionSetEntity: ActionSetEntity = {
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'waiting',
                        name: '@events/adminsConfiguration',
                        data: JSON.stringify(adminsConfiguration),
                        type: 'input',
                        error: null,
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:waiting',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            };

            const actionSet: ActionSet = new ActionSet().load(actionSetEntity);
            const progress = async (p: number) => {};

            const [resActionSet, update] = await context.eventsInputHandler.adminsConfigurationHandler(
                context.eventsInputHandler.adminsConfigurationFields,
                actionSet,
                progress,
            );

            expect(update).toEqual(true);
            expect(resActionSet.raw).toEqual({
                id: 'ec677b12-d420-43a6-a597-ef84bf09f845',
                actions: [
                    {
                        status: 'incomplete',
                        name: '@events/adminsConfiguration',
                        data: JSON.stringify(adminsConfiguration),
                        type: 'input',
                        error: '{"details":["admins"],"error":"incomplete_error"}',
                    },
                ],
                links: [],
                current_action: 0,
                current_status: 'input:incomplete',
                name: '@event/creation',
                created_at,
                updated_at,
                dispatched_at,
            });
        });
    });
});
