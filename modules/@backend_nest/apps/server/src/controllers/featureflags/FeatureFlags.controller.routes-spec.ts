import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import { admin_setAdmin, getSDKAndUser } from '../../../test/utils';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('get (GET /feature-flags)', function() {
            test('should properly fetch user flags', async function() {
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

                const flags = await sdk.featureFlags.fetch(token);

                expect(flags.data.flags).toEqual({
                    test_flag: { active: true },
                    test_flag_two: { active: false },
                });
            });

            test('should properly fetch user flags (admin = true)', async function() {
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

                await admin_setAdmin(user.id);

                const flags = await sdk.featureFlags.fetch(token);

                expect(flags.data.flags).toEqual({
                    test_flag: { active: true },
                    test_flag_two: { active: true },
                });
            });
        });
    };
}
