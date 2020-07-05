import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import {
    createEvent,
    createEventActionSet,
    createFreeEventActionSet,
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

                console.log(closestToParis.data);
            });
        });
    };
}
