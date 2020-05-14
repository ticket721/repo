import {
    MintingTransactionConnector,
    StripeTokenMinterDosojin,
    TokenMinterOperation,
    TokenMinterTx,
} from '@app/worker/dosojinrunner/circuits/tokenminter/dosojins/StripeTokenMinter.dosojin';
import { anything, capture, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { T721AdminService } from '@lib/common/contracts/T721Admin.service';
import { UsersService } from '@lib/common/users/Users.service';
import { TxsService } from '@lib/common/txs/Txs.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { BN, Gem, OperationStatusNames, TransferConnectorStatusNames } from 'dosojin';
import { TokenMinterArguments } from '@app/worker/dosojinrunner/circuits/tokenminter/TokenMinter.circuit';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { TxEntity } from '@lib/common/txs/entities/Tx.entity';
import { T721TokenService } from '@lib/common/contracts/T721Token.service';
import Stripe from 'stripe';
import { AuthorizationEntity } from '@lib/common/authorizations/entities/Authorization.entity';

describe('StripeTokenMinter Dosojin', function() {
    describe('TokenMinterOperation', function() {
        const context: {
            tokenMinterOperation: TokenMinterOperation;
            stripeTokenMinterDosojinMock: StripeTokenMinterDosojin;
            t721AdminServiceMock: T721AdminService;
            t721TokenServiceMock: T721TokenService;
            usersServiceMock: UsersService;
            txsServiceMock: TxsService;
        } = {
            tokenMinterOperation: null,
            stripeTokenMinterDosojinMock: null,
            t721AdminServiceMock: null,
            t721TokenServiceMock: null,
            usersServiceMock: null,
            txsServiceMock: null,
        };

        beforeEach(async function() {
            context.stripeTokenMinterDosojinMock = mock(StripeTokenMinterDosojin);
            context.t721AdminServiceMock = mock(T721AdminService);
            context.t721TokenServiceMock = mock(T721TokenService);
            context.usersServiceMock = mock(UsersService);
            context.txsServiceMock = mock(TxsService);
            when(context.stripeTokenMinterDosojinMock.name).thenReturn('StripeTokenMinter');

            context.tokenMinterOperation = new TokenMinterOperation(
                'TokenMinterOperation',
                instance(context.stripeTokenMinterDosojinMock),
                instance(context.t721AdminServiceMock),
                instance(context.t721TokenServiceMock),
                instance(context.usersServiceMock),
                instance(context.txsServiceMock),
            );
        });

        describe('run/dryRun', function() {
            it('should properly run dosojin', async function() {
                // DECLARE
                const name = 'StripeTokenMinter';
                const userId = 'userid';
                const address = '0xC32654455D666614215E207834BC9F4A0281E4d2';
                const sender = '0xDa022Ca91DF99413e8CB0CAAB4d1CbA4e9018bea';
                const minter = '0x108Fb8C18DD3Ce3A0eC957533A63ECE39750e7d2';
                const adminAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
                const user: Partial<UserDto> = {
                    id: userId,
                    address,
                };
                const amount = '300';
                const authorization: Partial<AuthorizationEntity> = {
                    id: 'authorization_id',
                    signature: '0xsignature',
                };
                const code = '1234';
                const gemMock = mock(Gem);
                const gemState: TokenMinterArguments = {
                    paymentIntentId: 'pi_abcd',
                    currency: 'eur',
                    amount: 300,
                    userId,
                    regionRestrictions: {
                        FR: {
                            fix_fee: 25,
                            variable_fee: 1.4,
                        },
                    },
                    methodsRestrictions: {
                        card: {
                            country_resolution_path: 'country',
                        },
                    },
                };
                const gemPayload = {
                    values: {
                        fiat_eur: new BN(300),
                    },
                    costs: [],
                };
                const t721adminInstance = {
                    _address: adminAddress,
                    methods: {
                        redeemTokens: () => ({
                            encodeABI: () => '0xencoded',
                        }),
                    },
                };
                const gasLimit = '12345';
                const gasPrice = '12345';
                const txHash = '0x12cf175d36b70cc0f5e545fa6f518e29426f7c0ddf8254e9fa036038b100bfb3';
                const tx: Partial<TxEntity> = {
                    transaction_hash: txHash,
                };

                // MOCK
                when(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).thenReturn(
                    gemState,
                );
                when(context.usersServiceMock.findById(userId)).thenResolve({
                    response: user as UserDto,
                    error: null,
                });
                when(gemMock.gemPayload).thenReturn(gemPayload);
                when(context.t721TokenServiceMock.generateAuthorization(address, amount)).thenResolve({
                    error: null,
                    response: [authorization as AuthorizationEntity, code, sender, minter],
                });
                when(context.t721AdminServiceMock.get()).thenResolve(t721adminInstance);
                when(context.txsServiceMock.estimateGasLimit(sender, adminAddress, '0xencoded')).thenResolve({
                    error: null,
                    response: gasLimit,
                });
                when(context.txsServiceMock.estimateGasPrice(gasLimit)).thenResolve({
                    error: null,
                    response: gasPrice,
                });
                when(context.txsServiceMock.sendRawTransaction(sender, adminAddress, '0', '0xencoded')).thenResolve({
                    error: null,
                    response: tx as TxEntity,
                });
                when(gemMock.setOperationStatus(OperationStatusNames.OperationComplete)).thenReturn(instance(gemMock));

                // TRIGGER
                const res = await context.tokenMinterOperation.run(instance(gemMock));

                // CHECK RETURNs
                expect(res).toEqual(instance(gemMock));

                // CHECK CALLS
                verify(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).once();
                verify(context.usersServiceMock.findById(userId)).once();
                verify(gemMock.gemPayload).once();
                verify(context.t721TokenServiceMock.generateAuthorization(address, amount)).once();
                verify(context.t721AdminServiceMock.get()).once();
                verify(context.txsServiceMock.estimateGasLimit(sender, adminAddress, '0xencoded')).once();
                verify(context.txsServiceMock.estimateGasPrice(gasLimit)).once();
                verify(context.txsServiceMock.sendRawTransaction(sender, adminAddress, '0', '0xencoded')).once();
                verify(gemMock.setOperationStatus(OperationStatusNames.OperationComplete)).once();
            });

            it('should fail on invalid user', async function() {
                // DECLARE
                const userId = 'userid';
                const address = '0xC32654455D666614215E207834BC9F4A0281E4d2';
                const sender = '0xDa022Ca91DF99413e8CB0CAAB4d1CbA4e9018bea';
                const minter = '0x108Fb8C18DD3Ce3A0eC957533A63ECE39750e7d2';
                const adminAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
                const user: Partial<UserDto> = {
                    id: userId,
                    address,
                    valid: false,
                };
                const amount = '300';
                const authorization: Partial<AuthorizationEntity> = {
                    id: 'authorization_id',
                    signature: '0xsignature',
                };
                const code = '1234';
                const gemMock = mock(Gem);
                const gemState: TokenMinterArguments = {
                    paymentIntentId: 'pi_abcd',
                    currency: 'eur',
                    amount: 300,
                    userId,
                    regionRestrictions: {
                        FR: {
                            fix_fee: 25,
                            variable_fee: 1.4,
                        },
                    },
                    methodsRestrictions: {
                        card: {
                            country_resolution_path: 'country',
                        },
                    },
                };
                const gemPayload = {
                    values: {
                        fiat_eur: new BN(300),
                    },
                    costs: [],
                };
                const t721adminInstance = {
                    _address: adminAddress,
                    methods: {
                        redeemTokens: () => ({
                            encodeABI: () => '0xencoded',
                        }),
                    },
                };
                const gasLimit = '12345';
                const gasPrice = '12345';
                const txHash = '0x12cf175d36b70cc0f5e545fa6f518e29426f7c0ddf8254e9fa036038b100bfb3';
                const tx: Partial<TxEntity> = {
                    transaction_hash: txHash,
                };

                // MOCK
                when(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).thenReturn(
                    gemState,
                );
                when(context.usersServiceMock.findById(userId)).thenResolve({
                    response: user as UserDto,
                    error: null,
                });

                // TRIGGER
                const res = await context.tokenMinterOperation.run(instance(gemMock));

                // CHECK RETURNs
                expect(res).toEqual(instance(gemMock));

                // CHECK CALLS
                verify(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).once();
                verify(context.usersServiceMock.findById(userId)).once();
            });

            it('should fail on user fetch error', async function() {
                // DECLARE
                const userId = 'userid';
                const gemMock = mock(Gem);
                const gemState: TokenMinterArguments = {
                    paymentIntentId: 'pi_abcd',
                    currency: 'eur',
                    amount: 300,
                    userId,
                    regionRestrictions: {
                        FR: {
                            fix_fee: 25,
                            variable_fee: 1.4,
                        },
                    },
                    methodsRestrictions: {
                        card: {
                            country_resolution_path: 'country',
                        },
                    },
                };

                // MOCK
                when(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).thenReturn(
                    gemState,
                );
                when(context.usersServiceMock.findById(userId)).thenResolve({
                    response: null,
                    error: 'unexpected_error',
                });
                when(
                    gemMock.error(
                        instance(context.stripeTokenMinterDosojinMock),
                        `An error occured while fetching the credited user`,
                    ),
                ).thenReturn(instance(gemMock));

                // TRIGGER
                const res = await context.tokenMinterOperation.run(instance(gemMock));

                // CHECK RETURNs
                expect(res).toEqual(instance(gemMock));

                // CHECK CALLS
                verify(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).once();
                verify(context.usersServiceMock.findById(userId)).once();
                verify(
                    gemMock.error(
                        instance(context.stripeTokenMinterDosojinMock),
                        `An error occured while fetching the credited user`,
                    ),
                ).once();
            });

            it('should fail on user not found', async function() {
                // DECLARE
                const name = 'StripeTokenMinter';
                const userId = 'userid';
                const address = '0xC32654455D666614215E207834BC9F4A0281E4d2';
                const sender = '0xDa022Ca91DF99413e8CB0CAAB4d1CbA4e9018bea';
                const minter = '0x108Fb8C18DD3Ce3A0eC957533A63ECE39750e7d2';
                const adminAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
                const user: Partial<UserDto> = {
                    id: userId,
                    address,
                };
                const amount = '300';
                const authorization: Partial<AuthorizationEntity> = {
                    id: 'authorization_id',
                    signature: '0xsignature',
                };
                const code = '1234';
                const gemMock = mock(Gem);
                const gemState: TokenMinterArguments = {
                    paymentIntentId: 'pi_abcd',
                    currency: 'eur',
                    amount: 300,
                    userId,
                    regionRestrictions: {
                        FR: {
                            fix_fee: 25,
                            variable_fee: 1.4,
                        },
                    },
                    methodsRestrictions: {
                        card: {
                            country_resolution_path: 'country',
                        },
                    },
                };
                const gemPayload = {
                    values: {
                        fiat_eur: new BN(300),
                    },
                    costs: [],
                };
                const t721adminInstance = {
                    _address: adminAddress,
                    methods: {
                        redeemTokens: () => ({
                            encodeABI: () => '0xencoded',
                        }),
                    },
                };
                const gasLimit = '12345';
                const gasPrice = '12345';
                const txHash = '0x12cf175d36b70cc0f5e545fa6f518e29426f7c0ddf8254e9fa036038b100bfb3';
                const tx: Partial<TxEntity> = {
                    transaction_hash: txHash,
                };

                // MOCK
                when(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).thenReturn(
                    gemState,
                );
                when(context.usersServiceMock.findById(userId)).thenResolve({
                    response: null,
                    error: null,
                });
                when(
                    gemMock.error(instance(context.stripeTokenMinterDosojinMock), `Cannot find user to credit`),
                ).thenReturn(instance(gemMock));

                // TRIGGER
                const res = await context.tokenMinterOperation.run(instance(gemMock));

                // CHECK RETURNs
                expect(res).toEqual(instance(gemMock));

                // CHECK CALLS
                verify(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).once();
                verify(context.usersServiceMock.findById(userId)).once();
                verify(
                    gemMock.error(instance(context.stripeTokenMinterDosojinMock), `Cannot find user to credit`),
                ).once();
            });

            it('should fail on authorization creation error', async function() {
                // DECLARE
                const userId = 'userid';
                const address = '0xC32654455D666614215E207834BC9F4A0281E4d2';
                const adminAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
                const user: Partial<UserDto> = {
                    id: userId,
                    address,
                };
                const amount = '300';
                const gemMock = mock(Gem);
                const gemState: TokenMinterArguments = {
                    paymentIntentId: 'pi_abcd',
                    currency: 'eur',
                    amount: 300,
                    userId,
                    regionRestrictions: {
                        FR: {
                            fix_fee: 25,
                            variable_fee: 1.4,
                        },
                    },
                    methodsRestrictions: {
                        card: {
                            country_resolution_path: 'country',
                        },
                    },
                };
                const gemPayload = {
                    values: {
                        fiat_eur: new BN(300),
                    },
                    costs: [],
                };

                // MOCK
                when(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).thenReturn(
                    gemState,
                );
                when(context.usersServiceMock.findById(userId)).thenResolve({
                    response: user as UserDto,
                    error: null,
                });
                when(gemMock.gemPayload).thenReturn(gemPayload);
                when(context.t721TokenServiceMock.generateAuthorization(address, amount)).thenResolve({
                    error: 'unexpected_error',
                    response: null,
                });
                when(
                    gemMock.error(
                        instance(context.stripeTokenMinterDosojinMock),
                        `Cannot generate authorization: unexpected_error`,
                    ),
                ).thenReturn(instance(gemMock));

                // TRIGGER
                const res = await context.tokenMinterOperation.run(instance(gemMock));

                // CHECK RETURNs
                expect(res).toEqual(instance(gemMock));

                // CHECK CALLS
                verify(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).once();
                verify(context.usersServiceMock.findById(userId)).once();
                verify(gemMock.gemPayload).once();
                verify(context.t721TokenServiceMock.generateAuthorization(address, amount)).once();
                verify(
                    gemMock.error(
                        instance(context.stripeTokenMinterDosojinMock),
                        `Cannot generate authorization: unexpected_error`,
                    ),
                ).once();
            });

            it('should fail on gas limit estimation error', async function() {
                // DECLARE
                const name = 'StripeTokenMinter';
                const userId = 'userid';
                const address = '0xC32654455D666614215E207834BC9F4A0281E4d2';
                const sender = '0xDa022Ca91DF99413e8CB0CAAB4d1CbA4e9018bea';
                const minter = '0x108Fb8C18DD3Ce3A0eC957533A63ECE39750e7d2';
                const adminAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
                const user: Partial<UserDto> = {
                    id: userId,
                    address,
                };
                const amount = '300';
                const authorization: Partial<AuthorizationEntity> = {
                    id: 'authorization_id',
                    signature: '0xsignature',
                };
                const code = '1234';
                const gemMock = mock(Gem);
                const gemState: TokenMinterArguments = {
                    paymentIntentId: 'pi_abcd',
                    currency: 'eur',
                    amount: 300,
                    userId,
                    regionRestrictions: {
                        FR: {
                            fix_fee: 25,
                            variable_fee: 1.4,
                        },
                    },
                    methodsRestrictions: {
                        card: {
                            country_resolution_path: 'country',
                        },
                    },
                };
                const gemPayload = {
                    values: {
                        fiat_eur: new BN(300),
                    },
                    costs: [],
                };
                const t721adminInstance = {
                    _address: adminAddress,
                    methods: {
                        redeemTokens: () => ({
                            encodeABI: () => '0xencoded',
                        }),
                    },
                };
                const gasLimit = '12345';
                const gasPrice = '12345';
                const txHash = '0x12cf175d36b70cc0f5e545fa6f518e29426f7c0ddf8254e9fa036038b100bfb3';
                const tx: Partial<TxEntity> = {
                    transaction_hash: txHash,
                };

                // MOCK
                when(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).thenReturn(
                    gemState,
                );
                when(context.usersServiceMock.findById(userId)).thenResolve({
                    response: user as UserDto,
                    error: null,
                });
                when(gemMock.gemPayload).thenReturn(gemPayload);
                when(context.t721TokenServiceMock.generateAuthorization(address, amount)).thenResolve({
                    error: null,
                    response: [authorization as AuthorizationEntity, code, sender, minter],
                });
                when(context.t721AdminServiceMock.get()).thenResolve(t721adminInstance);
                when(context.txsServiceMock.estimateGasLimit(sender, adminAddress, '0xencoded')).thenResolve({
                    error: 'unexpected_error',
                    response: null,
                });
                when(
                    gemMock.error(
                        instance(context.stripeTokenMinterDosojinMock),
                        `Cannot estimate gas limit: unexpected_error`,
                    ),
                ).thenReturn(instance(gemMock));

                // TRIGGER
                const res = await context.tokenMinterOperation.run(instance(gemMock));

                // CHECK RETURNs
                expect(res).toEqual(instance(gemMock));

                // CHECK CALLS
                verify(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).once();
                verify(context.usersServiceMock.findById(userId)).once();
                verify(gemMock.gemPayload).once();
                verify(context.t721TokenServiceMock.generateAuthorization(address, amount)).once();
                verify(context.t721AdminServiceMock.get()).once();
                verify(context.txsServiceMock.estimateGasLimit(sender, adminAddress, '0xencoded')).once();
                verify(
                    gemMock.error(
                        instance(context.stripeTokenMinterDosojinMock),
                        `Cannot estimate gas limit: unexpected_error`,
                    ),
                ).once();
            });

            it('should fail on gas price estimation error', async function() {
                // DECLARE
                const name = 'StripeTokenMinter';
                const userId = 'userid';
                const address = '0xC32654455D666614215E207834BC9F4A0281E4d2';
                const sender = '0xDa022Ca91DF99413e8CB0CAAB4d1CbA4e9018bea';
                const minter = '0x108Fb8C18DD3Ce3A0eC957533A63ECE39750e7d2';
                const adminAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
                const user: Partial<UserDto> = {
                    id: userId,
                    address,
                };
                const amount = '300';
                const authorization: Partial<AuthorizationEntity> = {
                    id: 'authorization_id',
                    signature: '0xsignature',
                };
                const code = '1234';
                const gemMock = mock(Gem);
                const gemState: TokenMinterArguments = {
                    paymentIntentId: 'pi_abcd',
                    currency: 'eur',
                    amount: 300,
                    userId,
                    regionRestrictions: {
                        FR: {
                            fix_fee: 25,
                            variable_fee: 1.4,
                        },
                    },
                    methodsRestrictions: {
                        card: {
                            country_resolution_path: 'country',
                        },
                    },
                };
                const gemPayload = {
                    values: {
                        fiat_eur: new BN(300),
                    },
                    costs: [],
                };
                const t721adminInstance = {
                    _address: adminAddress,
                    methods: {
                        redeemTokens: () => ({
                            encodeABI: () => '0xencoded',
                        }),
                    },
                };
                const gasLimit = '12345';
                const gasPrice = '12345';
                const txHash = '0x12cf175d36b70cc0f5e545fa6f518e29426f7c0ddf8254e9fa036038b100bfb3';
                const tx: Partial<TxEntity> = {
                    transaction_hash: txHash,
                };

                // MOCK
                when(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).thenReturn(
                    gemState,
                );
                when(context.usersServiceMock.findById(userId)).thenResolve({
                    response: user as UserDto,
                    error: null,
                });
                when(gemMock.gemPayload).thenReturn(gemPayload);
                when(context.t721TokenServiceMock.generateAuthorization(address, amount)).thenResolve({
                    error: null,
                    response: [authorization as AuthorizationEntity, code, sender, minter],
                });
                when(context.t721AdminServiceMock.get()).thenResolve(t721adminInstance);
                when(context.txsServiceMock.estimateGasLimit(sender, adminAddress, '0xencoded')).thenResolve({
                    error: null,
                    response: gasLimit,
                });
                when(context.txsServiceMock.estimateGasPrice(gasLimit)).thenResolve({
                    error: 'unexpected_error',
                    response: null,
                });
                when(
                    gemMock.error(
                        instance(context.stripeTokenMinterDosojinMock),
                        `Cannot estimate gas price: unexpected_error`,
                    ),
                ).thenReturn(instance(gemMock));

                // TRIGGER
                const res = await context.tokenMinterOperation.run(instance(gemMock));

                // CHECK RETURNs
                expect(res).toEqual(instance(gemMock));

                // CHECK CALLS
                verify(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).once();
                verify(context.usersServiceMock.findById(userId)).once();
                verify(gemMock.gemPayload).once();
                verify(context.t721TokenServiceMock.generateAuthorization(address, amount)).once();
                verify(context.t721AdminServiceMock.get()).once();
                verify(context.txsServiceMock.estimateGasLimit(sender, adminAddress, '0xencoded')).once();
                verify(context.txsServiceMock.estimateGasPrice(gasLimit)).once();
                verify(
                    gemMock.error(
                        instance(context.stripeTokenMinterDosojinMock),
                        `Cannot estimate gas price: unexpected_error`,
                    ),
                ).once();
            });

            it('should fail on tx broadcast error', async function() {
                // DECLARE
                const userId = 'userid';
                const address = '0xC32654455D666614215E207834BC9F4A0281E4d2';
                const sender = '0xDa022Ca91DF99413e8CB0CAAB4d1CbA4e9018bea';
                const minter = '0x108Fb8C18DD3Ce3A0eC957533A63ECE39750e7d2';
                const adminAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
                const user: Partial<UserDto> = {
                    id: userId,
                    address,
                };
                const amount = '300';
                const authorization: Partial<AuthorizationEntity> = {
                    id: 'authorization_id',
                    signature: '0xsignature',
                };
                const code = '1234';
                const gemMock = mock(Gem);
                const gemState: TokenMinterArguments = {
                    paymentIntentId: 'pi_abcd',
                    currency: 'eur',
                    amount: 300,
                    userId,
                    regionRestrictions: {
                        FR: {
                            fix_fee: 25,
                            variable_fee: 1.4,
                        },
                    },
                    methodsRestrictions: {
                        card: {
                            country_resolution_path: 'country',
                        },
                    },
                };
                const gemPayload = {
                    values: {
                        fiat_eur: new BN(300),
                    },
                    costs: [],
                };
                const t721adminInstance = {
                    _address: adminAddress,
                    methods: {
                        redeemTokens: () => ({
                            encodeABI: () => '0xencoded',
                        }),
                    },
                };
                const gasLimit = '12345';
                const gasPrice = '12345';
                const txHash = '0x12cf175d36b70cc0f5e545fa6f518e29426f7c0ddf8254e9fa036038b100bfb3';
                const tx: Partial<TxEntity> = {
                    transaction_hash: txHash,
                };

                // MOCK
                when(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).thenReturn(
                    gemState,
                );
                when(context.usersServiceMock.findById(userId)).thenResolve({
                    response: user as UserDto,
                    error: null,
                });
                when(gemMock.gemPayload).thenReturn(gemPayload);
                when(context.t721TokenServiceMock.generateAuthorization(address, amount)).thenResolve({
                    error: null,
                    response: [authorization as AuthorizationEntity, code, sender, minter],
                });
                when(context.t721AdminServiceMock.get()).thenResolve(t721adminInstance);
                when(context.txsServiceMock.estimateGasLimit(sender, adminAddress, '0xencoded')).thenResolve({
                    error: null,
                    response: gasLimit,
                });
                when(context.txsServiceMock.estimateGasPrice(gasLimit)).thenResolve({
                    error: null,
                    response: gasPrice,
                });
                when(context.txsServiceMock.sendRawTransaction(sender, adminAddress, '0', '0xencoded')).thenResolve({
                    error: 'unexpected_error',
                    response: null,
                });
                when(
                    gemMock.error(
                        instance(context.stripeTokenMinterDosojinMock),
                        `An error occured while trying to create transaction: unexpected_error`,
                    ),
                ).thenReturn(instance(gemMock));

                // TRIGGER
                const res = await context.tokenMinterOperation.run(instance(gemMock));

                // CHECK RETURNs
                expect(res).toEqual(instance(gemMock));

                // CHECK CALLS
                verify(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).once();
                verify(context.usersServiceMock.findById(userId)).once();
                verify(gemMock.gemPayload).once();
                verify(context.t721TokenServiceMock.generateAuthorization(address, amount)).once();
                verify(context.t721AdminServiceMock.get()).once();
                verify(context.txsServiceMock.estimateGasLimit(sender, adminAddress, '0xencoded')).once();
                verify(context.txsServiceMock.estimateGasPrice(gasLimit)).once();
                verify(context.txsServiceMock.sendRawTransaction(sender, adminAddress, '0', '0xencoded')).once();
                verify(
                    gemMock.error(
                        instance(context.stripeTokenMinterDosojinMock),
                        `An error occured while trying to create transaction: unexpected_error`,
                    ),
                ).once();
            });
        });

        describe('scopes', function() {
            it('should recover the scopes', async function() {
                const scopes = await context.tokenMinterOperation.scopes(null);

                expect(scopes).toEqual(['fiat_eur']);
            });
        });
    });

    describe('MintingTransactionConnector', function() {
        const context: {
            mintingTransactionConnector: MintingTransactionConnector;
            stripeTokenMinterDosojinMock: StripeTokenMinterDosojin;
            t721TokenServiceMock: T721TokenService;
            usersServiceMock: UsersService;
            txsServiceMock: TxsService;
            configServiceMock: ConfigService;
        } = {
            mintingTransactionConnector: null,
            stripeTokenMinterDosojinMock: null,
            t721TokenServiceMock: null,
            usersServiceMock: null,
            txsServiceMock: null,
            configServiceMock: null,
        };

        beforeEach(async function() {
            context.stripeTokenMinterDosojinMock = mock(StripeTokenMinterDosojin);
            context.t721TokenServiceMock = mock(T721TokenService);
            context.usersServiceMock = mock(UsersService);
            context.txsServiceMock = mock(TxsService);
            context.configServiceMock = mock(ConfigService);
            when(context.stripeTokenMinterDosojinMock.name).thenReturn('StripeTokenMinter');

            context.mintingTransactionConnector = new MintingTransactionConnector(
                'MintingTransactionConnector',
                instance(context.stripeTokenMinterDosojinMock),
                instance(context.txsServiceMock),
                instance(context.t721TokenServiceMock),
                instance(context.usersServiceMock),
            );
        });

        describe('run/dryRun', function() {
            it('should check and validate transaction', async function() {
                const txHash = '0x1694f8213153d1c803b81ec576341075dfdad7f8b7abf6860568e0b807b2bc92';

                const transaction: TxEntity = ({
                    transaction_hash: txHash,
                    block_number: 1,
                    confirmed: true,
                    status: true,
                    transaction_index: 0,
                } as any) as TxEntity;

                const user: UserDto = ({
                    id: 'userid',
                    address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
                } as any) as UserDto;

                const gemState: TokenMinterArguments & TokenMinterTx = {
                    paymentIntentId: 'pi_abcd',
                    currency: 'eur',
                    amount: 10000,
                    userId: user.id,
                    regionRestrictions: {
                        FR: {
                            fix_fee: 25,
                            variable_fee: 1.4,
                        },
                    },
                    methodsRestrictions: {
                        card: {
                            country_resolution_path: 'country',
                        },
                    },
                    txHash,
                };

                const gemMock = mock(Gem);
                when(gemMock.gemPayload).thenReturn({
                    values: {
                        fiat_eur: new BN(10000),
                    },
                    costs: [],
                });
                when(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).thenReturn(
                    gemState,
                );
                when(gemMock.exchange(`fiat_eur`, `crypto_t721t`, deepEqual(new BN(10000)), 1)).thenReturn(
                    instance(gemMock),
                );

                const t721tokenInstance = {
                    getPastEvents: async () => [
                        {
                            transactionHash: txHash,
                            transactionIndex: 0,
                        },
                    ],
                };

                when(
                    context.txsServiceMock.search(
                        deepEqual({
                            transaction_hash: txHash,
                        }),
                    ),
                ).thenResolve({
                    error: null,
                    response: [transaction],
                });

                when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);

                when(context.usersServiceMock.findById(user.id)).thenResolve({
                    error: null,
                    response: user,
                });

                await context.mintingTransactionConnector.run(instance(gemMock));
                await context.mintingTransactionConnector.dryRun(instance(gemMock));

                verify(gemMock.gemPayload).times(4);
                verify(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).twice();
                verify(gemMock.exchange(`fiat_eur`, `crypto_t721t`, deepEqual(new BN(10000)), 1)).twice();
                verify(
                    context.txsServiceMock.search(
                        deepEqual({
                            transaction_hash: txHash,
                        }),
                    ),
                ).twice();
                verify(context.t721TokenServiceMock.get()).twice();
                verify(context.usersServiceMock.findById(user.id)).twice();
                verify(gemMock.setConnectorStatus(TransferConnectorStatusNames.TransferComplete)).twice();
            });

            it('should check unconfirmed', async function() {
                const txHash = '0x1694f8213153d1c803b81ec576341075dfdad7f8b7abf6860568e0b807b2bc92';

                const transaction: TxEntity = ({
                    transaction_hash: txHash,
                    block_number: 1,
                    confirmed: false,
                    status: true,
                    transaction_index: 0,
                } as any) as TxEntity;

                const user: UserDto = ({
                    id: 'userid',
                    address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
                } as any) as UserDto;

                const gemState: TokenMinterArguments & TokenMinterTx = {
                    paymentIntentId: 'pi_abcd',
                    currency: 'eur',
                    amount: 10000,
                    userId: user.id,
                    regionRestrictions: {
                        FR: {
                            fix_fee: 25,
                            variable_fee: 1.4,
                        },
                    },
                    methodsRestrictions: {
                        card: {
                            country_resolution_path: 'country',
                        },
                    },
                    txHash,
                };

                const gemMock = mock(Gem);
                when(gemMock.gemPayload).thenReturn({
                    values: {
                        fiat_eur: new BN(10000),
                    },
                    costs: [],
                });
                when(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).thenReturn(
                    gemState,
                );

                when(
                    context.txsServiceMock.search(
                        deepEqual({
                            transaction_hash: txHash,
                        }),
                    ),
                ).thenResolve({
                    error: null,
                    response: [transaction],
                });

                await context.mintingTransactionConnector.run(instance(gemMock));
                await context.mintingTransactionConnector.dryRun(instance(gemMock));

                verify(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).twice();
                verify(
                    context.txsServiceMock.search(
                        deepEqual({
                            transaction_hash: txHash,
                        }),
                    ),
                ).twice();
            });

            it('should check reverted tx', async function() {
                const txHash = '0x1694f8213153d1c803b81ec576341075dfdad7f8b7abf6860568e0b807b2bc92';

                const transaction: TxEntity = ({
                    transaction_hash: txHash,
                    block_number: 1,
                    confirmed: true,
                    status: false,
                    transaction_index: 0,
                } as any) as TxEntity;

                const user: UserDto = ({
                    id: 'userid',
                    address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
                } as any) as UserDto;

                const gemState: TokenMinterArguments & TokenMinterTx = {
                    paymentIntentId: 'pi_abcd',
                    currency: 'eur',
                    amount: 10000,
                    userId: user.id,
                    regionRestrictions: {
                        FR: {
                            fix_fee: 25,
                            variable_fee: 1.4,
                        },
                    },
                    methodsRestrictions: {
                        card: {
                            country_resolution_path: 'country',
                        },
                    },
                    txHash,
                };

                const gemMock = mock(Gem);
                when(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).thenReturn(
                    gemState,
                );

                when(
                    context.txsServiceMock.search(
                        deepEqual({
                            transaction_hash: txHash,
                        }),
                    ),
                ).thenResolve({
                    error: null,
                    response: [transaction],
                });

                await context.mintingTransactionConnector.run(instance(gemMock));
                await context.mintingTransactionConnector.dryRun(instance(gemMock));

                verify(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).twice();
                verify(
                    gemMock.error(instance(context.stripeTokenMinterDosojinMock), `Transaction has reverted`),
                ).twice();
            });

            it('should fail on tx fetch error', async function() {
                const txHash = '0x1694f8213153d1c803b81ec576341075dfdad7f8b7abf6860568e0b807b2bc92';

                const user: UserDto = ({
                    id: 'userid',
                    address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
                } as any) as UserDto;

                const gemState: TokenMinterArguments & TokenMinterTx = {
                    paymentIntentId: 'pi_abcd',
                    currency: 'eur',
                    amount: 10000,
                    userId: user.id,
                    regionRestrictions: {
                        FR: {
                            fix_fee: 25,
                            variable_fee: 1.4,
                        },
                    },
                    methodsRestrictions: {
                        card: {
                            country_resolution_path: 'country',
                        },
                    },
                    txHash,
                };

                const gemMock = mock(Gem);
                when(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).thenReturn(
                    gemState,
                );

                when(
                    context.txsServiceMock.search(
                        deepEqual({
                            transaction_hash: txHash,
                        }),
                    ),
                ).thenResolve({
                    error: 'unexpected_error',
                    response: null,
                });

                await context.mintingTransactionConnector.run(instance(gemMock));
                await context.mintingTransactionConnector.dryRun(instance(gemMock));

                verify(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).twice();
                verify(
                    context.txsServiceMock.search(
                        deepEqual({
                            transaction_hash: txHash,
                        }),
                    ),
                ).twice();
                verify(
                    gemMock.error(
                        instance(context.stripeTokenMinterDosojinMock),
                        `An error occured while fetching the transaction`,
                    ),
                );
            });

            it('should fail on empty tx fetch', async function() {
                const txHash = '0x1694f8213153d1c803b81ec576341075dfdad7f8b7abf6860568e0b807b2bc92';

                const user: UserDto = ({
                    id: 'userid',
                    address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
                } as any) as UserDto;

                const gemState: TokenMinterArguments & TokenMinterTx = {
                    paymentIntentId: 'pi_abcd',
                    currency: 'eur',
                    amount: 10000,
                    userId: user.id,
                    regionRestrictions: {
                        FR: {
                            fix_fee: 25,
                            variable_fee: 1.4,
                        },
                    },
                    methodsRestrictions: {
                        card: {
                            country_resolution_path: 'country',
                        },
                    },
                    txHash,
                };

                const gemMock = mock(Gem);
                when(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).thenReturn(
                    gemState,
                );

                when(
                    context.txsServiceMock.search(
                        deepEqual({
                            transaction_hash: txHash,
                        }),
                    ),
                ).thenResolve({
                    error: null,
                    response: [],
                });

                await context.mintingTransactionConnector.run(instance(gemMock));
                await context.mintingTransactionConnector.dryRun(instance(gemMock));

                verify(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).twice();
                verify(
                    context.txsServiceMock.search(
                        deepEqual({
                            transaction_hash: txHash,
                        }),
                    ),
                ).twice();
                verify(gemMock.error(instance(context.stripeTokenMinterDosojinMock), `Cannot find transaction`));
            });

            it('should fail on user fetch error', async function() {
                const txHash = '0x1694f8213153d1c803b81ec576341075dfdad7f8b7abf6860568e0b807b2bc92';

                const transaction: TxEntity = ({
                    transaction_hash: txHash,
                    block_number: 1,
                    confirmed: true,
                    status: true,
                    transaction_index: 0,
                } as any) as TxEntity;

                const user: UserDto = ({
                    id: 'userid',
                    address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
                } as any) as UserDto;

                const gemState: TokenMinterArguments & TokenMinterTx = {
                    paymentIntentId: 'pi_abcd',
                    currency: 'eur',
                    amount: 10000,
                    userId: user.id,
                    regionRestrictions: {
                        FR: {
                            fix_fee: 25,
                            variable_fee: 1.4,
                        },
                    },
                    methodsRestrictions: {
                        card: {
                            country_resolution_path: 'country',
                        },
                    },
                    txHash,
                };

                const gemMock = mock(Gem);
                when(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).thenReturn(
                    gemState,
                );

                when(
                    context.txsServiceMock.search(
                        deepEqual({
                            transaction_hash: txHash,
                        }),
                    ),
                ).thenResolve({
                    error: null,
                    response: [transaction],
                });

                when(context.usersServiceMock.findById(user.id)).thenResolve({
                    error: 'unexpected_error',
                    response: null,
                });

                await context.mintingTransactionConnector.run(instance(gemMock));
                await context.mintingTransactionConnector.dryRun(instance(gemMock));

                verify(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).twice();
                verify(
                    context.txsServiceMock.search(
                        deepEqual({
                            transaction_hash: txHash,
                        }),
                    ),
                ).twice();
                verify(context.usersServiceMock.findById(user.id)).twice();

                verify(
                    gemMock.error(
                        instance(context.stripeTokenMinterDosojinMock),
                        `An error occured while fetching user information`,
                    ),
                ).twice();
            });

            it('should fail on empty event retrieval', async function() {
                const txHash = '0x1694f8213153d1c803b81ec576341075dfdad7f8b7abf6860568e0b807b2bc92';

                const transaction: TxEntity = ({
                    transaction_hash: txHash,
                    block_number: 1,
                    confirmed: true,
                    status: true,
                    transaction_index: 0,
                } as any) as TxEntity;

                const user: UserDto = ({
                    id: 'userid',
                    address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
                } as any) as UserDto;

                const gemState: TokenMinterArguments & TokenMinterTx = {
                    paymentIntentId: 'pi_abcd',
                    currency: 'eur',
                    amount: 10000,
                    userId: user.id,
                    regionRestrictions: {
                        FR: {
                            fix_fee: 25,
                            variable_fee: 1.4,
                        },
                    },
                    methodsRestrictions: {
                        card: {
                            country_resolution_path: 'country',
                        },
                    },
                    txHash,
                };

                const gemMock = mock(Gem);
                when(gemMock.gemPayload).thenReturn({
                    values: {
                        fiat_eur: new BN(10000),
                    },
                    costs: [],
                });
                when(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).thenReturn(
                    gemState,
                );

                const t721tokenInstance = {
                    getPastEvents: async () => [],
                };

                when(
                    context.txsServiceMock.search(
                        deepEqual({
                            transaction_hash: txHash,
                        }),
                    ),
                ).thenResolve({
                    error: null,
                    response: [transaction],
                });

                when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);

                when(context.usersServiceMock.findById(user.id)).thenResolve({
                    error: null,
                    response: user,
                });

                await context.mintingTransactionConnector.run(instance(gemMock));
                await context.mintingTransactionConnector.dryRun(instance(gemMock));

                verify(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).twice();
                verify(
                    context.txsServiceMock.search(
                        deepEqual({
                            transaction_hash: txHash,
                        }),
                    ),
                ).twice();
                verify(context.t721TokenServiceMock.get()).twice();
                verify(context.usersServiceMock.findById(user.id)).twice();

                verify(
                    gemMock.error(instance(context.stripeTokenMinterDosojinMock), `Unable to recover Minting event`),
                ).twice();
            });

            it('should fail on invalid event tx hash', async function() {
                const txHash = '0x1694f8213153d1c803b81ec576341075dfdad7f8b7abf6860568e0b807b2bc92';

                const transaction: TxEntity = ({
                    transaction_hash: txHash,
                    block_number: 1,
                    confirmed: true,
                    status: true,
                    transaction_index: 0,
                } as any) as TxEntity;

                const user: UserDto = ({
                    id: 'userid',
                    address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
                } as any) as UserDto;

                const gemState: TokenMinterArguments & TokenMinterTx = {
                    paymentIntentId: 'pi_abcd',
                    currency: 'eur',
                    amount: 10000,
                    userId: user.id,
                    regionRestrictions: {
                        FR: {
                            fix_fee: 25,
                            variable_fee: 1.4,
                        },
                    },
                    methodsRestrictions: {
                        card: {
                            country_resolution_path: 'country',
                        },
                    },
                    txHash,
                };

                const gemMock = mock(Gem);
                when(gemMock.gemPayload).thenReturn({
                    values: {
                        fiat_eur: new BN(10000),
                    },
                    costs: [],
                });
                when(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).thenReturn(
                    gemState,
                );
                when(gemMock.exchange(`fiat_eur`, `crypto_t721t`, deepEqual(new BN(10000)), 1)).thenReturn(
                    instance(gemMock),
                );

                const t721tokenInstance = {
                    getPastEvents: async () => [
                        {
                            transactionHash: '0xnotthegoodone',
                            transactionIndex: 0,
                        },
                    ],
                };

                when(
                    context.txsServiceMock.search(
                        deepEqual({
                            transaction_hash: txHash,
                        }),
                    ),
                ).thenResolve({
                    error: null,
                    response: [transaction],
                });

                when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);

                when(context.usersServiceMock.findById(user.id)).thenResolve({
                    error: null,
                    response: user,
                });

                await context.mintingTransactionConnector.run(instance(gemMock));
                await context.mintingTransactionConnector.dryRun(instance(gemMock));

                verify(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).twice();
                verify(
                    context.txsServiceMock.search(
                        deepEqual({
                            transaction_hash: txHash,
                        }),
                    ),
                ).twice();
                verify(context.t721TokenServiceMock.get()).twice();
                verify(context.usersServiceMock.findById(user.id)).twice();

                verify(
                    gemMock.error(
                        instance(context.stripeTokenMinterDosojinMock),
                        `Caught events do not match emitted transaction`,
                    ),
                ).twice();
            });

            it('should fail on invalid event tx index', async function() {
                const txHash = '0x1694f8213153d1c803b81ec576341075dfdad7f8b7abf6860568e0b807b2bc92';

                const transaction: TxEntity = ({
                    transaction_hash: txHash,
                    block_number: 1,
                    confirmed: true,
                    status: true,
                    transaction_index: 0,
                } as any) as TxEntity;

                const user: UserDto = ({
                    id: 'userid',
                    address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88',
                } as any) as UserDto;

                const gemState: TokenMinterArguments & TokenMinterTx = {
                    paymentIntentId: 'pi_abcd',
                    currency: 'eur',
                    amount: 10000,
                    userId: user.id,
                    regionRestrictions: {
                        FR: {
                            fix_fee: 25,
                            variable_fee: 1.4,
                        },
                    },
                    methodsRestrictions: {
                        card: {
                            country_resolution_path: 'country',
                        },
                    },
                    txHash,
                };

                const gemMock = mock(Gem);
                when(gemMock.gemPayload).thenReturn({
                    values: {
                        fiat_eur: new BN(10000),
                    },
                    costs: [],
                });
                when(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).thenReturn(
                    gemState,
                );
                when(gemMock.exchange(`fiat_eur`, `crypto_t721t`, deepEqual(new BN(10000)), 1)).thenReturn(
                    instance(gemMock),
                );

                const t721tokenInstance = {
                    getPastEvents: async () => [
                        {
                            transactionHash: txHash,
                            transactionIndex: 1,
                        },
                    ],
                };

                when(
                    context.txsServiceMock.search(
                        deepEqual({
                            transaction_hash: txHash,
                        }),
                    ),
                ).thenResolve({
                    error: null,
                    response: [transaction],
                });

                when(context.t721TokenServiceMock.get()).thenResolve(t721tokenInstance);

                when(context.usersServiceMock.findById(user.id)).thenResolve({
                    error: null,
                    response: user,
                });

                await context.mintingTransactionConnector.run(instance(gemMock));
                await context.mintingTransactionConnector.dryRun(instance(gemMock));

                verify(gemMock.getState<TokenMinterArguments>(instance(context.stripeTokenMinterDosojinMock))).twice();
                verify(
                    context.txsServiceMock.search(
                        deepEqual({
                            transaction_hash: txHash,
                        }),
                    ),
                ).twice();
                verify(context.t721TokenServiceMock.get()).twice();
                verify(context.usersServiceMock.findById(user.id)).twice();

                verify(
                    gemMock.error(
                        instance(context.stripeTokenMinterDosojinMock),
                        `Caught events do not match emitted transaction`,
                    ),
                ).twice();
            });
        });

        describe('scopes', function() {
            it('should recover scopes', async function() {
                const scopes = await context.mintingTransactionConnector.scopes(null);

                expect(scopes).toEqual(['fiat_eur']);
            });
        });

        describe('getConnectorInfo / setReceptacleInfo', function() {
            it('should recover connector infos', async function() {
                expect(await context.mintingTransactionConnector.getConnectorInfo(null)).toEqual(null);

                await context.mintingTransactionConnector.setReceptacleInfo(null);
            });
        });
    });

    describe('StripeTokenMinter Dosojin', function() {
        const context: {
            stripeTokenMinterDosojin: StripeTokenMinterDosojin;
            stripeMock: Stripe;
            t721AdminServiceMock: T721AdminService;
            t721TokenServiceMock: T721TokenService;
            usersServiceMock: UsersService;
            txsServiceMock: TxsService;
            configServiceMock: ConfigService;
        } = {
            stripeTokenMinterDosojin: null,
            stripeMock: null,
            t721AdminServiceMock: null,
            t721TokenServiceMock: null,
            usersServiceMock: null,
            txsServiceMock: null,
            configServiceMock: null,
        };

        beforeEach(async function() {
            context.stripeMock = mock(Stripe);
            context.t721AdminServiceMock = mock(T721AdminService);
            context.t721TokenServiceMock = mock(T721TokenService);
            context.usersServiceMock = mock(UsersService);
            context.txsServiceMock = mock(TxsService);
            context.configServiceMock = mock(ConfigService);

            context.stripeTokenMinterDosojin = new StripeTokenMinterDosojin(
                instance(context.stripeMock),
                instance(context.t721AdminServiceMock),
                instance(context.t721TokenServiceMock),
                instance(context.usersServiceMock),
                instance(context.txsServiceMock),
                instance(context.configServiceMock),
            );
        });

        describe('selectReceptacle', function() {
            it('should select stripe payment intent receptacle', async function() {
                const gemMock = mock(Gem);

                when(gemMock.setReceptacleEntity(`StripeTokenMinter`, anything())).thenResolve(instance(gemMock));

                await context.stripeTokenMinterDosojin.selectReceptacle(instance(gemMock));

                const capturedCall = capture(gemMock.setReceptacleEntity).last();

                expect(capturedCall[1].name).toEqual('CardPaymentIntentReceptacle');
            });
        });

        describe('selectConnector', function() {
            it('should select minting transaction connector', async function() {
                const gemMock = mock(Gem);

                when(gemMock.setConnectorEntity(`StripeTokenMinter`, anything())).thenResolve(instance(gemMock));

                await context.stripeTokenMinterDosojin.selectConnector(instance(gemMock));

                const capturedCall = capture(gemMock.setConnectorEntity).last();

                expect(capturedCall[1].name).toEqual('MintingTransactionConnector');
            });
        });
    });
});
