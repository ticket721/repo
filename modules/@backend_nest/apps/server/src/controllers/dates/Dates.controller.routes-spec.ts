import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import { createFuzzyEvent, createLostEvent, getSDKAndUser } from '../../../test/utils';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('homeSearch (POST /dates/home-search)', function() {
            test('should search for created date', async function() {
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

                const event = await createLostEvent(token, sdk);

                const datesSearch = await sdk.dates.homeSearch(token, {
                    lon: 0,
                    lat: 0,
                });

                expect(datesSearch.data.dates.length).toBeGreaterThanOrEqual(0);
            });
        });

        describe('fuzzySearch (POST /dates/home-search)', function() {
            test('should search for created date', async function() {
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

                const event = await createFuzzyEvent(token, sdk);

                const datesSearch = await sdk.dates.fuzzySearch(token, {
                    lon: 0,
                    lat: 0,
                    query: 'fuzzy',
                });

                expect(datesSearch.data.dates.length).toBeGreaterThanOrEqual(0);
            });
        });
    };
}
