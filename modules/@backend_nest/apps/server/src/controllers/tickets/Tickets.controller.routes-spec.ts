export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        // describe('search (POST /ticket/search)', function() {
        //     test('should search for created tickets', async function() {
        //         const {
        //             sdk,
        //             token,
        //             user,
        //             password,
        //         }: {
        //             sdk: T721SDK;
        //             token: string;
        //             user: PasswordlessUserDto;
        //             password: string;
        //         } = await getSDKAndUser(getCtx);
        //
        //         const event = await createExpensiveEvent(token, sdk);
        //
        //         const cartActionSetRes = await sdk.actions.create(token, {
        //             name: 'cart_create',
        //             arguments: {},
        //         });
        //
        //         const actionSetId = cartActionSetRes.data.actionset.id;
        //
        //         await sdk.cart.ticketSelections(token, actionSetId, {
        //             tickets: [
        //                 ...[...Array(1)].map(() => ({
        //                     categoryId: event.categories[0],
        //                     price: {
        //                         currency: 'Fiat',
        //                         price: '10000',
        //                     },
        //                 })),
        //             ],
        //         });
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_action === 1;
        //         });
        //
        //         await sdk.cart.modulesConfiguration(token, actionSetId, {});
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_action === 2;
        //         });
        //
        //         await sdk.checkout.cart.commit.stripe(token, {
        //             cart: actionSetId,
        //         });
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_status === 'complete';
        //         });
        //
        //         await validateCardPayment(await getPIFromCart(sdk, token, actionSetId));
        //
        //         const res = await sdk.checkout.cart.resolve.paymentIntent(token, {
        //             cart: actionSetId,
        //         });
        //
        //         const checkoutActionSetId = res.data.checkoutActionSetId;
        //
        //         await waitForActionSet(sdk, token, checkoutActionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_status === 'complete';
        //         });
        //
        //         await waitForTickets(sdk, token, user.address, (tickets: TicketEntity[]): boolean => {
        //             return (
        //                 tickets.length === 1 &&
        //                 tickets.filter((t: TicketEntity): boolean => t.status === 'ready').length === tickets.length
        //             );
        //         });
        //
        //         const tickets = await sdk.tickets.search(token, {
        //             owner: {
        //                 $eq: user.address,
        //             },
        //         });
        //
        //         expect(tickets.data.tickets.length).toEqual(1);
        //     });
        //
        //     test('should search for created tickets unauthenticated', async function() {
        //         const {
        //             sdk,
        //             token,
        //             user,
        //             password,
        //         }: {
        //             sdk: T721SDK;
        //             token: string;
        //             user: PasswordlessUserDto;
        //             password: string;
        //         } = await getSDKAndUser(getCtx);
        //
        //         const event = await createExpensiveEvent(token, sdk);
        //
        //         const cartActionSetRes = await sdk.actions.create(token, {
        //             name: 'cart_create',
        //             arguments: {},
        //         });
        //
        //         const actionSetId = cartActionSetRes.data.actionset.id;
        //
        //         await sdk.cart.ticketSelections(token, actionSetId, {
        //             tickets: [
        //                 ...[...Array(1)].map(() => ({
        //                     categoryId: event.categories[0],
        //                     price: {
        //                         currency: 'Fiat',
        //                         price: '10000',
        //                     },
        //                 })),
        //             ],
        //         });
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_action === 1;
        //         });
        //
        //         await sdk.cart.modulesConfiguration(token, actionSetId, {});
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_action === 2;
        //         });
        //
        //         await sdk.checkout.cart.commit.stripe(token, {
        //             cart: actionSetId,
        //         });
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_status === 'complete';
        //         });
        //
        //         await validateCardPayment(await getPIFromCart(sdk, token, actionSetId));
        //
        //         const res = await sdk.checkout.cart.resolve.paymentIntent(token, {
        //             cart: actionSetId,
        //         });
        //
        //         const checkoutActionSetId = res.data.checkoutActionSetId;
        //
        //         await waitForActionSet(sdk, token, checkoutActionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_status === 'complete';
        //         });
        //
        //         await waitForTickets(sdk, token, user.address, (tickets: TicketEntity[]): boolean => {
        //             return (
        //                 tickets.length === 1 &&
        //                 tickets.filter((t: TicketEntity): boolean => t.status === 'ready').length === tickets.length
        //             );
        //         });
        //
        //         await failWithCode(
        //             sdk.tickets.search(null, {
        //                 owner: {
        //                     $eq: user.address,
        //                 },
        //             }),
        //             StatusCodes.Unauthorized,
        //         );
        //     });
        // });
        //
        // describe('count (POST /ticket/count)', function() {
        //     test('should count for created tickets', async function() {
        //         const {
        //             sdk,
        //             token,
        //             user,
        //             password,
        //         }: {
        //             sdk: T721SDK;
        //             token: string;
        //             user: PasswordlessUserDto;
        //             password: string;
        //         } = await getSDKAndUser(getCtx);
        //
        //         const event = await createExpensiveEvent(token, sdk);
        //
        //         const cartActionSetRes = await sdk.actions.create(token, {
        //             name: 'cart_create',
        //             arguments: {},
        //         });
        //
        //         const actionSetId = cartActionSetRes.data.actionset.id;
        //
        //         await sdk.cart.ticketSelections(token, actionSetId, {
        //             tickets: [
        //                 ...[...Array(1)].map(() => ({
        //                     categoryId: event.categories[0],
        //                     price: {
        //                         currency: 'Fiat',
        //                         price: '10000',
        //                     },
        //                 })),
        //             ],
        //         });
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_action === 1;
        //         });
        //
        //         await sdk.cart.modulesConfiguration(token, actionSetId, {});
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_action === 2;
        //         });
        //
        //         await sdk.checkout.cart.commit.stripe(token, {
        //             cart: actionSetId,
        //         });
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_status === 'complete';
        //         });
        //
        //         await validateCardPayment(await getPIFromCart(sdk, token, actionSetId));
        //
        //         const res = await sdk.checkout.cart.resolve.paymentIntent(token, {
        //             cart: actionSetId,
        //         });
        //
        //         const checkoutActionSetId = res.data.checkoutActionSetId;
        //
        //         await waitForActionSet(sdk, token, checkoutActionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_status === 'complete';
        //         });
        //
        //         await waitForTickets(sdk, token, user.address, (tickets: TicketEntity[]): boolean => {
        //             return (
        //                 tickets.length === 1 &&
        //                 tickets.filter((t: TicketEntity): boolean => t.status === 'ready').length === tickets.length
        //             );
        //         });
        //
        //         const tickets = await sdk.tickets.count(token, {
        //             owner: {
        //                 $eq: user.address,
        //             },
        //         });
        //
        //         expect(tickets.data.tickets.count).toEqual(1);
        //     });
        //
        //     test('should count for created tickets unauthenticated', async function() {
        //         const {
        //             sdk,
        //             token,
        //             user,
        //             password,
        //         }: {
        //             sdk: T721SDK;
        //             token: string;
        //             user: PasswordlessUserDto;
        //             password: string;
        //         } = await getSDKAndUser(getCtx);
        //
        //         const event = await createExpensiveEvent(token, sdk);
        //
        //         const cartActionSetRes = await sdk.actions.create(token, {
        //             name: 'cart_create',
        //             arguments: {},
        //         });
        //
        //         const actionSetId = cartActionSetRes.data.actionset.id;
        //
        //         await sdk.cart.ticketSelections(token, actionSetId, {
        //             tickets: [
        //                 ...[...Array(1)].map(() => ({
        //                     categoryId: event.categories[0],
        //                     price: {
        //                         currency: 'Fiat',
        //                         price: '10000',
        //                     },
        //                 })),
        //             ],
        //         });
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_action === 1;
        //         });
        //
        //         await sdk.cart.modulesConfiguration(token, actionSetId, {});
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_action === 2;
        //         });
        //
        //         await sdk.checkout.cart.commit.stripe(token, {
        //             cart: actionSetId,
        //         });
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_status === 'complete';
        //         });
        //
        //         await validateCardPayment(await getPIFromCart(sdk, token, actionSetId));
        //
        //         const res = await sdk.checkout.cart.resolve.paymentIntent(token, {
        //             cart: actionSetId,
        //         });
        //
        //         const checkoutActionSetId = res.data.checkoutActionSetId;
        //
        //         await waitForActionSet(sdk, token, checkoutActionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_status === 'complete';
        //         });
        //
        //         await waitForTickets(sdk, token, user.address, (tickets: TicketEntity[]): boolean => {
        //             return (
        //                 tickets.length === 1 &&
        //                 tickets.filter((t: TicketEntity): boolean => t.status === 'ready').length === tickets.length
        //             );
        //         });
        //
        //         await failWithCode(
        //             sdk.tickets.count(null, {
        //                 owner: {
        //                     $eq: user.address,
        //                 },
        //             }),
        //             StatusCodes.Unauthorized,
        //         );
        //     });
        // });
        //
        // describe('validate-ticket (POST /ticket/:eventId/search)', function() {
        //     test('should validate ticket ownership', async function() {
        //         const {
        //             sdk,
        //             token,
        //             user,
        //             password,
        //         }: {
        //             sdk: T721SDK;
        //             token: string;
        //             user: PasswordlessUserDto;
        //             password: string;
        //         } = await getSDKAndUser(getCtx);
        //
        //         const event = await createExpensiveEvent(token, sdk);
        //
        //         const cartActionSetRes = await sdk.actions.create(token, {
        //             name: 'cart_create',
        //             arguments: {},
        //         });
        //
        //         const actionSetId = cartActionSetRes.data.actionset.id;
        //
        //         await sdk.cart.ticketSelections(token, actionSetId, {
        //             tickets: [
        //                 ...[...Array(1)].map(() => ({
        //                     categoryId: event.categories[0],
        //                     price: {
        //                         currency: 'Fiat',
        //                         price: '10000',
        //                     },
        //                 })),
        //             ],
        //         });
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_action === 1;
        //         });
        //
        //         await sdk.cart.modulesConfiguration(token, actionSetId, {});
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_action === 2;
        //         });
        //
        //         await sdk.checkout.cart.commit.stripe(token, {
        //             cart: actionSetId,
        //         });
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_status === 'complete';
        //         });
        //
        //         await validateCardPayment(await getPIFromCart(sdk, token, actionSetId));
        //
        //         const res = await sdk.checkout.cart.resolve.paymentIntent(token, {
        //             cart: actionSetId,
        //         });
        //
        //         const checkoutActionSetId = res.data.checkoutActionSetId;
        //
        //         await waitForActionSet(sdk, token, checkoutActionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_status === 'complete';
        //         });
        //
        //         await waitForTickets(sdk, token, user.address, (tickets: TicketEntity[]): boolean => {
        //             return (
        //                 tickets.length === 1 &&
        //                 tickets.filter((t: TicketEntity): boolean => t.status === 'ready').length === tickets.length
        //             );
        //         });
        //
        //         const tickets = await sdk.tickets.search(token, {
        //             owner: {
        //                 $eq: user.address,
        //             },
        //         });
        //
        //         expect(tickets.data.tickets.length).toEqual(1);
        //
        //         const deviceAddress = user.address;
        //
        //         await sdk.users.setDeviceAddress(token, {
        //             deviceAddress,
        //         });
        //
        //         const ticketId = tickets.data.tickets[0].id;
        //
        //         const resp = await sdk.tickets.validate(token, event.id, {
        //             address: deviceAddress,
        //             ticketId,
        //         });
        //
        //         expect(resp.data.info).not.toEqual(null);
        //     });
        //
        //     test('should fail for invalid address', async function() {
        //         const {
        //             sdk,
        //             token,
        //             user,
        //             password,
        //         }: {
        //             sdk: T721SDK;
        //             token: string;
        //             user: PasswordlessUserDto;
        //             password: string;
        //         } = await getSDKAndUser(getCtx);
        //
        //         const otherUser = await getUser(sdk);
        //
        //         const event = await createExpensiveEvent(token, sdk);
        //
        //         const cartActionSetRes = await sdk.actions.create(token, {
        //             name: 'cart_create',
        //             arguments: {},
        //         });
        //
        //         const actionSetId = cartActionSetRes.data.actionset.id;
        //
        //         await sdk.cart.ticketSelections(token, actionSetId, {
        //             tickets: [
        //                 ...[...Array(1)].map(() => ({
        //                     categoryId: event.categories[0],
        //                     price: {
        //                         currency: 'Fiat',
        //                         price: '10000',
        //                     },
        //                 })),
        //             ],
        //         });
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_action === 1;
        //         });
        //
        //         await sdk.cart.modulesConfiguration(token, actionSetId, {});
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_action === 2;
        //         });
        //
        //         await sdk.checkout.cart.commit.stripe(token, {
        //             cart: actionSetId,
        //         });
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_status === 'complete';
        //         });
        //
        //         await validateCardPayment(await getPIFromCart(sdk, token, actionSetId));
        //
        //         const res = await sdk.checkout.cart.resolve.paymentIntent(token, {
        //             cart: actionSetId,
        //         });
        //
        //         const checkoutActionSetId = res.data.checkoutActionSetId;
        //
        //         await waitForActionSet(sdk, token, checkoutActionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_status === 'complete';
        //         });
        //
        //         await waitForTickets(sdk, token, user.address, (tickets: TicketEntity[]): boolean => {
        //             return (
        //                 tickets.length === 1 &&
        //                 tickets.filter((t: TicketEntity): boolean => t.status === 'ready').length === tickets.length
        //             );
        //         });
        //
        //         const tickets = await sdk.tickets.search(token, {
        //             owner: {
        //                 $eq: user.address,
        //             },
        //         });
        //
        //         expect(tickets.data.tickets.length).toEqual(1);
        //
        //         const deviceAddress = user.address;
        //
        //         await sdk.users.setDeviceAddress(token, {
        //             deviceAddress,
        //         });
        //
        //         const ticketId = tickets.data.tickets[0].id;
        //
        //         const resp = await sdk.tickets.validate(token, event.id, {
        //             address: otherUser.user.address,
        //             ticketId,
        //         });
        //
        //         expect(resp.data.info).toEqual(null);
        //     });
        //
        //     test('should fail for invalid event id', async function() {
        //         const {
        //             sdk,
        //             token,
        //             user,
        //             password,
        //         }: {
        //             sdk: T721SDK;
        //             token: string;
        //             user: PasswordlessUserDto;
        //             password: string;
        //         } = await getSDKAndUser(getCtx);
        //
        //         const otherUser = await getUser(sdk);
        //
        //         const event = await createExpensiveEvent(token, sdk);
        //
        //         const otherEvent = await createExpensiveEvent(token, sdk);
        //
        //         const cartActionSetRes = await sdk.actions.create(token, {
        //             name: 'cart_create',
        //             arguments: {},
        //         });
        //
        //         const actionSetId = cartActionSetRes.data.actionset.id;
        //
        //         await sdk.cart.ticketSelections(token, actionSetId, {
        //             tickets: [
        //                 ...[...Array(1)].map(() => ({
        //                     categoryId: event.categories[0],
        //                     price: {
        //                         currency: 'Fiat',
        //                         price: '10000',
        //                     },
        //                 })),
        //             ],
        //         });
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_action === 1;
        //         });
        //
        //         await sdk.cart.modulesConfiguration(token, actionSetId, {});
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_action === 2;
        //         });
        //
        //         await sdk.checkout.cart.commit.stripe(token, {
        //             cart: actionSetId,
        //         });
        //
        //         await waitForActionSet(sdk, token, actionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_status === 'complete';
        //         });
        //
        //         await validateCardPayment(await getPIFromCart(sdk, token, actionSetId));
        //
        //         const res = await sdk.checkout.cart.resolve.paymentIntent(token, {
        //             cart: actionSetId,
        //         });
        //
        //         const checkoutActionSetId = res.data.checkoutActionSetId;
        //
        //         await waitForActionSet(sdk, token, checkoutActionSetId, (as: ActionSetEntity): boolean => {
        //             return as.current_status === 'complete';
        //         });
        //
        //         await waitForTickets(sdk, token, user.address, (tickets: TicketEntity[]): boolean => {
        //             return (
        //                 tickets.length === 1 &&
        //                 tickets.filter((t: TicketEntity): boolean => t.status === 'ready').length === tickets.length
        //             );
        //         });
        //
        //         const tickets = await sdk.tickets.search(token, {
        //             owner: {
        //                 $eq: user.address,
        //             },
        //         });
        //
        //         expect(tickets.data.tickets.length).toEqual(1);
        //
        //         const deviceAddress = user.address;
        //
        //         await sdk.users.setDeviceAddress(token, {
        //             deviceAddress,
        //         });
        //
        //         const ticketId = tickets.data.tickets[0].id;
        //
        //         await failWithCode(
        //             sdk.tickets.validate(token, otherEvent.id, {
        //                 address: otherUser.user.address,
        //                 ticketId,
        //             }),
        //             StatusCodes.Forbidden,
        //             'unauthorized_scan',
        //         );
        //     });
        // });
    };
}
