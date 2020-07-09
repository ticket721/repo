import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import {
    createEvent,
    createEventWithUltraVIP,
    createExpensiveEvent,
    createPaymentIntent,
    failWithCode,
    gemFail,
    getMocks,
    getSDKAndUser,
    getUser,
    setPaymentIntent,
    waitForActionSet,
    waitForTickets,
} from '../../../test/utils';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { Stripe } from 'stripe';
import { deepEqual, when } from 'ts-mockito';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('commitStripe (POST /checkout/cart/commit/stripe)', function() {
            test('should create, fill and commit cart', async function() {
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
            });

            test('should create, fill, commit & update cart', async function() {
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

                await sdk.cart.ticketSelections(token, actionSetId, {
                    tickets: [
                        ...[...Array(2)].map(() => ({
                            categoryId: event.categories[0],
                            price: {
                                currency: 'Fiat',
                                price: '100',
                            },
                        })),
                    ],
                });

                await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
                    return as.current_status === 'input:error';
                });
            });

            test('should create, fill, commit, update & re-commit cart', async function() {
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

                await sdk.cart.ticketSelections(token, actionSetId, {
                    tickets: [
                        ...[...Array(2)].map(() => ({
                            categoryId: event.categories[0],
                            price: {
                                currency: 'Fiat',
                                price: '100',
                            },
                        })),
                    ],
                });

                await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
                    return as.current_status === 'input:error';
                });

                await sdk.checkout.cart.commit.stripe(token, {
                    cart: actionSetId,
                });

                await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
                    return as.current_status === 'complete';
                });
            });

            test('should fail on invalid actionset type', async function() {
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

                const eventCreationActionSetRes = await sdk.actions.create(token, {
                    name: 'event_create',
                    arguments: {},
                });

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

                await failWithCode(
                    sdk.checkout.cart.commit.stripe(token, {
                        cart: eventCreationActionSetRes.data.actionset.id,
                    }),
                    StatusCodes.BadRequest,
                    'actionset_not_a_cart',
                );
            });

            test('should fail on ticket selection incomplete step', async function() {
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

                await failWithCode(
                    sdk.checkout.cart.commit.stripe(token, {
                        cart: actionSetId,
                    }),
                    StatusCodes.BadRequest,
                    'ticket_selection_not_complete',
                );
            });

            test('should fail on modules configuration incomplete step', async function() {
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

                await failWithCode(
                    sdk.checkout.cart.commit.stripe(token, {
                        cart: actionSetId,
                    }),
                    StatusCodes.BadRequest,
                    'modules_configuration_not_complete',
                );
            });

            test('should fail commit un-owned cart', async function() {
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

                await failWithCode(
                    sdk.checkout.cart.commit.stripe(otherUser.token, {
                        cart: actionSetId,
                    }),
                    StatusCodes.Unauthorized,
                );
            });

            test('should fail on invalid ticket count selection', async function() {
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
                        ...[...Array(6)].map(() => ({
                            categoryId: event.categories[0],
                            price: {
                                currency: 'Fiat',
                                price: '100',
                            },
                        })),
                    ],
                });

                await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
                    return (
                        as.current_status === 'input:error' &&
                        JSON.parse(as.actions[as.current_action].error).error === 'cart_too_big'
                    );
                });
            });

            test('should fail on no more seats left', async function() {
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

                const event = await createEventWithUltraVIP(token, sdk);

                const cartActionSetRes = await sdk.actions.create(token, {
                    name: 'cart_create',
                    arguments: {},
                });

                const actionSetId = cartActionSetRes.data.actionset.id;

                await sdk.cart.ticketSelections(token, actionSetId, {
                    tickets: [
                        ...[...Array(3)].map(() => ({
                            categoryId: event.categories[1],
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
                    return (
                        as.current_status === 'input:error' &&
                        JSON.parse(as.actions[as.current_action].error).error === 'no_seats_left'
                    );
                });
            });
        });

        describe('resolveCartWithPaymentIntent (POST /checkout/cart/resolve/paymentintent)', function() {
            test('should fail on invalid action set type', async function() {
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

                const eventCreationActionSetRes = await sdk.actions.create(token, {
                    name: 'event_create',
                    arguments: {},
                });

                await failWithCode(
                    sdk.checkout.cart.resolve.paymentIntent(token, {
                        cart: eventCreationActionSetRes.data.actionset.id,
                        paymentIntentId: 'an id',
                    }),
                    StatusCodes.BadRequest,
                    'actionset_not_a_cart',
                );
            });

            test('should fail on incomplete action set', async function() {
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

                const validPaymentIntentId = await createPaymentIntent({
                    charges: {
                        data: [
                            {
                                payment_method_details: {
                                    type: 'card',
                                    card: {
                                        country: 'FR',
                                    },
                                },
                            },
                        ],
                    } as Stripe.ApiList<Stripe.Charge>,
                    payment_method_types: ['card'],
                    status: 'succeeded',
                    currency: 'eur',
                    amount_received: 330,
                });

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

                await failWithCode(
                    sdk.checkout.cart.resolve.paymentIntent(token, {
                        cart: actionSetId,
                        paymentIntentId: validPaymentIntentId,
                    }),
                    StatusCodes.BadRequest,
                    'cart_not_complete',
                );
            });

            test('should fail on duplicate payment intent usage', async function() {
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

                const validPaymentIntentId = await createPaymentIntent({
                    charges: {
                        data: [
                            {
                                payment_method_details: {
                                    type: 'card',
                                    card: {
                                        country: 'FR',
                                    },
                                },
                            },
                        ],
                    } as Stripe.ApiList<Stripe.Charge>,
                    payment_method_types: ['card'],
                    status: 'succeeded',
                    currency: 'eur',
                    amount_received: 330,
                });

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

                await sdk.checkout.cart.resolve.paymentIntent(token, {
                    cart: actionSetId,
                    paymentIntentId: validPaymentIntentId,
                });

                await failWithCode(
                    sdk.checkout.cart.resolve.paymentIntent(token, {
                        cart: actionSetId,
                        paymentIntentId: validPaymentIntentId,
                    }),
                    StatusCodes.Conflict,
                    'stripe_resource_already_used',
                );
            });

            test('should create, fill and commit cart, then resolve with captured payment intent', async function() {
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

                const event = await createExpensiveEvent(token, sdk);

                const amountReceived = 10370;

                const validPaymentIntentId = await createPaymentIntent({
                    charges: {
                        data: [
                            {
                                amount_refunded: 89630,
                                payment_method_details: {
                                    type: 'card',
                                    card: {
                                        country: 'FR',
                                    },
                                },
                            },
                        ],
                    } as Stripe.ApiList<Stripe.Charge>,
                    amount: 100000,
                    payment_method_types: ['card'],
                    status: 'succeeded',
                    currency: 'eur',
                    amount_received: amountReceived,
                });

                const cartActionSetRes = await sdk.actions.create(token, {
                    name: 'cart_create',
                    arguments: {},
                });

                const actionSetId = cartActionSetRes.data.actionset.id;

                await sdk.cart.ticketSelections(token, actionSetId, {
                    tickets: [
                        ...[...Array(1)].map(() => ({
                            categoryId: event.categories[0],
                            price: {
                                currency: 'Fiat',
                                price: '10000',
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

                const cartActionSetBeforeRes = await sdk.actions.search(token, {
                    id: {
                        $eq: actionSetId,
                    },
                });

                expect(cartActionSetBeforeRes.data.actionsets[0].consumed).toEqual(false);

                const res = await sdk.checkout.cart.resolve.paymentIntent(token, {
                    cart: actionSetId,
                    paymentIntentId: validPaymentIntentId,
                });

                const checkoutActionSetId = res.data.checkoutActionSetId;

                await waitForActionSet(sdk, token, checkoutActionSetId, (as: ActionSetEntity): boolean => {
                    return as.current_status === 'complete';
                });

                await waitForTickets(sdk, token, user.address, (tickets: TicketEntity[]): boolean => {
                    return tickets.length === 1;
                });

                const cartActionSetFinalRes = await sdk.actions.search(token, {
                    id: {
                        $eq: actionSetId,
                    },
                });

                expect(cartActionSetFinalRes.data.actionsets[0].consumed).toEqual(true);
            });

            test('should create, fill and commit cart with 3 tickets, then resolve with captured payment intent', async function() {
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

                const event = await createExpensiveEvent(token, sdk);

                const amountReceived = 31060;

                const validPaymentIntentId = await createPaymentIntent({
                    charges: {
                        data: [
                            {
                                amount_refunded: 68940,
                                payment_method_details: {
                                    type: 'card',
                                    card: {
                                        country: 'FR',
                                    },
                                },
                            },
                        ],
                    } as Stripe.ApiList<Stripe.Charge>,
                    amount: 100000,
                    payment_method_types: ['card'],
                    status: 'succeeded',
                    currency: 'eur',
                    amount_received: amountReceived,
                });

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
                                price: '10000',
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

                const cartActionSetBeforeRes = await sdk.actions.search(token, {
                    id: {
                        $eq: actionSetId,
                    },
                });

                expect(cartActionSetBeforeRes.data.actionsets[0].consumed).toEqual(false);

                const res = await sdk.checkout.cart.resolve.paymentIntent(token, {
                    cart: actionSetId,
                    paymentIntentId: validPaymentIntentId,
                });

                const checkoutActionSetId = res.data.checkoutActionSetId;

                await waitForActionSet(sdk, token, checkoutActionSetId, (as: ActionSetEntity): boolean => {
                    return as.current_status === 'complete';
                });

                await waitForTickets(sdk, token, user.address, (tickets: TicketEntity[]): boolean => {
                    return tickets.length === 3;
                });

                const cartActionSetFinalRes = await sdk.actions.search(token, {
                    id: {
                        $eq: actionSetId,
                    },
                });

                expect(cartActionSetFinalRes.data.actionsets[0].consumed).toEqual(true);
            });

            test('should create, fill and commit cart, then resolve with uncaptured payment intent', async function() {
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

                const event = await createExpensiveEvent(token, sdk);

                const amountReceived = 10370;

                const validPaymentIntent: Partial<Stripe.PaymentIntent> = {
                    charges: {
                        data: [
                            {
                                payment_method_details: {
                                    type: 'card',
                                    card: {
                                        country: 'FR',
                                    },
                                },
                            },
                        ],
                    } as Stripe.ApiList<Stripe.Charge>,
                    payment_method_types: ['card'],
                    status: 'requires_capture',
                    currency: 'eur',
                    amount_capturable: 100000,
                };

                const validPaymentIntentId = createPaymentIntent(validPaymentIntent);

                const mocks = getMocks();

                when(
                    mocks[1].capture(
                        validPaymentIntentId,
                        deepEqual({
                            amount_to_capture: amountReceived,
                        }),
                    ),
                ).thenCall(() => {
                    setPaymentIntent(validPaymentIntentId, {
                        ...validPaymentIntent,
                        status: 'succeeded',
                        amount_received: amountReceived,
                        amount: 100000,
                        amount_capturable: 0,
                        charges: {
                            ...validPaymentIntent.charges,
                            data: [
                                {
                                    ...validPaymentIntent.charges.data[0],
                                    amount_refunded: 89630,
                                },
                            ],
                        },
                    });
                });

                const cartActionSetRes = await sdk.actions.create(token, {
                    name: 'cart_create',
                    arguments: {},
                });

                const actionSetId = cartActionSetRes.data.actionset.id;

                await sdk.cart.ticketSelections(token, actionSetId, {
                    tickets: [
                        ...[...Array(1)].map(() => ({
                            categoryId: event.categories[0],
                            price: {
                                currency: 'Fiat',
                                price: '10000',
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

                const res = await sdk.checkout.cart.resolve.paymentIntent(token, {
                    cart: actionSetId,
                    paymentIntentId: validPaymentIntentId,
                });

                const checkoutActionSetId = res.data.checkoutActionSetId;

                await waitForActionSet(sdk, token, checkoutActionSetId, (as: ActionSetEntity): boolean => {
                    return as.current_status === 'complete';
                });

                await waitForTickets(sdk, token, user.address, (tickets: TicketEntity[]): boolean => {
                    return tickets.length === 1;
                });
            });

            test('should fail when create, fill and commit cart, then resolve with captured payment intent and total above required', async function() {
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

                const validPaymentIntent: Partial<Stripe.PaymentIntent> = {
                    charges: {
                        data: [
                            {
                                payment_method_details: {
                                    type: 'card',
                                    card: {
                                        country: 'FR',
                                    },
                                },
                            },
                        ],
                    } as Stripe.ApiList<Stripe.Charge>,
                    payment_method_types: ['card'],
                    status: 'succeeded',
                    currency: 'eur',
                    amount_received: 331,
                };

                const validPaymentIntentId = createPaymentIntent(validPaymentIntent);

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

                const res = await sdk.checkout.cart.resolve.paymentIntent(token, {
                    cart: actionSetId,
                    paymentIntentId: validPaymentIntentId,
                });

                const checkoutActionSetId = res.data.checkoutActionSetId;

                await waitForActionSet(sdk, token, checkoutActionSetId, (as: ActionSetEntity): boolean => {
                    return (
                        as.current_status === 'event:error' &&
                        as.actions[as.current_action].status === 'error' &&
                        JSON.parse(as.actions[as.current_action].error).error === 'dosojin_circuit_failed'
                    );
                });

                await gemFail(sdk, token, res.data.gemOrderId, {
                    dosojin: 'StripeTokenMinter',
                    entity_name: 'CardPaymentIntentReceptacle',
                    entity_type: 'receptacle',
                    layer: 0,
                    message: 'Invalid Succeeded Payment Intent. Got Refunded.',
                });
            });

            test('should fail when create, fill and commit cart, then resolve with captured payment intent and total under required', async function() {
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

                const validPaymentIntent: Partial<Stripe.PaymentIntent> = {
                    charges: {
                        data: [
                            {
                                payment_method_details: {
                                    type: 'card',
                                    card: {
                                        country: 'FR',
                                    },
                                },
                            },
                        ],
                    } as Stripe.ApiList<Stripe.Charge>,
                    payment_method_types: ['card'],
                    status: 'succeeded',
                    currency: 'eur',
                    amount_received: 329,
                };

                const validPaymentIntentId = createPaymentIntent(validPaymentIntent);

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

                const res = await sdk.checkout.cart.resolve.paymentIntent(token, {
                    cart: actionSetId,
                    paymentIntentId: validPaymentIntentId,
                });

                const checkoutActionSetId = res.data.checkoutActionSetId;

                await waitForActionSet(sdk, token, checkoutActionSetId, (as: ActionSetEntity): boolean => {
                    return (
                        as.current_status === 'event:error' &&
                        as.actions[as.current_action].status === 'error' &&
                        JSON.parse(as.actions[as.current_action].error).error === 'dosojin_circuit_failed'
                    );
                });

                await gemFail(sdk, token, res.data.gemOrderId, {
                    dosojin: 'StripeTokenMinter',
                    entity_name: 'CardPaymentIntentReceptacle',
                    entity_type: 'receptacle',
                    layer: 0,
                    message: 'Invalid Succeeded Payment Intent. Got Refunded.',
                });
            });

            test('should fail create, fill and commit cart, then resolve with uncaptured payment intent and total under required', async function() {
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

                const validPaymentIntent: Partial<Stripe.PaymentIntent> = {
                    charges: {
                        data: [
                            {
                                payment_method_details: {
                                    type: 'card',
                                    card: {
                                        country: 'FR',
                                    },
                                },
                            },
                        ],
                    } as Stripe.ApiList<Stripe.Charge>,
                    payment_method_types: ['card'],
                    status: 'requires_capture',
                    currency: 'eur',
                    amount_capturable: 329,
                };

                const validPaymentIntentId = createPaymentIntent(validPaymentIntent);

                const mocks = getMocks();

                when(mocks[1].cancel(validPaymentIntentId)).thenCall(() => {
                    setPaymentIntent(validPaymentIntentId, {
                        ...validPaymentIntent,
                        status: 'canceled',
                    });
                });

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

                const res = await sdk.checkout.cart.resolve.paymentIntent(token, {
                    cart: actionSetId,
                    paymentIntentId: validPaymentIntentId,
                });

                const checkoutActionSetId = res.data.checkoutActionSetId;

                await waitForActionSet(sdk, token, checkoutActionSetId, (as: ActionSetEntity): boolean => {
                    return (
                        as.current_status === 'event:error' &&
                        as.actions[as.current_action].status === 'error' &&
                        JSON.parse(as.actions[as.current_action].error).error === 'dosojin_circuit_failed'
                    );
                });

                await gemFail(sdk, token, res.data.gemOrderId, {
                    dosojin: 'StripeTokenMinter',
                    entity_name: 'CardPaymentIntentReceptacle',
                    entity_type: 'receptacle',
                    layer: 0,
                    message: "Payment Intent's capturable amount is too low.",
                });
            });
        });
    };
}
