import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import { admin_addRight, generateUserName, getSDKAndUser, getUser } from '../../../test/utils';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('search (GET /rights)', function() {
            test.concurrent('should properly search for own rights', async function() {
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
                await admin_addRight(user.id, 'event', groupID, "{ 'owner' : true }");
                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");

                await admin_addRight(otherUser.user.id, 'category', groupID, "{ 'owner' : true }");
                await admin_addRight(otherUser.user.id, 'event', groupID, "{ 'owner' : true }");
                await admin_addRight(otherUser.user.id, 'date', groupID, "{ 'owner' : true }");

                const rights = await sdk.rights.search(token, {});

                expect(rights.data.rights.length).toEqual(3);
            });

            test.concurrent('should properly search for own rights by entity type', async function() {
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
                await admin_addRight(user.id, 'event', groupID, "{ 'owner' : true }");
                await admin_addRight(user.id, 'date', groupID, "{ 'owner' : true }");

                await admin_addRight(otherUser.user.id, 'category', groupID, "{ 'owner' : true }");
                await admin_addRight(otherUser.user.id, 'event', groupID, "{ 'owner' : true }");
                await admin_addRight(otherUser.user.id, 'date', groupID, "{ 'owner' : true }");

                const rights = await sdk.rights.search(token, {
                    entity_type: {
                        $eq: 'event',
                    },
                });

                expect(rights.data.rights.length).toEqual(1);
            });
        });
    };
}
