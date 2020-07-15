import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import {
    createEvent,
    createEventActionSet,
    createExpensiveEvent,
    createPaymentIntent,
    editEventActionSet,
    failWithCode,
    getPIFromCart,
    getSDKAndUser,
    getUser,
    validateCardPayment,
    waitForActionSet,
    waitForTickets,
}                                  from '../../../test/utils';
import { ActionSetEntity }         from '@lib/common/actionsets/entities/ActionSet.entity';
import { StatusCodes }             from '@lib/common/utils/codes.value';
import { Stripe }                  from 'stripe';
import { TicketEntity }            from '@lib/common/tickets/entities/Ticket.entity';
import { SortablePagedSearch }     from '@lib/common/utils/SortablePagedSearch.type';
import { uuidEq }                  from '@common/global';
import { AxiosResponse }           from 'axios';
import { ImagesUploadResponseDto } from '@app/server/controllers/images/dto/ImagesUploadResponse.dto';
import fs                          from 'fs';
import FormData                    from 'form-data';
import { CategoryEntity }          from '@lib/common/categories/entities/Category.entity';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        // describe('search (POST /events/search)', function() {
        //     test('should properly search for events', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const eventsQuery = await sdk.events.search(token, {
        //             id: {
        //                 $eq: event.id,
        //             },
        //         });
        //
        //         expect(eventsQuery.data.events.length).toEqual(1);
        //     });
        //
        //     test('should properly search for events from unauthenticated', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const eventsQuery = await sdk.events.search(null, {
        //             id: {
        //                 $eq: event.id,
        //             },
        //         });
        //
        //         expect(eventsQuery.data.events.length).toEqual(1);
        //     });
        // });
        //
        // describe('count (POST /events/count)', function() {
        //     test('should properly count events', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const eventsQuery = await sdk.events.count(token, {
        //             id: {
        //                 $eq: event.id,
        //             },
        //         });
        //
        //         expect(eventsQuery.data.events.count).toEqual(1);
        //     });
        //
        //     test('should properly count events from unauthenticated', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const eventsQuery = await sdk.events.count(null, {
        //             id: {
        //                 $eq: event.id,
        //             },
        //         });
        //
        //         expect(eventsQuery.data.events.count).toEqual(1);
        //     });
        // });
        //
        // describe('create (POST /events)', function() {
        //     test('should convert action set to event', async function() {
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
        //         const eventActionSetId = await createEventActionSet(token, sdk);
        //
        //         const actionSetEntityBeforeRes = await sdk.actions.search(token, {
        //             id: {
        //                 $eq: eventActionSetId,
        //             },
        //         });
        //
        //         expect(actionSetEntityBeforeRes.data.actionsets[0].consumed).toEqual(false);
        //
        //         await sdk.events.create.create(token, {
        //             completedActionSet: eventActionSetId,
        //         });
        //
        //         const actionSetEntityAfterRes = await sdk.actions.search(token, {
        //             id: {
        //                 $eq: eventActionSetId,
        //             },
        //         });
        //
        //         expect(actionSetEntityAfterRes.data.actionsets[0].consumed).toEqual(true);
        //     });
        //
        //     test('should properly edit actionset then create event', async function() {
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
        //         const actionSetId = await createEventActionSet(token, sdk);
        //         await editEventActionSet(token, sdk, actionSetId);
        //
        //         const eventEntityRes = await sdk.events.create.create(token, {
        //             completedActionSet: actionSetId,
        //         });
        //     });
        //
        //     test('should fail by unauthenticated call', async function() {
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
        //         await failWithCode(
        //             sdk.events.create.create(null, {
        //                 completedActionSet: null,
        //             }),
        //             StatusCodes.Unauthorized,
        //         );
        //     });
        //
        //     test('should fail by providing incomplete actionset', async function() {
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
        //         const initialArgument = {};
        //
        //         const actionSetName = 'event_create';
        //
        //         const eventCreationActionSetRes = await sdk.actions.create(token, {
        //             name: actionSetName,
        //             arguments: initialArgument,
        //         });
        //
        //         const actionSetId = eventCreationActionSetRes.data.actionset.id;
        //
        //         await failWithCode(
        //             sdk.events.create.create(token, {
        //                 completedActionSet: actionSetId,
        //             }),
        //             StatusCodes.BadRequest,
        //         );
        //     });
        // });
        //
        // describe('start (POST /start)', function() {
        //     test('should start owned event and all dates', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const startedEvent = await sdk.events.start(token, {
        //             event: event.id,
        //         });
        //
        //         const dates = startedEvent.data.event.dates;
        //
        //         const dateEntities = await sdk.dates.search(token, {
        //             id: {
        //                 $in: dates,
        //             },
        //         } as SortablePagedSearch);
        //
        //         for (const liveDate of dateEntities.data.dates) {
        //             expect(liveDate.status).toEqual('live');
        //         }
        //     });
        //
        //     test('should start owned event and first date only', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const startedEvent = await sdk.events.start(token, {
        //             event: event.id,
        //             dates: [event.dates[0]],
        //         });
        //
        //         const dates = startedEvent.data.event.dates;
        //
        //         const dateEntities = await sdk.dates.search(token, {
        //             id: {
        //                 $in: dates,
        //             },
        //         } as SortablePagedSearch);
        //
        //         for (const dateEntity of dateEntities.data.dates) {
        //             if (uuidEq(dateEntity.id, event.dates[0])) {
        //                 expect(dateEntity.status).toEqual('live');
        //             } else {
        //                 expect(dateEntity.status).toEqual('preview');
        //             }
        //         }
        //     });
        //
        //     test('should fail on unauthenticated', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         await failWithCode(
        //             sdk.events.start(null, {
        //                 event: event.id,
        //             }),
        //             StatusCodes.Unauthorized,
        //         );
        //     });
        //
        //     test('should fail on unauthorized', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const otherUser = await getUser(sdk);
        //
        //         await failWithCode(
        //             sdk.events.start(otherUser.token, {
        //                 event: event.id,
        //             }),
        //             StatusCodes.Unauthorized,
        //         );
        //     });
        //
        //     test('should fail on invalid event date for event', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         await failWithCode(
        //             sdk.events.start(token, {
        //                 event: event.id,
        //                 dates: [event.id],
        //             }),
        //             StatusCodes.BadRequest,
        //         );
        //     });
        // });
        //
        // describe('update (PUT /events/:eventId)', function() {
        //     test('should update event metadata', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const editedEvent = await sdk.events.update(token, event.id, {
        //             name: 'myEditedEventName',
        //         });
        //
        //         expect(editedEvent.data.event.name).toEqual('myEditedEventName');
        //     });
        //
        //     test('should fail updating from unauthenticated', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         await failWithCode(
        //             sdk.events.update(null, event.id, {
        //                 name: 'myEditedEventName',
        //             }),
        //             StatusCodes.Unauthorized,
        //         );
        //     });
        //
        //     test('should fail updating from unauthorized', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const otherUser = await getUser(sdk);
        //
        //         await failWithCode(
        //             sdk.events.update(otherUser.token, event.id, {
        //                 name: 'myEditedEventName',
        //             }),
        //             StatusCodes.Unauthorized,
        //         );
        //     });
        // });
        //
        // describe('deleteCategories (DELETE /events/:eventId/categories)', function() {
        //     test('should unbind global category', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const categoryId = event.categories[0];
        //
        //         const updatedEvent = await sdk.events.deleteCategories(token, event.id, {
        //             categories: [categoryId],
        //         });
        //
        //         expect(updatedEvent.data.event.categories).toEqual([]);
        //     });
        //
        //     test('should fail unbinding from unauthenticated', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const categoryId = event.categories[0];
        //
        //         await failWithCode(
        //             sdk.events.deleteCategories(null, event.id, {
        //                 categories: [categoryId],
        //             }),
        //             StatusCodes.Unauthorized,
        //         );
        //     });
        //
        //     test('should fail unbinding from unauthorized', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const otherUser = await getUser(sdk);
        //
        //         const categoryId = event.categories[0];
        //
        //         await failWithCode(
        //             sdk.events.deleteCategories(otherUser.token, event.id, {
        //                 categories: [categoryId],
        //             }),
        //             StatusCodes.Unauthorized,
        //         );
        //     });
        //
        //     test('should fail unbinding category not found', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const categoryId = event.id;
        //
        //         await failWithCode(
        //             sdk.events.deleteCategories(token, event.id, {
        //                 categories: [categoryId],
        //             }),
        //             StatusCodes.NotFound,
        //         );
        //     });
        // });
        //
        // describe('addCategories (POST /events/:eventId/categories)', function() {
        //     test('should add new global category', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const newCategory = await sdk.categories.create(token, {
        //             group_id: event.group_id,
        //             display_name: 'VIP',
        //             sale_begin: new Date(Date.now() + 1000000),
        //             sale_end: new Date(Date.now() + 2000000),
        //             resale_begin: new Date(Date.now() + 1000000),
        //             resale_end: new Date(Date.now() + 2000000),
        //             prices: [
        //                 {
        //                     currency: 'Fiat',
        //                     price: '200',
        //                 },
        //             ],
        //             seats: 100,
        //         });
        //
        //         const editedEvent = await sdk.events.addCategories(token, event.id, {
        //             categories: [newCategory.data.category.id],
        //         });
        //
        //         expect(editedEvent.data.event.categories).toEqual([event.categories[0], newCategory.data.category.id]);
        //     });
        //
        //     test('should fail on unauthenticated call', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const newCategory = await sdk.categories.create(token, {
        //             group_id: event.group_id,
        //             display_name: 'VIP',
        //             sale_begin: new Date(Date.now() + 1000000),
        //             sale_end: new Date(Date.now() + 2000000),
        //             resale_begin: new Date(Date.now() + 1000000),
        //             resale_end: new Date(Date.now() + 2000000),
        //             prices: [
        //                 {
        //                     currency: 'Fiat',
        //                     price: '200',
        //                 },
        //             ],
        //             seats: 100,
        //         });
        //
        //         await failWithCode(
        //             sdk.events.addCategories(null, event.id, {
        //                 categories: [newCategory.data.category.id],
        //             }),
        //             StatusCodes.Unauthorized,
        //         );
        //     });
        //
        //     test('should fail on unauthorized call', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const otherUser = await getUser(sdk);
        //
        //         const newCategory = await sdk.categories.create(token, {
        //             group_id: event.group_id,
        //             display_name: 'VIP',
        //             sale_begin: new Date(Date.now() + 1000000),
        //             sale_end: new Date(Date.now() + 2000000),
        //             resale_begin: new Date(Date.now() + 1000000),
        //             resale_end: new Date(Date.now() + 2000000),
        //             prices: [
        //                 {
        //                     currency: 'Fiat',
        //                     price: '200',
        //                 },
        //             ],
        //             seats: 100,
        //         });
        //
        //         await failWithCode(
        //             sdk.events.addCategories(otherUser.token, event.id, {
        //                 categories: [newCategory.data.category.id],
        //             }),
        //             StatusCodes.Unauthorized,
        //         );
        //     });
        //
        //     test('should fail on duplicate category id', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         await failWithCode(
        //             sdk.events.addCategories(token, event.id, {
        //                 categories: event.categories,
        //             }),
        //             StatusCodes.Conflict,
        //         );
        //     });
        //
        //     test('should fail on already bound category', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const otherEvent = await createEvent(token, sdk);
        //
        //         await failWithCode(
        //             sdk.events.addCategories(token, event.id, {
        //                 categories: otherEvent.categories,
        //             }),
        //             StatusCodes.BadRequest,
        //         );
        //     });
        //
        //     test('should fail on invalid group id', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const otherEvent = await createEvent(token, sdk);
        //
        //         const newCategory = await sdk.categories.create(token, {
        //             group_id: otherEvent.group_id,
        //             display_name: 'VIP',
        //             sale_begin: new Date(Date.now() + 1000000),
        //             sale_end: new Date(Date.now() + 2000000),
        //             resale_begin: new Date(Date.now() + 1000000),
        //             resale_end: new Date(Date.now() + 2000000),
        //             prices: [
        //                 {
        //                     currency: 'Fiat',
        //                     price: '200',
        //                 },
        //             ],
        //             seats: 100,
        //         });
        //
        //         await failWithCode(
        //             sdk.events.addCategories(token, event.id, {
        //                 categories: [newCategory.data.category.id],
        //             }),
        //             StatusCodes.BadRequest,
        //         );
        //     });
        // });
        //
        // describe('deleteDates (DELETE /events/:eventId/dates)', function() {
        //     test('should unbind both dates of the event', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const updatedEvent = await sdk.events.deleteDates(token, event.id, {
        //             dates: event.dates,
        //         });
        //
        //         expect(updatedEvent.data.event.dates).toEqual([]);
        //     });
        //
        //     test('should fail for unauthenticated', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         await failWithCode(
        //             sdk.events.deleteDates(null, event.id, {
        //                 dates: event.dates,
        //             }),
        //             StatusCodes.Unauthorized,
        //         );
        //     });
        //
        //     test('should fail for unauthorized', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const otherUser = await getUser(sdk);
        //
        //         await failWithCode(
        //             sdk.events.deleteDates(otherUser.token, event.id, {
        //                 dates: event.dates,
        //             }),
        //             StatusCodes.Unauthorized,
        //         );
        //     });
        //
        //     test('should fail for date not found', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         await failWithCode(
        //             sdk.events.deleteDates(token, event.id, {
        //                 dates: [event.id],
        //             }),
        //             StatusCodes.NotFound,
        //         );
        //     });
        // });
        //
        // describe('addDates (POST /events/:eventId/dates)', function() {
        //     test('should add a new date to the event', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const newDate = await sdk.dates.create(token, {
        //             group_id: event.group_id,
        //             location: {
        //                 location: {
        //                     lat: 48.882301,
        //                     lon: 2.34015,
        //                 },
        //                 location_label: '120 Boulevard de Rochechouart, 75018 Paris',
        //             },
        //             metadata: {
        //                 name: 'Test Date',
        //                 description: 'This is a test date',
        //                 tags: ['wow'],
        //                 avatar: null,
        //                 signature_colors: ['#00ff00', '#ff0000'],
        //             },
        //             timestamps: {
        //                 event_begin: new Date(Date.now() + 1000000),
        //                 event_end: new Date(Date.now() + 2000000),
        //             },
        //         });
        //
        //         const updatedDate = await sdk.events.addDates(token, event.id, {
        //             dates: [newDate.data.date.id],
        //         });
        //
        //         expect(updatedDate.data.event.dates).toEqual([...event.dates, newDate.data.date.id]);
        //     });
        //
        //     test('should fail on unauthenticated user', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const newDate = await sdk.dates.create(token, {
        //             group_id: event.group_id,
        //             location: {
        //                 location: {
        //                     lat: 48.882301,
        //                     lon: 2.34015,
        //                 },
        //                 location_label: '120 Boulevard de Rochechouart, 75018 Paris',
        //             },
        //             metadata: {
        //                 name: 'Test Date',
        //                 description: 'This is a test date',
        //                 tags: ['wow'],
        //                 avatar: null,
        //                 signature_colors: ['#00ff00', '#ff0000'],
        //             },
        //             timestamps: {
        //                 event_begin: new Date(Date.now() + 1000000),
        //                 event_end: new Date(Date.now() + 2000000),
        //             },
        //         });
        //
        //         await failWithCode(
        //             sdk.events.addDates(null, event.id, {
        //                 dates: [newDate.data.date.id],
        //             }),
        //             StatusCodes.Unauthorized,
        //         );
        //     });
        //
        //     test('should fail on unauthorized user', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const otherUser = await getUser(sdk);
        //
        //         const newDate = await sdk.dates.create(token, {
        //             group_id: event.group_id,
        //             location: {
        //                 location: {
        //                     lat: 48.882301,
        //                     lon: 2.34015,
        //                 },
        //                 location_label: '120 Boulevard de Rochechouart, 75018 Paris',
        //             },
        //             metadata: {
        //                 name: 'Test Date',
        //                 description: 'This is a test date',
        //                 tags: ['wow'],
        //                 avatar: null,
        //                 signature_colors: ['#00ff00', '#ff0000'],
        //             },
        //             timestamps: {
        //                 event_begin: new Date(Date.now() + 1000000),
        //                 event_end: new Date(Date.now() + 2000000),
        //             },
        //         });
        //
        //         await failWithCode(
        //             sdk.events.addDates(otherUser.token, event.id, {
        //                 dates: [newDate.data.date.id],
        //             }),
        //             StatusCodes.Unauthorized,
        //         );
        //     });
        //
        //     test('should fail on date conflict', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         await failWithCode(
        //             sdk.events.addDates(token, event.id, {
        //                 dates: event.dates,
        //             }),
        //             StatusCodes.Conflict,
        //         );
        //     });
        //
        //     test('should fail on binding conflict', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const otherEvent = await createEvent(token, sdk);
        //
        //         await failWithCode(
        //             sdk.events.addDates(token, event.id, {
        //                 dates: otherEvent.dates,
        //             }),
        //             StatusCodes.BadRequest,
        //         );
        //     });
        //
        //     test('should fail on invalid group id', async function() {
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
        //         const event = await createEvent(token, sdk);
        //
        //         const otherEvent = await createEvent(token, sdk);
        //
        //         const newDate = await sdk.dates.create(token, {
        //             group_id: otherEvent.group_id,
        //             location: {
        //                 location: {
        //                     lat: 48.882301,
        //                     lon: 2.34015,
        //                 },
        //                 location_label: '120 Boulevard de Rochechouart, 75018 Paris',
        //             },
        //             metadata: {
        //                 name: 'Test Date',
        //                 description: 'This is a test date',
        //                 tags: ['wow'],
        //                 avatar: null,
        //                 signature_colors: ['#00ff00', '#ff0000'],
        //             },
        //             timestamps: {
        //                 event_begin: new Date(Date.now() + 1000000),
        //                 event_end: new Date(Date.now() + 2000000),
        //             },
        //         });
        //
        //         await failWithCode(
        //             sdk.events.addDates(token, event.id, {
        //                 dates: [newDate.data.date.id],
        //             }),
        //             StatusCodes.BadRequest,
        //         );
        //     });
        // });
        //
        // describe('withdraw (POST /events/:eventId/withdraw)', function() {
        //     test('should properly recover tokens from user purchases', async function() {
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
        //         const amountReceived = 10370;
        //
        //         const validPaymentIntentId = await createPaymentIntent({
        //             charges: {
        //                 data: [
        //                     {
        //                         amount_refunded: 89630,
        //                         payment_method_details: {
        //                             type: 'card',
        //                             card: {
        //                                 country: 'FR',
        //                             },
        //                         },
        //                     },
        //                 ],
        //             } as Stripe.ApiList<Stripe.Charge>,
        //             amount: 100000,
        //             payment_method_types: ['card'],
        //             status: 'succeeded',
        //             currency: 'eur',
        //             amount_received: amountReceived,
        //         });
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
        //             return tickets.filter((ticket: TicketEntity): boolean => ticket.status === 'ready').length === 1;
        //         });
        //
        //         const withdrawReceipt = await sdk.events.withdraw(token, event.id, {
        //             currency: 'T721Token',
        //             amount: '10000',
        //         });
        //
        //         await waitForActionSet(sdk, token, withdrawReceipt.data.txSeqId, (as: ActionSetEntity): boolean => {
        //             return as.current_status === 'complete';
        //         });
        //     });
        //
        //     test('should fail for amount too high', async function() {
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
        //         const amountReceived = 10370;
        //
        //         const validPaymentIntentId = await createPaymentIntent({
        //             charges: {
        //                 data: [
        //                     {
        //                         amount_refunded: 89630,
        //                         payment_method_details: {
        //                             type: 'card',
        //                             card: {
        //                                 country: 'FR',
        //                             },
        //                         },
        //                     },
        //                 ],
        //             } as Stripe.ApiList<Stripe.Charge>,
        //             amount: 100000,
        //             payment_method_types: ['card'],
        //             status: 'succeeded',
        //             currency: 'eur',
        //             amount_received: amountReceived,
        //         });
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
        //             return tickets.filter((ticket: TicketEntity): boolean => ticket.status === 'ready').length === 1;
        //         });
        //
        //         await failWithCode(
        //             sdk.events.withdraw(token, event.id, {
        //                 currency: 'T721Token',
        //                 amount: '10001',
        //             }),
        //             StatusCodes.Forbidden,
        //             'requested_amount_too_high',
        //         );
        //     });
        //
        //     test('should fail for invalid currency withdraw request', async function() {
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
        //         const amountReceived = 10370;
        //
        //         const validPaymentIntentId = await createPaymentIntent({
        //             charges: {
        //                 data: [
        //                     {
        //                         amount_refunded: 89630,
        //                         payment_method_details: {
        //                             type: 'card',
        //                             card: {
        //                                 country: 'FR',
        //                             },
        //                         },
        //                     },
        //                 ],
        //             } as Stripe.ApiList<Stripe.Charge>,
        //             amount: 100000,
        //             payment_method_types: ['card'],
        //             status: 'succeeded',
        //             currency: 'eur',
        //             amount_received: amountReceived,
        //         });
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
        //             return tickets.filter((ticket: TicketEntity): boolean => ticket.status === 'ready').length === 1;
        //         });
        //
        //         await failWithCode(
        //             sdk.events.withdraw(token, event.id, {
        //                 currency: 'Fiat',
        //                 amount: '10000',
        //             }),
        //             StatusCodes.Forbidden,
        //             'invalid_currency_to_withdraw',
        //         );
        //     });
        //
        //     test('should fail for unknown currency withdraw request', async function() {
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
        //         const amountReceived = 10370;
        //
        //         const validPaymentIntentId = await createPaymentIntent({
        //             charges: {
        //                 data: [
        //                     {
        //                         amount_refunded: 89630,
        //                         payment_method_details: {
        //                             type: 'card',
        //                             card: {
        //                                 country: 'FR',
        //                             },
        //                         },
        //                     },
        //                 ],
        //             } as Stripe.ApiList<Stripe.Charge>,
        //             amount: 100000,
        //             payment_method_types: ['card'],
        //             status: 'succeeded',
        //             currency: 'eur',
        //             amount_received: amountReceived,
        //         });
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
        //             return tickets.filter((ticket: TicketEntity): boolean => ticket.status === 'ready').length === 1;
        //         });
        //
        //         await failWithCode(
        //             sdk.events.withdraw(token, event.id, {
        //                 currency: 'Fiat Punto',
        //                 amount: '10000',
        //             }),
        //             StatusCodes.NotFound,
        //             'cannot_find_currency',
        //         );
        //     });
        //
        //     test('should fail for missing rights', async function() {
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
        //         const otherUser = await getUser(sdk);
        //
        //         const amountReceived = 10370;
        //
        //         const validPaymentIntentId = await createPaymentIntent({
        //             charges: {
        //                 data: [
        //                     {
        //                         amount_refunded: 89630,
        //                         payment_method_details: {
        //                             type: 'card',
        //                             card: {
        //                                 country: 'FR',
        //                             },
        //                         },
        //                     },
        //                 ],
        //             } as Stripe.ApiList<Stripe.Charge>,
        //             amount: 100000,
        //             payment_method_types: ['card'],
        //             status: 'succeeded',
        //             currency: 'eur',
        //             amount_received: amountReceived,
        //         });
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
        //             return tickets.filter((ticket: TicketEntity): boolean => ticket.status === 'ready').length === 1;
        //         });
        //
        //         await failWithCode(
        //             sdk.events.withdraw(otherUser.token, event.id, {
        //                 currency: 'T721Token',
        //                 amount: '10000',
        //             }),
        //             StatusCodes.Unauthorized,
        //             'unauthorized_action',
        //         );
        //     });
        // });

        describe('guestlist (POST /events/:eventId/guestlist)', function() {

            test('should search for created tickets', async function() {
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

                const categoryIds = (await sdk.categories.search(token, {
                    group_id: {
                        $eq: event.group_id
                    },
                    parent_type: {
                        $eq: 'date'
                    }
                })).data.categories.map((c: CategoryEntity) => c.id);

                await sdk.cart.ticketSelections(token, actionSetId, {
                    tickets: [
                        ...[...Array(2)].map(() => ({
                            categoryId: categoryIds[0],
                            price: {
                                currency: 'Fiat',
                                price: '10000',
                            },
                        })),
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

                await validateCardPayment(await getPIFromCart(sdk, token, actionSetId));

                const res = await sdk.checkout.cart.resolve.paymentIntent(token, {
                    cart: actionSetId,
                });

                const checkoutActionSetId = res.data.checkoutActionSetId;

                await waitForActionSet(sdk, token, checkoutActionSetId, (as: ActionSetEntity): boolean => {
                    return as.current_status === 'complete';
                });

                await waitForTickets(sdk, token, user.address, (tickets: TicketEntity[]): boolean => {
                    return tickets.length === 5;
                });

                const tickets = await sdk.tickets.search(token, {
                    owner: {
                        $eq: user.address,
                    },
                });

                expect(tickets.data.tickets.length).toEqual(5);

                const guestlist = await sdk.events.guestlist(token, event.id, {
                    dateIds: [],
                    page_size: 10,
                    page_index: 0
                });

                console.log(guestlist.data);

            });

        });
    };
}
