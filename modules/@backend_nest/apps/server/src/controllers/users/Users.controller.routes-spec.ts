import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import { failWithCode, getSDKAndInvalidUser, getSDKAndUser } from '../../../test/utils';
import { StatusCodes } from '@lib/common/utils/codes.value';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('setDeviceAddress (PUT /users/device-address)', function() {
            test('should properly edit device address', async function() {
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

                const myInfos = await sdk.users.me(token);
                const deviceAddress = '0x04668Ec2f57cC15c381b461B9fEDaB5D451c8F7F';

                expect(myInfos.data.user.device_address).toEqual(null);

                await sdk.users.setDeviceAddress(token, {
                    deviceAddress,
                });

                const myNewInfos = await sdk.users.me(token);

                expect(myNewInfos.data.user.device_address).toEqual(deviceAddress);
            });
        });
        describe('me (GET /users/me)', function() {
            test('should recover own user infos', async function() {
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

                const myInfos = await sdk.users.me(token);

                expect(myInfos.data.user.id).toEqual(user.id);
                expect((myInfos as any).data.user.password).toEqual(undefined);
            });

            test('should recover own user infos, even if account not valid', async function() {
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
                } = await getSDKAndInvalidUser(getCtx);

                const myInfos = await sdk.users.me(token);

                expect(myInfos.data.user.id).toEqual(user.id);
                expect(user.valid).toEqual(false);
                expect(myInfos.data.user.valid).toEqual(false);
                expect((myInfos as any).data.user.password).toEqual(undefined);
            });

            test('should fail on unauthenticated user', async function() {
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

                await failWithCode(sdk.users.me(null), StatusCodes.Unauthorized);
            });
        });
    };
}
