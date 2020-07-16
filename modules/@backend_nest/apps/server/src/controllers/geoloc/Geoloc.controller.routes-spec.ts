import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import {
    createEvent,
    createEventActionSet,
    createPaymentIntent,
    editEventActionSet,
    failWithCode,
    getSDKAndUser,
    getUser,
    waitForActionSet,
    waitForTickets,
} from '../../../test/utils';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { Stripe } from 'stripe';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';
import { AxiosResponse } from 'axios';
import { ImagesUploadResponseDto } from '@app/server/controllers/images/dto/ImagesUploadResponse.dto';
import fs from 'fs';
import FormData from 'form-data';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';
import { uuidEq } from '@common/global';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('closestCity (POST /geoloc/closest-city)', function() {
            test('should properly recover closest city', async function() {
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

                const closestToParis = await sdk.geoloc.closestCity(token, {
                    lon: 2.3488,
                    lat: 48.8534,
                });

                expect(closestToParis.data).toEqual({
                    city: {
                        name: 'Paris',
                        nameAscii: 'Paris',
                        nameAdmin: 'Île-de-France',
                        country: 'France',
                        coord: { lat: 48.8667, lon: 2.3333 },
                        population: 9904000,
                        id: 1250015082,
                    },
                });
            });
        });

        describe('fuzzySearch (POST /geoloc/fuzzy-search)', function() {
            test('should properly execute a city fuzzy search with "Paris"', async function() {
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

                const fuzzyParis = await sdk.geoloc.fuzzySearch(token, {
                    query: 'Paris',
                    limit: 5,
                });

                expect(fuzzyParis.data.cities).toHaveLength(5);
                expect(fuzzyParis.data.cities.map(c => c.city.name)).toEqual([
                    'Paris',
                    'Pariset',
                    'Petit Paris',
                    'Paraisopolis',
                    'Paraiso',
                ]);
            });

            test('should properly execute a city fuzzy search with "Tours"', async function() {
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

                const fuzzyParis = await sdk.geoloc.fuzzySearch(token, {
                    query: 'Tours',
                    limit: 10,
                });

                expect(fuzzyParis.data.cities).toHaveLength(10);
                expect(fuzzyParis.data.cities.map(c => c.city.name)).toEqual([
                    'Tours',
                    'Tournon-sur-Rhone',
                    'Tourville-sur-Odon',
                    'Joue-les-Tours',
                    'Chambray-les-Tours',
                    'Touirssa',
                    'Touros',
                    'La Tour-de-Salvagny',
                    'Tournus',
                    'Touares',
                ]);
            });
        });
    };
}
