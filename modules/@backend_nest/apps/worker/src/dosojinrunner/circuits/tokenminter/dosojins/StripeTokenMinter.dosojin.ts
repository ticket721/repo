import {
    BN,
    Connector,
    Dosojin,
    Gem,
    GenericStripeDosojin,
    Operation,
    OperationStatusNames,
    TransferConnectorStatusNames,
} from 'dosojin';
import { Inject, Injectable } from '@nestjs/common';
import { Stripe } from 'stripe';
import { T721AdminService } from '@lib/common/contracts/T721Admin.service';
import { UsersService } from '@lib/common/users/Users.service';
import { TokenMinterArguments } from '@app/worker/dosojinrunner/circuits/tokenminter/TokenMinter.circuit';
import { UserEntity } from '@lib/common/users/entities/User.entity';
import { TxsService } from '@lib/common/txs/Txs.service';
import { ConfigService } from '@lib/common/config/Config.service';
import { TxEntity } from '@lib/common/txs/entities/Tx.entity';
import { T721TokenService } from '@lib/common/contracts/T721Token.service';

/**
 * Extra State Arguments added by the TokenMinter Operation
 */
export interface TokenMinterTx {
    /**
     * Hash of the ethereum transaction that should create the tokens
     */
    txHash: string;
}

/**
 * Operation to mint tokens equivalent to current fiat payload
 */
export class TokenMinterOperation extends Operation {
    /**
     * Deoendency Injection
     *
     * @param name
     * @param dosojin
     * @param t721AdminService
     * @param usersService
     * @param txsService
     * @param configService
     */
    constructor(
        name: string,
        dosojin: Dosojin,
        private readonly t721AdminService: T721AdminService,
        private readonly usersService: UsersService,
        private readonly txsService: TxsService,
        private readonly configService: ConfigService,
    ) {
        super(name, dosojin);
    }

    /**
     * Run Method
     *
     * @param gem
     */
    public async run(gem: Gem): Promise<Gem> {
        gem.setRefreshTimer(1000);

        const { userId } = gem.getState<TokenMinterArguments>(this.dosojin);

        const creditedUser = await this.usersService.findById(userId);

        if (creditedUser.error) {
            return gem.error(this.dosojin, `An error occured while fetching the credited user`);
        }

        if (creditedUser.response === null) {
            return gem.error(this.dosojin, `Cannot find user to credit`);
        }

        if (creditedUser.response.valid === false) {
            return gem;
        }

        const user: UserEntity = creditedUser.response;

        const userAddress = user.address;
        const amount = gem.gemPayload.values['fiat_eur'].toString();

        const rawInstance = await this.t721AdminService.get();

        const encodedTransactionCall = rawInstance.methods.refundedMintFor(userAddress, amount).encodeABI();

        const admin = this.configService.get('VAULT_ETHEREUM_ASSIGNED_ADMIN');

        const gasLimitEstimation = await this.txsService.estimateGasLimit(
            admin,
            rawInstance._address,
            encodedTransactionCall,
        );

        if (gasLimitEstimation.error) {
            return gem.error(this.dosojin, `Cannot estimate gas limit`);
        }

        const gasPriceEstimation = await this.txsService.estimateGasPrice(gasLimitEstimation.response);

        if (gasPriceEstimation.error) {
            return gem.error(this.dosojin, `Cannot estimate gas price`);
        }

        const tx = await this.txsService.sendRawTransaction(
            admin,
            rawInstance._address,
            '0',
            encodedTransactionCall,
            gasPriceEstimation.response,
            gasLimitEstimation.response,
        );

        if (tx.error) {
            return gem.error(this.dosojin, `An error occured while trying to create transaction`);
        }

        gem.addCost(
            this.dosojin,
            new BN(gasPriceEstimation.response).mul(new BN(gasLimitEstimation.response)),
            'crypto_eth',
            `Token Minting Transaction Fees`,
        );

        gem.setState<TokenMinterArguments & TokenMinterTx>(this.dosojin, {
            ...gem.getState<TokenMinterArguments>(this.dosojin),
            txHash: tx.response.transaction_hash,
        });

        return gem.setOperationStatus(OperationStatusNames.OperationComplete);
    }

    /**
     * Dry Run Method
     *
     * @param gem
     */
    public async dryRun(gem: Gem): Promise<Gem> {
        gem.setRefreshTimer(1000);

        const { userId } = gem.getState<TokenMinterArguments>(this.dosojin);

        const creditedUser = await this.usersService.findById(userId);

        if (creditedUser.error) {
            return gem.error(this.dosojin, `An error occured while fetching the credited user`);
        }

        if (creditedUser.response === null) {
            return gem.error(this.dosojin, `Cannot find user to credit`);
        }

        if (creditedUser.response.valid === false) {
            return gem;
        }

        const user: UserEntity = creditedUser.response;

        const userAddress = user.address;
        const amount = gem.gemPayload.values['fiat_eur'].toString();

        const rawInstance = await this.t721AdminService.get();

        const encodedTransactionCall = rawInstance.methods.refundedMintFor(userAddress, amount).encodeABI();

        const admin = this.configService.get('VAULT_ETHEREUM_ASSIGNED_ADMIN');

        const gasLimitEstimation = await this.txsService.estimateGasLimit(
            admin,
            rawInstance._address,
            encodedTransactionCall,
        );

        if (gasLimitEstimation.error) {
            return gem.error(this.dosojin, `Cannot estimate gas limit`);
        }

        const gasPriceEstimation = await this.txsService.estimateGasPrice(gasLimitEstimation.response);

        if (gasPriceEstimation.error) {
            return gem.error(this.dosojin, `Cannot estimate gas price`);
        }

        gem.addCost(
            this.dosojin,
            new BN(gasPriceEstimation.response).mul(new BN(gasLimitEstimation.response)),
            'crypto_eth',
            `Token Minting Transaction Fees`,
        );

        gem.setState<TokenMinterArguments & TokenMinterTx>(this.dosojin, {
            ...gem.getState<TokenMinterArguments>(this.dosojin),
            txHash: '0xabcd',
        });

        return gem.setOperationStatus(OperationStatusNames.OperationComplete);
    }

    /**
     * Method to recover scopes
     *
     * @param gem
     */
    public async scopes(gem: Gem): Promise<string[]> {
        return ['fiat_eur'];
    }
}

/**
 * Connector to perform final token minting checks
 */
// tslint:disable-next-line:max-classes-per-file
export class MintingTransactionConnector extends Connector<any> {
    /**
     * Run Method
     *
     * @param gem
     */
    public async run(gem: Gem): Promise<Gem> {
        const { txHash, userId, currency } = gem.getState<TokenMinterArguments & TokenMinterTx>(this.dosojin);

        gem.setRefreshTimer(1000);

        const txRes = await this.txsService.search({
            transaction_hash: txHash,
        });

        if (txRes.error) {
            return gem.error(this.dosojin, `An error occured while fetching the transaction`);
        }

        if (txRes.response.length === 0) {
            return gem.error(this.dosojin, `Cannot find transaction`);
        }

        const tx: TxEntity = txRes.response[0];

        if (tx.confirmed) {
            if (tx.status) {
                const user = await this.usersService.findById(userId);

                if (user.error) {
                    return gem.error(this.dosojin, `An error occured while fetching user information`);
                }

                const t721TokenInstance = await this.t721TokenService.get();

                const events = await t721TokenInstance.getPastEvents('Transfer', {
                    fromBlock: tx.block_number,
                    toBlock: tx.block_number,
                    filter: {
                        from: '0x0000000000000000000000000000000000000000',
                        to: user.response.address,
                        amount: gem.gemPayload.values[`fiat_${currency}`].toString(),
                    },
                });

                if (events.length === 0) {
                    return gem.error(this.dosojin, `Unable to recover Minting event`);
                }

                let found = false;

                for (const event of events) {
                    if (
                        event.transactionHash.toLowerCase() === tx.transaction_hash.toLowerCase() &&
                        event.transactionIndex === tx.transaction_index
                    ) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    return gem.error(this.dosojin, `Caught events do not match emitted transaction`);
                }

                return gem
                    .exchange(`fiat_${currency}`, 'crypto_t721t', gem.gemPayload.values[`fiat_${currency}`], 1)
                    .setConnectorStatus(TransferConnectorStatusNames.TransferComplete);
            } else {
                return gem.error(this.dosojin, `Transaction has reverted`);
            }
        } else {
            return gem;
        }
    }

    /**
     * Dry Run Method
     *
     * @param gem
     */
    public async dryRun(gem: Gem): Promise<Gem> {
        const { txHash, userId, currency } = gem.getState<TokenMinterArguments & TokenMinterTx>(this.dosojin);

        gem.setRefreshTimer(1000);

        const txRes = await this.txsService.search({
            transaction_hash: txHash,
        });

        if (txRes.error) {
            return gem.error(this.dosojin, `An error occured while fetching the transaction`);
        }

        if (txRes.response.length === 0) {
            return gem.error(this.dosojin, `Cannot find transaction`);
        }

        const tx: TxEntity = txRes.response[0];

        if (tx.confirmed) {
            if (tx.status) {
                const user = await this.usersService.findById(userId);

                if (user.error) {
                    return gem.error(this.dosojin, `An error occured while fetching user information`);
                }

                const t721TokenInstance = await this.t721TokenService.get();

                const events = await t721TokenInstance.getPastEvents('Transfer', {
                    fromBlock: tx.block_number,
                    toBlock: tx.block_number,
                    filter: {
                        from: '0x0000000000000000000000000000000000000000',
                        to: user.response.address,
                        amount: gem.gemPayload.values[`fiat_${currency}`].toString(),
                    },
                });

                if (events.length === 0) {
                    return gem.error(this.dosojin, `Unable to recover Minting event`);
                }

                let found = false;

                for (const event of events) {
                    if (
                        event.transactionHash.toLowerCase() === tx.transaction_hash.toLowerCase() &&
                        event.transactionIndex === tx.transaction_index
                    ) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    return gem.error(this.dosojin, `Caught events do not match emitted transaction`);
                }

                return gem
                    .exchange(`fiat_${currency}`, 'crypto_t721t', gem.gemPayload.values[`fiat_${currency}`], 1)
                    .setConnectorStatus(TransferConnectorStatusNames.TransferComplete);
            } else {
                return gem.error(this.dosojin, `Transaction has reverted`);
            }
        } else {
            return gem;
        }
    }

    /**
     * Method to recover scopes
     *
     * @param gem
     */
    public async scopes(gem: Gem): Promise<string[]> {
        return ['fiat_eur'];
    }

    /**
     * Method to recover Connector Info
     *
     * @param gem
     */
    public async getConnectorInfo(gem: Gem): Promise<any> {
        return null;
    }

    /**
     * Method to set receptacle Info
     *
     * @param info
     */
    public async setReceptacleInfo(info: any): Promise<void> {
        return;
    }

    /**
     * Dependency Injection
     *
     * @param name
     * @param dosojin
     * @param txsService
     * @param t721TokenService
     * @param usersService
     */
    constructor(
        name: string,
        dosojin: Dosojin,
        private readonly txsService: TxsService,
        private readonly t721TokenService: T721TokenService,
        private readonly usersService: UsersService,
    ) {
        super(name, dosojin);
    }
}

/**
 * Core Stripe processor and token minter Dosojin
 */
@Injectable()
// tslint:disable-next-line:max-classes-per-file
export class StripeTokenMinterDosojin extends GenericStripeDosojin {
    /**
     * Dependency Injection
     *
     * @param stripe
     * @param t721AdminService
     * @param t721TokenService
     * @param usersService
     * @param txsService
     * @param configService
     */
    constructor(
        @Inject('STRIPE_INSTANCE') stripe: Stripe,
        t721AdminService: T721AdminService,
        t721TokenService: T721TokenService,
        usersService: UsersService,
        txsService: TxsService,
        configService: ConfigService,
    ) {
        super('StripeTokenMinter', stripe);
        this.addOperation(
            new TokenMinterOperation(
                'TokenMinterOperation',
                this,
                t721AdminService,
                usersService,
                txsService,
                configService,
            ),
        );
        this.addConnector(
            new MintingTransactionConnector(
                'MintingTransactionConnector',
                this,
                txsService,
                t721TokenService,
                usersService,
            ),
        );
    }

    /**
     * Receptacle Selection
     *
     * @param gem
     */
    selectReceptacle(gem: Gem): Promise<Gem> {
        return gem.setReceptacleEntity(this.name, this.receptacles[0]);
    }

    /**
     * Connector Selection
     *
     * @param gem
     */
    selectConnector(gem: Gem): Promise<Gem> {
        return gem.setConnectorEntity(this.name, this.connectors[2]);
    }
}
