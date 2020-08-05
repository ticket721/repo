import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import {
    admin_setAdmin,
    createEvent,
    createEventActionSet,
    createExpensiveEvent,
    createPaymentIntent,
    editEventActionSet,
    failWithCode,
    getPIFromCart,
    getSDKAndUser,
    getUser,
    validateCardPayment,
    waitForActionSet,
    waitForTickets,
} from '../../../test/utils';
import { ActionSetEntity } from '@lib/common/actionsets/entities/ActionSet.entity';
import { StatusCodes } from '@lib/common/utils/codes.value';
import { TicketEntity } from '@lib/common/tickets/entities/Ticket.entity';
import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';
import { DateEntity } from '@lib/common/dates/entities/Date.entity';
import { SortablePagedSearch } from '@lib/common/utils/SortablePagedSearch.type';
import { uuidEq } from '@common/global';
import { Stripe } from 'stripe';

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
