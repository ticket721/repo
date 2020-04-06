import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import { admin_addRight, failWithCode, generateUserName, getSDKAndUser } from '../../../test/utils';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('search (POST /dates/search)', function() {
            test.concurrent('should search for created date', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");
                const newDate = await sdk.dates.create(token, {
                    group_id: groupID,
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                    timestamps: {
                        event_begin: new Date(Date.now() + 1000000),
                        event_end: new Date(Date.now() + 2000000),
                    },
                });

                const datesSearch = await sdk.dates.search(token, {
                    id: {
                        $eq: newDate.data.date.id,
                    },
                } as SortablePagedSearch);

                expect(datesSearch.data.dates.length).toEqual(1);
            });

            test.concurrent('should search for created date from unauthenticated', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");
                const newDate = await sdk.dates.create(token, {
                    group_id: groupID,
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                    timestamps: {
                        event_begin: new Date(Date.now() + 1000000),
                        event_end: new Date(Date.now() + 2000000),
                    },
                });

                const datesSearch = await sdk.dates.search(null, {
                    id: {
                        $eq: newDate.data.date.id,
                    },
                } as SortablePagedSearch);

                expect(datesSearch.data.dates.length).toEqual(1);
            });
        });

        describe('create (POST /dates)', function() {
            test.concurrent('should create a date', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");
                const newDate = await sdk.dates.create(token, {
                    group_id: groupID,
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                    timestamps: {
                        event_begin: new Date(Date.now() + 1000000),
                        event_end: new Date(Date.now() + 2000000),
                    },
                });

                expect(newDate.data.date).toEqual({
                    id: newDate.data.date.id,
                    group_id: groupID,
                    categories: [],
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                        assigned_city: 1250015082,
                    },
                    timestamps: {
                        event_begin: newDate.data.date.timestamps.event_begin,
                        event_end: newDate.data.date.timestamps.event_end,
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                } as Partial<DateEntity>);
            });

            test.concurrent('should fail for unauthenticated', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");
                await failWithCode(
                    sdk.dates.create(null, {
                        group_id: groupID,
                        location: {
                            location: {
                                lat: 48.882301,
                                lon: 2.34015,
                            },
                            location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                        },
                        metadata: {
                            name: 'Test Date',
                            description: 'This is a test date',
                            tags: ['wow'],
                            avatar: null,
                        },
                        timestamps: {
                            event_begin: new Date(Date.now() + 1000000),
                            event_end: new Date(Date.now() + 2000000),
                        },
                    }),
                    StatusCodes.Unauthorized,
                );
            });

            test.concurrent('should fail for authorization reasons', async function() {
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

                const groupID = generateUserName();

                await failWithCode(
                    sdk.dates.create(token, {
                        group_id: groupID,
                        location: {
                            location: {
                                lat: 48.882301,
                                lon: 2.34015,
                            },
                            location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                        },
                        metadata: {
                            name: 'Test Date',
                            description: 'This is a test date',
                            tags: ['wow'],
                            avatar: null,
                        },
                        timestamps: {
                            event_begin: new Date(Date.now() + 1000000),
                            event_end: new Date(Date.now() + 2000000),
                        },
                    }),
                    StatusCodes.Unauthorized,
                );
            });

            test.concurrent('should fail for invalid date range', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");

                await failWithCode(
                    sdk.dates.create(token, {
                        group_id: groupID,
                        location: {
                            location: {
                                lat: 48.882301,
                                lon: 2.34015,
                            },
                            location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                        },
                        metadata: {
                            name: 'Test Date',
                            description: 'This is a test date',
                            tags: ['wow'],
                            avatar: null,
                        },
                        timestamps: {
                            event_begin: new Date(Date.now() + 2000000),
                            event_end: new Date(Date.now() + 1000000),
                        },
                    }),
                    StatusCodes.BadRequest,
                );
            });
        });

        describe('addCategories (POST /:dateId/categories', function() {
            test.concurrent('should create a date, a category, and add it to the date', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");
                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

                const newDate = await sdk.dates.create(token, {
                    group_id: groupID,
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                    timestamps: {
                        event_begin: new Date(Date.now() + 1000000),
                        event_end: new Date(Date.now() + 2000000),
                    },
                });

                const newCategory = await sdk.categories.create(token, {
                    group_id: groupID,
                    display_name: 'VIP',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    prices: [
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ],
                    seats: 100,
                });

                const updatedDate = await sdk.dates.addCategories(token, newDate.data.date.id, {
                    categories: [newCategory.data.category.id],
                });

                expect(updatedDate.data.date.categories).toEqual([newCategory.data.category.id]);
            });

            test.concurrent('should fail for unauthenticated', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");
                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

                const newDate = await sdk.dates.create(token, {
                    group_id: groupID,
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                    timestamps: {
                        event_begin: new Date(Date.now() + 1000000),
                        event_end: new Date(Date.now() + 2000000),
                    },
                });

                const newCategory = await sdk.categories.create(token, {
                    group_id: groupID,
                    display_name: 'VIP',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    prices: [
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ],
                    seats: 100,
                });

                await failWithCode(
                    sdk.dates.addCategories(null, newDate.data.date.id, {
                        categories: [newCategory.data.category.id],
                    }),
                    StatusCodes.Unauthorized,
                );
            });

            test.concurrent('should fail adding category already present', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");
                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

                const newDate = await sdk.dates.create(token, {
                    group_id: groupID,
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                    timestamps: {
                        event_begin: new Date(Date.now() + 1000000),
                        event_end: new Date(Date.now() + 2000000),
                    },
                });

                const newCategory = await sdk.categories.create(token, {
                    group_id: groupID,
                    display_name: 'VIP',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    prices: [
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ],
                    seats: 100,
                });

                await sdk.dates.addCategories(token, newDate.data.date.id, {
                    categories: [newCategory.data.category.id],
                });

                await failWithCode(
                    sdk.dates.addCategories(token, newDate.data.date.id, {
                        categories: [newCategory.data.category.id],
                    }),
                    StatusCodes.Conflict,
                );
            });

            test.concurrent('should fail adding a category already bound', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");
                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

                const newDateOne = await sdk.dates.create(token, {
                    group_id: groupID,
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                    timestamps: {
                        event_begin: new Date(Date.now() + 1000000),
                        event_end: new Date(Date.now() + 2000000),
                    },
                });

                const newDateTwo = await sdk.dates.create(token, {
                    group_id: groupID,
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                    timestamps: {
                        event_begin: new Date(Date.now() + 1000000),
                        event_end: new Date(Date.now() + 2000000),
                    },
                });

                const newCategory = await sdk.categories.create(token, {
                    group_id: groupID,
                    display_name: 'VIP',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    prices: [
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ],
                    seats: 100,
                });

                await sdk.dates.addCategories(token, newDateOne.data.date.id, {
                    categories: [newCategory.data.category.id],
                });

                await failWithCode(
                    sdk.dates.addCategories(token, newDateTwo.data.date.id, {
                        categories: [newCategory.data.category.id],
                    }),
                    StatusCodes.BadRequest,
                );
            });

            test.concurrent('should fail adding a category with wrong group_id', async function() {
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

                const groupID = generateUserName();
                const otherGroupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");
                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

                await admin_addRight(user.id, 'date', otherGroupID, "{ 'owner' : true }");
                await admin_addRight(user.id, 'category', otherGroupID, "{ 'owner' : true }");

                const newDate = await sdk.dates.create(token, {
                    group_id: groupID,
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                    timestamps: {
                        event_begin: new Date(Date.now() + 1000000),
                        event_end: new Date(Date.now() + 2000000),
                    },
                });

                const newCategory = await sdk.categories.create(token, {
                    group_id: otherGroupID,
                    display_name: 'VIP',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    prices: [
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ],
                    seats: 100,
                });

                await failWithCode(
                    sdk.dates.addCategories(token, newDate.data.date.id, {
                        categories: [newCategory.data.category.id],
                    }),
                    StatusCodes.BadRequest,
                );
            });
        });

        describe('deleteCategories (DELETE /:dateId/categories)', function() {
            test.concurrent('should create a date, a category, add it to the date then remove it', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");
                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

                const newDate = await sdk.dates.create(token, {
                    group_id: groupID,
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                    timestamps: {
                        event_begin: new Date(Date.now() + 1000000),
                        event_end: new Date(Date.now() + 2000000),
                    },
                });

                const newCategoryOne = await sdk.categories.create(token, {
                    group_id: groupID,
                    display_name: 'VIP',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    prices: [
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ],
                    seats: 100,
                });

                const newCategoryTwo = await sdk.categories.create(token, {
                    group_id: groupID,
                    display_name: 'Regular',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    prices: [
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ],
                    seats: 100,
                });

                await sdk.dates.addCategories(token, newDate.data.date.id, {
                    categories: [newCategoryOne.data.category.id, newCategoryTwo.data.category.id],
                });

                const updatedDate = await sdk.dates.deleteCategories(token, newDate.data.date.id, {
                    categories: [newCategoryOne.data.category.id],
                });

                expect(updatedDate.data.date.categories).toEqual([newCategoryTwo.data.category.id]);
            });

            test.concurrent('should fail for unauthenticated', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");
                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

                const newDate = await sdk.dates.create(token, {
                    group_id: groupID,
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                    timestamps: {
                        event_begin: new Date(Date.now() + 1000000),
                        event_end: new Date(Date.now() + 2000000),
                    },
                });

                const newCategory = await sdk.categories.create(token, {
                    group_id: groupID,
                    display_name: 'VIP',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    prices: [
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ],
                    seats: 100,
                });

                await sdk.dates.addCategories(token, newDate.data.date.id, {
                    categories: [newCategory.data.category.id],
                });

                await failWithCode(
                    sdk.dates.deleteCategories(null, newDate.data.date.id, {
                        categories: [newCategory.data.category.id],
                    }),
                    StatusCodes.Unauthorized,
                );
            });

            test.concurrent('should fail by removing category not in date', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");
                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

                const newDate = await sdk.dates.create(token, {
                    group_id: groupID,
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                    timestamps: {
                        event_begin: new Date(Date.now() + 1000000),
                        event_end: new Date(Date.now() + 2000000),
                    },
                });

                const newCategory = await sdk.categories.create(token, {
                    group_id: groupID,
                    display_name: 'VIP',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    prices: [
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ],
                    seats: 100,
                });

                await failWithCode(
                    sdk.dates.deleteCategories(token, newDate.data.date.id, {
                        categories: [newCategory.data.category.id],
                    }),
                    StatusCodes.NotFound,
                );
            });

            test.concurrent('should fail by removing category not in date', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");
                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

                const newDate = await sdk.dates.create(token, {
                    group_id: groupID,
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                    timestamps: {
                        event_begin: new Date(Date.now() + 1000000),
                        event_end: new Date(Date.now() + 2000000),
                    },
                });

                const newCategory = await sdk.categories.create(token, {
                    group_id: groupID,
                    display_name: 'VIP',
                    sale_begin: new Date(Date.now() + 1000000),
                    sale_end: new Date(Date.now() + 2000000),
                    resale_begin: new Date(Date.now() + 1000000),
                    resale_end: new Date(Date.now() + 2000000),
                    prices: [
                        {
                            currency: 'Fiat',
                            price: '100',
                        },
                    ],
                    seats: 100,
                });

                await failWithCode(
                    sdk.dates.deleteCategories(token, newDate.data.date.id, {
                        categories: [newCategory.data.category.id],
                    }),
                    StatusCodes.NotFound,
                );
            });
        });

        describe('update (PUT /:dateId)', function() {
            test.concurrent('should update date', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");
                const newDate = await sdk.dates.create(token, {
                    group_id: groupID,
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                    timestamps: {
                        event_begin: new Date(Date.now() + 1000000),
                        event_end: new Date(Date.now() + 2000000),
                    },
                });

                const updatedDate = await sdk.dates.update(token, newDate.data.date.id, {
                    metadata: {
                        name: 'Testing the Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                });

                expect(updatedDate.data.date.metadata.name).toEqual('Testing the Test Date');
            });

            test.concurrent('should update date location', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");
                const newDate = await sdk.dates.create(token, {
                    group_id: groupID,
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                    timestamps: {
                        event_begin: new Date(Date.now() + 1000000),
                        event_end: new Date(Date.now() + 2000000),
                    },
                });

                const updatedDate = await sdk.dates.update(token, newDate.data.date.id, {
                    location: {
                        location: {
                            lat: 40.75901,
                            lon: -73.984474,
                        },
                        location_label: 'Times Square',
                    },
                });

                expect(updatedDate.data.date.location).toEqual({
                    location: {
                        lat: 40.75901,
                        lon: -73.984474,
                    },
                    location_label: 'Times Square',
                    assigned_city: 1840081754,
                });
            });

            test.concurrent('should fail on unauthenticated', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");
                const newDate = await sdk.dates.create(token, {
                    group_id: groupID,
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                    timestamps: {
                        event_begin: new Date(Date.now() + 1000000),
                        event_end: new Date(Date.now() + 2000000),
                    },
                });

                await failWithCode(
                    sdk.dates.update(null, newDate.data.date.id, {
                        metadata: {
                            name: 'Testing the Test Date',
                            description: 'This is a test date',
                            tags: ['wow'],
                            avatar: null,
                        },
                    }),
                    StatusCodes.Unauthorized,
                );
            });

            test.concurrent('should fail on invalid date range', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");
                const newDate = await sdk.dates.create(token, {
                    group_id: groupID,
                    location: {
                        location: {
                            lat: 48.882301,
                            lon: 2.34015,
                        },
                        location_label: '120 Boulevard de Rochechouart, 75018 Paris',
                    },
                    metadata: {
                        name: 'Test Date',
                        description: 'This is a test date',
                        tags: ['wow'],
                        avatar: null,
                    },
                    timestamps: {
                        event_begin: new Date(Date.now() + 1000000),
                        event_end: new Date(Date.now() + 2000000),
                    },
                });

                await failWithCode(
                    sdk.dates.update(token, newDate.data.date.id, {
                        timestamps: {
                            event_begin: new Date(Date.now() + 2000000),
                            event_end: new Date(Date.now() + 1000000),
                        },
                    }),
                    StatusCodes.BadRequest,
                );
            });
        });
    };
}
