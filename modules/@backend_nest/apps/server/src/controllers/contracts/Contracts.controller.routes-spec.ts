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
                    'dev::IdentityMock',
                    'dev::Migrations',
                    'metamarketplace::Address',
                    'metamarketplace::BytesUtil_v0',
                    'metamarketplace::Counters',
                    'metamarketplace::DaiMock_v0',
                    'metamarketplace::ERC165',
                    'metamarketplace::ERC20',
                    'metamarketplace::ERC20Detailed',
                    'metamarketplace::ERC20Mock_v0',
                    'metamarketplace::ERC721',
                    'metamarketplace::ERC721Enumerable',
                    'metamarketplace::ERC721Mock_v0',
                    'metamarketplace::IERC165',
                    'metamarketplace::IERC20',
                    'metamarketplace::IERC721',
                    'metamarketplace::IERC721Enumerable',
                    'metamarketplace::IERC721Receiver',
                    'metamarketplace::IRefractWallet_v0',
                    'metamarketplace::IT721Controller_v0',
                    'metamarketplace::MetaMarketplaceDomain_v0',
                    'metamarketplace::MetaMarketplace_v0',
                    'metamarketplace::Migrations',
                    'metamarketplace::SafeMath',
                    'metamarketplace::SmartWalletMock_v0',
                    'metamarketplace::T721ControllerMock_v0',
                    't721admin::Dummy',
                    't721admin::ERC20',
                    't721admin::ERC20Detailed',
                    't721admin::IERC20',
                    't721admin::IT721Token',
                    't721admin::Migrations',
                    't721admin::Ownable',
                    't721admin::SafeMath',
                    't721admin::SigUtil_v0',
                    't721admin::T721Admin',
                    't721admin::T721AdminDomain',
                    't721admin::T721TokenMock',
                    't721controller::Address',
                    't721controller::BytesUtil_v0',
                    't721controller::Counters',
                    't721controller::DaiMock_v0',
                    't721controller::ERC165',
                    't721controller::ERC20',
                    't721controller::ERC20Detailed',
                    't721controller::ERC20Mock_v0',
                    't721controller::ERC721',
                    't721controller::ERC721Enumerable',
                    't721controller::ERC721Mock_v0',
                    't721controller::IERC165',
                    't721controller::IERC20',
                    't721controller::IERC721',
                    't721controller::IERC721Enumerable',
                    't721controller::IERC721Receiver',
                    't721controller::ITicketForge_v0',
                    't721controller::ITokenUriProvider',
                    't721controller::Migrations',
                    't721controller::SafeMath',
                    't721controller::SigUtil_v0',
                    't721controller::T721ControllerDomain_v0',
                    't721controller::T721Controller_v0',
                    't721token::ERC20',
                    't721token::ERC20Detailed',
                    't721token::IERC20',
                    't721token::IT721Token',
                    't721token::Migrations',
                    't721token::Ownable',
                    't721token::SafeMath',
                    't721token::T721Token',
                    'ticketforge::Address',
                    'ticketforge::Counters',
                    'ticketforge::ERC165',
                    'ticketforge::ERC721',
                    'ticketforge::ERC721Enumerable',
                    'ticketforge::IERC165',
                    'ticketforge::IERC721',
                    'ticketforge::IERC721Enumerable',
                    'ticketforge::IERC721Receiver',
                    'ticketforge::ITokenUriProvider',
                    'ticketforge::InvalidERC721Receiver',
                    'ticketforge::Migrations',
                    'ticketforge::SafeMath',
                    'ticketforge::TicketForge',
                    'ticketforge::TokenUriProviderExample',
                    'ticketforge::ValidERC721Receiver',
                ];

                expect(Object.keys(contracts.data.contracts)).toEqual(contractArtifactsNames);
            });
        });
    };
}
