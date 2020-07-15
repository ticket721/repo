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
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { Stripe } from 'stripe';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('search (POST /dosojin/search)', function() {
            test('should search dosojin', async function() {
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

                await validateCardPayment(await getPIFromCart(sdk, token, actionSetId));

                expect(cartActionSetBeforeRes.data.actionsets[0].consumed).toEqual(false);

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

                const dosojinSearch = await sdk.dosojin.search(token, {});

                expect(cartActionSetFinalRes.data.actionsets[0].consumed).toEqual(true);
                expect(dosojinSearch.data.gemOrders.length).toEqual(1);
            });
        });
        describe('count (POST /dosojin/count)', function() {
            test('should count dosojin', async function() {
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

                await validateCardPayment(await getPIFromCart(sdk, token, actionSetId));

                expect(cartActionSetBeforeRes.data.actionsets[0].consumed).toEqual(false);

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

                const dosojinSearch = await sdk.dosojin.count(token, {});

                expect(cartActionSetFinalRes.data.actionsets[0].consumed).toEqual(true);
                expect(dosojinSearch.data.gemOrders.count).toEqual(1);
            });
        });
    };
}
