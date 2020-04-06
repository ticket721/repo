import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import { admin_addRight, failWithCode, generateUserName, getSDKAndUser, getUser } from '../../../test/utils';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('create (POST /categories)', function() {
            test.concurrent('should properly create category, from group ID owner', async function() {
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

                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

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

                expect(newCategory.data.category).toMatchObject({
                    category_name: 'vip',
                    display_name: 'VIP',
                    group_id: groupID,
                    id: newCategory.data.category.id,
                    prices: [
                        {
                            currency: 'T721Token',
                            log_value: 6.643856189774724,
                            value: '100',
                        },
                    ],
                    resale_begin: newCategory.data.category.resale_begin,
                    resale_end: newCategory.data.category.resale_end,
                    sale_begin: newCategory.data.category.sale_begin,
                    sale_end: newCategory.data.category.sale_end,
                    scope: 'ticket721_0',
                    seats: 100,
                });
            });

            test.concurrent('should fail creating cateogory without rights', async function() {
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
                    sdk.categories.create(token, {
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
                    }),
                    StatusCodes.Unauthorized,
                );
            });

            test.concurrent('should fail for category name conflict', async function() {
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

                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

                await sdk.categories.create(token, {
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
                    sdk.categories.create(token, {
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
                    }),
                    StatusCodes.Conflict,
                );
            });

            test.concurrent('should fail for invalid currency', async function() {
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

                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

                await failWithCode(
                    sdk.categories.create(token, {
                        group_id: groupID,
                        display_name: 'VIP',
                        sale_begin: new Date(Date.now() + 1000000),
                        sale_end: new Date(Date.now() + 2000000),
                        resale_begin: new Date(Date.now() + 1000000),
                        resale_end: new Date(Date.now() + 2000000),
                        prices: [
                            {
                                currency: 'Fiat Punto',
                                price: '100',
                            },
                        ],
                        seats: 100,
                    }),
                    StatusCodes.BadRequest,
                );
            });

            test.concurrent('should fail for sale dates', async function() {
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

                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

                await failWithCode(
                    sdk.categories.create(token, {
                        group_id: groupID,
                        display_name: 'VIP',
                        sale_begin: new Date(Date.now() + 2000000),
                        sale_end: new Date(Date.now() + 1000000),
                        resale_begin: new Date(Date.now() + 1000000),
                        resale_end: new Date(Date.now() + 2000000),
                        prices: [
                            {
                                currency: 'Fiat',
                                price: '100',
                            },
                        ],
                        seats: 100,
                    }),
                    StatusCodes.BadRequest,
                );
            });

            test.concurrent('should fail for resale dates', async function() {
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

                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

                await failWithCode(
                    sdk.categories.create(token, {
                        group_id: groupID,
                        display_name: 'VIP',
                        sale_begin: new Date(Date.now() + 1000000),
                        sale_end: new Date(Date.now() + 2000000),
                        resale_begin: new Date(Date.now() + 2000000),
                        resale_end: new Date(Date.now() + 1000000),
                        prices: [
                            {
                                currency: 'Fiat',
                                price: '100',
                            },
                        ],
                        seats: 100,
                    }),
                    StatusCodes.BadRequest,
                );
            });
        });

        describe('update (PUT /categories/:categoryId)', function() {
            test.concurrent('should update category name', async function() {
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

                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

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

                const editedCategory = await sdk.categories.update(token, newCategory.data.category.id, {
                    display_name: 'MEGA VIP',
                });

                expect(editedCategory.data.category).toMatchObject({
                    category_name: 'vip',
                    display_name: 'MEGA VIP',
                    group_id: groupID,
                    id: editedCategory.data.category.id,
                    prices: [
                        {
                            currency: 'T721Token',
                            log_value: 6.643856189774724,
                            value: '100',
                        },
                    ],
                    resale_begin: editedCategory.data.category.resale_begin,
                    resale_end: editedCategory.data.category.resale_end,
                    sale_begin: editedCategory.data.category.sale_begin,
                    sale_end: editedCategory.data.category.sale_end,
                    scope: 'ticket721_0',
                    seats: 100,
                });
            });

            test.concurrent('should update price', async function() {
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

                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

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

                const editedCategory = await sdk.categories.update(token, newCategory.data.category.id, {
                    prices: [
                        {
                            currency: 'Fiat',
                            price: '200',
                        },
                    ],
                });

                expect(editedCategory.data.category).toMatchObject({
                    category_name: 'vip',
                    display_name: 'VIP',
                    group_id: groupID,
                    id: editedCategory.data.category.id,
                    prices: [
                        {
                            currency: 'T721Token',
                            log_value: 7.643856189774724,
                            value: '200',
                        },
                    ],
                    resale_begin: editedCategory.data.category.resale_begin,
                    resale_end: editedCategory.data.category.resale_end,
                    sale_begin: editedCategory.data.category.sale_begin,
                    sale_end: editedCategory.data.category.sale_end,
                    scope: 'ticket721_0',
                    seats: 100,
                });
            });

            test.concurrent('should fail update from user without rights', async function() {
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

                const groupID = generateUserName();

                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

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
                    sdk.categories.update(otherUser.token, newCategory.data.category.id, {
                        display_name: 'MEGA VIP',
                    }),
                    StatusCodes.Unauthorized,
                );
            });

            test.concurrent('should fail on invalid sale dates', async function() {
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

                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

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
                    sdk.categories.update(token, newCategory.data.category.id, {
                        sale_begin: new Date(Date.now() + 2000000),
                        sale_end: new Date(Date.now() + 1000000),
                    }),
                    StatusCodes.BadRequest,
                );
            });

            test.concurrent('should fail on invalid resale dates', async function() {
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

                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

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
                    sdk.categories.update(token, newCategory.data.category.id, {
                        resale_begin: new Date(Date.now() + 2000000),
                        resale_end: new Date(Date.now() + 1000000),
                    }),
                    StatusCodes.BadRequest,
                );
            });

            test.concurrent('should fail on invalid prices', async function() {
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

                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

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
                    sdk.categories.update(token, newCategory.data.category.id, {
                        prices: [
                            {
                                currency: 'Fiat Punto',
                                price: '100',
                            },
                        ],
                    }),
                    StatusCodes.BadRequest,
                );
            });
        });

        describe('search (GET /categories/search)', function() {
            test.concurrent('should search owned categories', async function() {
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

                await admin_addRight(user.id, 'category', groupID, "{ 'owner' : true }");

                const createdCategory = await sdk.categories.create(token, {
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

                const categories = await sdk.categories.search(null, {
                    $page_size: 10000,
                    $sort: [
                        {
                            $field_name: 'created_at',
                            $order: 'desc',
                        },
                    ],
                });

                expect(
                    categories.data.categories.findIndex((cat: CategoryEntity): boolean => {
                        return cat.id === createdCategory.data.category.id;
                    }),
                ).not.toEqual(-1);
            });
        });
    };
}
