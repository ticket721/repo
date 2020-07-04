import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import { getSDKAndUser } from '../../../test/utils';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('search (GET /contracts)', function() {
            test('should recover artifacts', async function() {
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

                const contracts = await sdk.contracts.fetch();

                const contractArtifactsNames = [
                    'dev::IdentitiesMock',
                    'dev::Migrations',

                    'metamarketplace::MetaMarketplace_v0',
                    'metamarketplace::Migrations',

                    't721admin::Migrations',

                    't721admin::T721Admin',

                    't721controller::Migrations',

                    't721controller::T721Controller_v0',

                    't721token::Migrations',

                    't721token::T721Token',

                    'ticketforge::Migrations',

                    'ticketforge::TicketForge',
                ];

                expect(Object.keys(contracts.data.contracts)).toEqual(contractArtifactsNames);
            });
        });
    };
}
