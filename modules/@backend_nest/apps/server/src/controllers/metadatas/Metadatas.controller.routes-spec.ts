import { createEvent, failWithCode, getSDKAndUser, getUser, pause } from '../../../test/utils';
import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import { StatusCodes } from '@lib/common/utils/codes.value';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('fetch (GET /fetch)', function() {
            test('should fetch all metadatas from event creation', async function() {
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

                await pause(2000);

                const metadataFetchRes = await sdk.metadatas.fetch(token, {
                    withLinks: [],
                    useReadRights: [
                        {
                            type: 'event',
                            field: 'group_id',
                            id: event.group_id,
                        },
                        {
                            type: 'date',
                            field: 'group_id',
                            id: event.group_id,
                        },
                        {
                            type: 'category',
                            field: 'group_id',
                            id: event.group_id,
                        },
                    ],
                    metadataClassName: 'history',
                    metadataTypeName: 'create',
                });

                expect(metadataFetchRes.data.metadatas.length).toEqual(6);
            });
            test('should fetch event metadatas from event creation', async function() {
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

                await pause(2000);

                const metadataFetchRes = await sdk.metadatas.fetch(token, {
                    withLinks: [],
                    useReadRights: [
                        {
                            type: 'event',
                            field: 'group_id',
                            id: event.group_id,
                        },
                    ],
                    metadataClassName: 'history',
                    metadataTypeName: 'create',
                });

                expect(metadataFetchRes.data.metadatas.length).toEqual(1);
            });
            test('should fetch date metadatas from event creation', async function() {
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

                await pause(2000);

                const metadataFetchRes = await sdk.metadatas.fetch(token, {
                    withLinks: [],
                    useReadRights: [
                        {
                            type: 'date',
                            field: 'group_id',
                            id: event.group_id,
                        },
                    ],
                    metadataClassName: 'history',
                    metadataTypeName: 'create',
                });

                expect(metadataFetchRes.data.metadatas.length).toEqual(2);
            });
            test('should fetch category metadatas from event creation', async function() {
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

                await pause(2000);

                const metadataFetchRes = await sdk.metadatas.fetch(token, {
                    withLinks: [],
                    useReadRights: [
                        {
                            type: 'category',
                            field: 'group_id',
                            id: event.group_id,
                        },
                    ],
                    metadataClassName: 'history',
                    metadataTypeName: 'create',
                });

                expect(metadataFetchRes.data.metadatas.length).toEqual(3);
            });
            test('should fail fetching metadata from not owned event', async function() {
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

                await pause(2000);

                await failWithCode(
                    sdk.metadatas.fetch(otherUser.token, {
                        withLinks: [],
                        useReadRights: [
                            {
                                type: 'event',
                                field: 'group_id',
                                id: event.group_id,
                            },
                        ],
                        metadataClassName: 'history',
                        metadataTypeName: 'create',
                    }),
                    StatusCodes.Unauthorized,
                );
            });
        });
    };
}
