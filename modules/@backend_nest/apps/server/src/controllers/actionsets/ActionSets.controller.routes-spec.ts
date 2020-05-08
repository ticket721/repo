import { createEvent, failWithCode, getSDKAndUser, getUser, waitForActionSet } from '../../../test/utils';
import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('createActions (POST /actions)', function() {
            test.concurrent('should properly create an event creation actionset', async function() {
                const {
                    sdk,
                    token,
                    user,
                    password,
                }: {
                    sdk: T721SDK;
                    token: string;
                    user: PasswordlessUserDto;
                    password: string;
                } = await getSDKAndUser(getCtx);

                const initialArgument = {};

                const actionSetName = 'event_create';

                const eventCreationActionSetRes = await sdk.actions.create(token, {
                    name: actionSetName,
                    arguments: initialArgument,
                });

                expect(eventCreationActionSetRes.data.actionset).toEqual({
                    id: eventCreationActionSetRes.data.actionset.id,
                    actions: eventCreationActionSetRes.data.actionset.actions,
                    links: [],
                    current_action: 0,
                    current_status: 'input:in progress',
                    name: '@events/creation',
                    dispatched_at: eventCreationActionSetRes.data.actionset.dispatched_at,
                });
            });

            test.concurrent('should fail for invalid initial arguments', async function() {
                const {
                    sdk,
                    token,
                    user,
                    password,
                }: {
                    sdk: T721SDK;
                    token: string;
                    user: PasswordlessUserDto;
                    password: string;
                } = await getSDKAndUser(getCtx);

                const initialArgument = {
                    name: 'event name',
                };

                const actionSetName = 'event_create';

                await failWithCode(
                    sdk.actions.create(token, {
                        name: actionSetName,
                        arguments: initialArgument,
                    }),
                    StatusCodes.BadRequest,
                );
            });

            test.concurrent('should fail creating an actionset for unauthenticated user', async function() {
                const {
                    sdk,
                    token,
                    user,
                    password,
                }: {
                    sdk: T721SDK;
                    token: string;
                    user: PasswordlessUserDto;
                    password: string;
                } = await getSDKAndUser(getCtx);

                const initialArgument = {};

                const actionSetName = 'event_create';

                await failWithCode(
                    sdk.actions.create(null, {
                        name: actionSetName,
                        arguments: initialArgument,
                    }),
                    StatusCodes.Unauthorized,
                );
            });
        });

        describe('updateAction (POST /:actionSetId)', function() {
            test.concurrent('should properly set data on action set first step', async function() {
                const {
                    sdk,
                    token,
                    user,
                    password,
                }: {
                    sdk: T721SDK;
                    token: string;
                    user: PasswordlessUserDto;
                    password: string;
                } = await getSDKAndUser(getCtx);

                const initialArgument = {};

                const actionSetName = 'event_create';

                const eventCreationActionSetRes = await sdk.actions.create(token, {
                    name: actionSetName,
                    arguments: initialArgument,
                });

                const eventUpdateRes = await sdk.actions.update(token, eventCreationActionSetRes.data.actionset.id, {
                    data: {
                        name: 'Event',
                        description: 'This is an event',
                        tags: ['test', 'event'],
                    },
                });

                const firstActionData = eventUpdateRes.data.actionset.actions[0].data;

                expect(JSON.parse(firstActionData)).toEqual({
                    name: 'Event',
                    description: 'This is an event',
                    tags: ['test', 'event'],
                });
            });

            test.concurrent('should properly set data on action set first step even if complete', async function() {
                const {
                    sdk,
                    token,
                    user,
                    password,
                }: {
                    sdk: T721SDK;
                    token: string;
                    user: PasswordlessUserDto;
                    password: string;
                } = await getSDKAndUser(getCtx);

                const initialArgument = {};

                const actionSetName = 'event_create';

                const eventCreationActionSetRes = await sdk.actions.create(token, {
                    name: actionSetName,
                    arguments: initialArgument,
                });

                const eventUpdateRes = await sdk.actions.update(token, eventCreationActionSetRes.data.actionset.id, {
                    data: {
                        name: 'Event',
                        description: 'This is an event',
                        tags: ['test', 'event'],
                    },
                });

                const firstActionData = eventUpdateRes.data.actionset.actions[0].data;

                expect(JSON.parse(firstActionData)).toEqual({
                    name: 'Event',
                    description: 'This is an event',
                    tags: ['test', 'event'],
                });

                await waitForActionSet(sdk, token, eventUpdateRes.data.actionset.id, (as: ActionSetEntity): boolean => {
                    return as.current_action === 1;
                });

                const secondEventUpdateRes = await sdk.actions.update(
                    token,
                    eventCreationActionSetRes.data.actionset.id,
                    {
                        action_idx: 0,
                        data: {
                            name: 'THE Event',
                            description: 'This is an event',
                            tags: ['test', 'event'],
                        },
                    },
                );

                const finalActionData = JSON.parse(secondEventUpdateRes.data.actionset.actions[0].data);

                expect(finalActionData).toEqual({
                    name: 'THE Event',
                    description: 'This is an event',
                    tags: ['test', 'event'],
                });
            });

            test.concurrent('should fail updating action above current index', async function() {
                const {
                    sdk,
                    token,
                    user,
                    password,
                }: {
                    sdk: T721SDK;
                    token: string;
                    user: PasswordlessUserDto;
                    password: string;
                } = await getSDKAndUser(getCtx);

                const initialArgument = {};

                const actionSetName = 'event_create';

                const eventCreationActionSetRes = await sdk.actions.create(token, {
                    name: actionSetName,
                    arguments: initialArgument,
                });

                await failWithCode(
                    sdk.actions.update(token, eventCreationActionSetRes.data.actionset.id, {
                        action_idx: 1,
                        data: {
                            name: 'Event',
                            description: 'This is an event',
                            tags: ['test', 'event'],
                        },
                    }),
                    StatusCodes.BadRequest,
                );
            });

            test.concurrent('should fail on private action set update', async function() {
                const {
                    sdk,
                    token,
                    user,
                    password,
                }: {
                    sdk: T721SDK;
                    token: string;
                    user: PasswordlessUserDto;
                    password: string;
                } = await getSDKAndUser(getCtx);

                const event = await createEvent(token, sdk);

                const cartActionSetRes = await sdk.actions.create(token, {
                    name: 'cart_create',
                    arguments: {},
                });

                const actionSetId = cartActionSetRes.data.actionset.id;

                await sdk.cart.ticketSelections(token, actionSetId, {
                    tickets: [
                        ...[...Array(3)].map(() => ({
                            categoryId: event.categories[0],
                            price: {
                                currency: 'Fiat',
                                price: '100',
                            },
                        })),
                    ],
                });

                await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
                    return as.current_action === 1;
                });

                await sdk.cart.modulesConfiguration(token, actionSetId, {});

                await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
                    return as.current_action === 2;
                });

                await sdk.checkout.cart.commit.stripe(token, {
                    cart: actionSetId,
                });

                await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
                    return as.current_status === 'complete';
                });

                await failWithCode(
                    sdk.actions.update(token, actionSetId, {
                        action_idx: 2,
                        data: {},
                    }),
                    StatusCodes.Unauthorized,
                );
            });
        });

        describe('search (GET /actions/search)', function() {
            test.concurrent('should search for my actionsets only', async function() {
                const {
                    sdk,
                    token,
                    user,
                    password,
                }: {
                    sdk: T721SDK;
                    token: string;
                    user: PasswordlessUserDto;
                    password: string;
                } = await getSDKAndUser(getCtx);

                const otherUser = await getUser(sdk);

                const initialArgument = {};

                const actionSetName = 'event_create';

                const eventCreationActionSetRes = await sdk.actions.create(token, {
                    name: actionSetName,
                    arguments: initialArgument,
                });

                await sdk.actions.create(otherUser.token, {
                    name: actionSetName,
                    arguments: initialArgument,
                });

                const actionSets = await sdk.actions.search(token, {});

                expect(actionSets.data.actionsets.length).toEqual(1);
                expect(actionSets.data.actionsets[0].id).toEqual(eventCreationActionSetRes.data.actionset.id);
            });
        });
    };
}
