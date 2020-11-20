import { Sections, VenmasEntity } from '@lib/common/venmas/entities/Venmas.entity';
import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import { failWithCode, getSDKAndUser } from '../../../test/utils';
import { StatusCodes } from '@lib/common/utils/codes.value';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('create (POST /venmas/create)', function() {
            test('should create venmas entity', async function() {
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

                const sections: Sections = {
                    id: 'string',
                    type: 'string',
                    name: 'string',
                    description: 'string',
                    points: [
                        [1, 1],
                        [1, 2],
                        [2, 1],
                        [2, 2],
                    ],
                };
                const venmasEntity: VenmasEntity = {
                    id: 'abcd',
                    name: 'abcd',
                    owner: 'abcd',
                    map: 'abcd',
                    sections: sections,
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                };
                await sdk.venmas.create(token, venmasEntity);

                expect(
                    sdk.venmas.search({
                        id: {
                            $eq: 'abcd',
                        },
                    }),
                ).toEqual(venmasEntity);
            });

            test('should fail create venmas entity', async function() {
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

                await failWithCode(sdk.venmas.create(token, null), StatusCodes.InternalServerError);
            });
        });

        describe('update (POST /venmas/update/$id)', function() {
            test('should update venmas entity', async function() {
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

                const sections: Sections = {
                    id: 'string',
                    type: 'string',
                    name: 'string',
                    description: 'string',
                    points: [
                        [1, 1],
                        [1, 2],
                        [2, 1],
                        [2, 2],
                    ],
                };
                const venmasEntity: VenmasEntity = {
                    id: '1',
                    name: 'abcd',
                    owner: 'abcd',
                    map: 'abcd',
                    sections: sections,
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                };
                await sdk.venmas.update(token, venmasEntity, '1');

                expect(
                    sdk.venmas.search({
                        id: {
                            $eq: 'abcd',
                        },
                    }),
                ).toEqual(venmasEntity);
            });

            test('should fail create null venmas entity', async function() {
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

                await failWithCode(sdk.venmas.update(token, null, '1'), StatusCodes.InternalServerError);
            });

            test('should fail to update venmas entity without id', async function() {
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

                const sections: Sections = {
                    id: 'string',
                    type: 'string',
                    name: 'string',
                    description: 'string',
                    points: [
                        [1, 1],
                        [1, 2],
                        [2, 1],
                        [2, 2],
                    ],
                };
                const venmasEntity: VenmasEntity = {
                    id: '1',
                    name: 'abcd',
                    owner: 'abcd',
                    map: 'abcd',
                    sections: sections,
                    created_at: new Date(Date.now()),
                    updated_at: new Date(Date.now()),
                };

                await failWithCode(sdk.venmas.update(token, venmasEntity, 'NotExistingId'), StatusCodes.InternalServerError);
            });
        });
    };
}
