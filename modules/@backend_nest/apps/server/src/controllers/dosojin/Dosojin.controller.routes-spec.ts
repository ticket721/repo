import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import {
    createEvent,
    createEventWithUltraVIP,
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

                const dosojinSearch = await sdk.dosojin.count(token, {});

                expect(cartActionSetFinalRes.data.actionsets[0].consumed).toEqual(true);
                expect(dosojinSearch.data.gemOrders.count).toEqual(1);
            });
        });
    };
}
