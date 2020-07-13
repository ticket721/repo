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
    getPIFromCart,
    getSDKAndUser,
    getUser,
    setPaymentIntent,
    validateCardPayment,
    waitForActionSet,
    waitForTickets,
} from '../../../test/utils';
import { Stripe } from 'stripe';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { instance, when } from 'ts-mockito';

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
                                price: '200',
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
                                price: '200',
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
                                price: '200',
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
                                price: '200',
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
                                price: '200',
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
                                price: '200',
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
                                price: '200',
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
                                price: '200',
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
                                price: '200',
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
                                price: '200',
                            },
                        })),
                    ],
                });

                await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
                    return (
                        as.current_status === 'input:error' &&
                        JSON.parse(as.actions[as.current_action].error).error === 'cannot_purchase_tickets'
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
                                price: '200',
                            },
                        })),
                    ],
                });

                await failWithCode(
                    sdk.checkout.cart.resolve.paymentIntent(token, {
                        cart: actionSetId,
                    }),
                    StatusCodes.BadRequest,
                    'cart_not_complete',
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

                const category = await sdk.categories.search(token, {
                    id: {
                        $eq: event.categories[0],
                    },
                });

                const reservedCount = category.data.categories[0].reserved;

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

                await validateCardPayment(await getPIFromCart(sdk, token, actionSetId));

                const res = await sdk.checkout.cart.resolve.paymentIntent(token, {
                    cart: actionSetId,
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

                const editedCategory = await sdk.categories.search(token, {
                    id: {
                        $eq: event.categories[0],
                    },
                });

                expect(editedCategory.data.categories[0].reserved).toEqual(reservedCount + 1);
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

                await validateCardPayment(await getPIFromCart(sdk, token, actionSetId));

                const res = await sdk.checkout.cart.resolve.paymentIntent(token, {
                    cart: actionSetId,
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
        });
    };
}
