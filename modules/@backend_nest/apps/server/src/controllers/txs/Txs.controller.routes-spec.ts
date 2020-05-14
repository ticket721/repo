import { T721SDK } from '@common/sdk';
import { PasswordlessUserDto } from '@app/server/authentication/dto/PasswordlessUser.dto';
import { failWithCode, getSDKAndUser } from '../../../test/utils';
import { StatusCodes } from '@lib/common/utils/codes.value';

export default function(getCtx: () => { ready: Promise<void> }) {
    return function() {
        describe('subscribe (POST /txs/subscribe)', function() {
            test('should subscribe to tx', async function() {
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

                const artifacts = await sdk.contracts.fetch();

                const existingContract = artifacts.data.contracts['metamarketplace::MetaMarketplace_v0'];
                const transactionHash = existingContract.networks[2702].transactionHash;

                const subscribedTx = await sdk.txs.subscribe(token, {
                    transaction_hash: transactionHash,
                });

                expect(subscribedTx.data.tx).toMatchObject({
                    transaction_hash: transactionHash,
                });
            });

            test('should on invalid tx hash', async function() {
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

                const artifacts = await sdk.contracts.fetch();

                const existingContract = artifacts.data.contracts['metamarketplace::MetaMarketplace_v0'];
                const transactionHash = existingContract.networks[2702].transactionHash.slice(0, 10);

                await failWithCode(
                    sdk.txs.subscribe(token, {
                        transaction_hash: transactionHash,
                    }),
                    StatusCodes.BadRequest,
                );
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

                const artifacts = await sdk.contracts.fetch();

                const existingContract = artifacts.data.contracts['metamarketplace::MetaMarketplace_v0'];
                const transactionHash = existingContract.networks[2702].transactionHash;

                await failWithCode(
                    sdk.txs.subscribe(null, {
                        transaction_hash: transactionHash,
                    }),
                    StatusCodes.Unauthorized,
                );
            });
        });

        describe('search (POST /txs/search)', function() {
            test('should search for transactions', async function() {
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

                const artifacts = await sdk.contracts.fetch();

                const existingContract = artifacts.data.contracts['metamarketplace::MetaMarketplace_v0'];
                const transactionHash = existingContract.networks[2702].transactionHash;

                const subscribedTx = await sdk.txs.subscribe(token, {
                    transaction_hash: transactionHash,
                });

                const searchedEvents = await sdk.txs.search(token, {
                    transaction_hash: {
                        $eq: transactionHash,
                    },
                });

                expect(searchedEvents.data.txs.length).toEqual(1);
            });

            test('should search from unauthenticated', async function() {
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

                const artifacts = await sdk.contracts.fetch();

                const existingContract = artifacts.data.contracts['metamarketplace::MetaMarketplace_v0'];
                const transactionHash = existingContract.networks[2702].transactionHash;

                await sdk.txs.subscribe(token, {
                    transaction_hash: transactionHash,
                });

                const searchedEvents = await sdk.txs.search(null, {
                    transaction_hash: {
                        $eq: transactionHash,
                    },
                });

                expect(searchedEvents.data.txs.length).toEqual(1);
            });
        });

        describe('infos (GET /txs/infos)', function() {
            test('should recover relayer info', async function() {
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

                const info = await sdk.txs.infos();

                expect(info.data.relayer).toMatch(/^0x[0-9a-fA-F]{40}$/);
            });
        });
    };
}
