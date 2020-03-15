import { Inject, Injectable } from '@nestjs/common';
import { CRUDExtension } from '@lib/common/crud/CRUD.extension';
import { TxsRepository } from '@lib/common/txs/Txs.repository';
import { TxEntity } from '@lib/common/txs/entities/Tx.entity';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse';
import { isAddress, keccak256, RefractMtx, isTransactionHash } from '@common/global';
import { EIP712Payload } from '@ticket721/e712/lib';
import { RefractFactoryV0Service } from '@lib/common/contracts/refract/RefractFactory.V0.service';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { encodeMetaTransaction } from '@lib/common/txs/utils/encodeMetaTransaction';
import { T721AdminService } from '@lib/common/contracts/T721Admin.service';
import { VaultereumService } from '@lib/common/vaultereum/Vaultereum.service';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import Decimal from 'decimal.js';

/**
 * Configuration Options
 */
export interface TxsServiceOptions {
    /**
     * Number of block before a transaction is considered confirmed
     */
    blockThreshold: number;

    /**
     * Rate at which we check if transactions are confirmed
     */
    blockPollingRefreshRate: number;

    /**
     * Current Network ID
     */
    ethereumNetworkId: number;

    /**
     * Domain Name for the Meta Transactions
     */
    ethereumMtxDomainName: string;

    /**
     * Version for the Meta Transactions
     */
    ethereumMtxVersion: string;

    /**
     * Admin to use to relay the MetaTransactions
     */
    ethereumMtxRelayAdmin: string;

    /**
     * Amount of euros to spend at most for a transaction
     */
    targetGasPrice: number;
}

/**
 * Service to CRUD TxEntities
 */
@Injectable()
export class TxsService extends CRUDExtension<TxsRepository, TxEntity> {
    /**
     * Dependency Injection
     *
     * @param txsRepository
     * @param txEntity
     * @param txOptions
     * @param globalConfigService
     * @param vaultereumService
     * @param web3Service
     * @param refractFactoryService
     * @param t721AdminService
     */
    constructor(
        @InjectRepository(TxsRepository)
        txsRepository: TxsRepository,
        @InjectModel(TxEntity)
        txEntity: BaseModel<TxEntity>,
        @Inject('TXS_MODULE_OPTIONS')
        private readonly txOptions: TxsServiceOptions,
        private readonly globalConfigService: GlobalConfigService,
        private readonly vaultereumService: VaultereumService,
        private readonly web3Service: Web3Service,
        private readonly refractFactoryService: RefractFactoryV0Service,
        private readonly t721AdminService: T721AdminService,
    ) {
        super(
            txEntity,
            txsRepository,
            /* istanbul ignore next */
            (e: TxEntity) => {
                return new txEntity(e);
            },
        );
    }

    /**
     * Method to subscribe to a transaction hash
     *
     * @param txhash
     */
    async subscribe(txhash: string): Promise<ServiceResponse<TxEntity>> {
        txhash = txhash.toLowerCase();

        if (!isTransactionHash(txhash)) {
            return {
                error: 'invalid_tx_hash_format',
                response: null,
            };
        }

        const duplicate = await this.search({
            transaction_hash: txhash,
        });

        if (duplicate.error) {
            return {
                error: duplicate.error,
                response: null,
            };
        }

        if (duplicate.response.length !== 0) {
            return {
                error: null,
                response: duplicate.response[0],
            };
        }

        const createdTx = await this.create({
            transaction_hash: txhash,
            confirmed: false,
            block_number: 0,
        });

        if (createdTx.error) {
            return {
                error: createdTx.error,
                response: null,
            };
        }

        return {
            error: null,
            response: createdTx.response,
        };
    }

    /**
     * Method to estimate Gas Price
     *
     * @param gasLimit
     */
    async estimateGasPrice(gasLimit: string): Promise<ServiceResponse<string>> {
        const globalConfig = await this.globalConfigService.search({
            id: 'global',
        });

        if (globalConfig.error) {
            return {
                error: globalConfig.error,
                response: null,
            };
        }

        const web3 = await this.web3Service.get();

        const lastBlockGasPrice: Decimal = new Decimal(await web3.eth.getGasPrice());
        const gasLimitDecimal: Decimal = new Decimal(gasLimit);
        const optimizedGasPrice: Decimal = new Decimal(this.txOptions.targetGasPrice)
            .div(new Decimal(globalConfig.response[0].eth_eur_price))
            .div(gasLimitDecimal)
            .mul('10e18')
            .floor();

        if (optimizedGasPrice.gt(lastBlockGasPrice)) {
            return {
                error: null,
                response: lastBlockGasPrice.toString(),
            };
        }

        return {
            error: null,
            response: optimizedGasPrice.toString(),
        };
    }

    /**
     * Method to estimate Gas Limit
     *
     * @param from
     * @param to
     * @param data
     */
    async estimateGasLimit(from: string, to: string, data: string): Promise<ServiceResponse<string>> {
        if (!isAddress(from)) {
            const vaultInfos = await this.vaultereumService.read(`ethereum/accounts/${from}`);

            if (vaultInfos.error) {
                return {
                    error: vaultInfos.error,
                    response: null,
                };
            }

            from = vaultInfos.response.data.address;
        }
        const web3 = await this.web3Service.get();

        const nonce = await web3.eth.getTransactionCount(from);

        const gasLimitEstimation = await (await this.web3Service.get()).eth.estimateGas({
            from,
            nonce,
            to,
            data,
        });

        return {
            error: null,
            response: typeof gasLimitEstimation === 'string' ? gasLimitEstimation : gasLimitEstimation.toString(),
        };
    }

    /**
     * Method to broadcast Meta Transaction
     *
     * @param payload
     * @param signature
     * @param user
     */
    async mtx(payload: EIP712Payload, signature: string, user: UserDto): Promise<ServiceResponse<TxEntity>> {
        const rmtx: RefractMtx = new RefractMtx(
            this.txOptions.ethereumNetworkId,
            this.txOptions.ethereumMtxDomainName,
            this.txOptions.ethereumMtxVersion,
            user.address,
        );

        const signer = await rmtx.verify(payload, signature);

        const verification = await this.refractFactoryService.isController(user.address, signer, keccak256(user.email));

        if (verification === false) {
            return {
                error: 'payload_not_signed_by_controller',
                response: null,
            };
        }

        const args: [number, string[], string[], string] = await encodeMetaTransaction(payload.message, signature);

        const [target, encodedMtx] = await this.refractFactoryService.encodeCall(
            user.address,
            signer,
            keccak256(user.email),
            ...args,
        );

        const t721Admin = await this.t721AdminService.get();

        const encodedT721AdminExecuteTx = await t721Admin.methods.refundedExecute(0, target, 0, encodedMtx).encodeABI();

        const gasLimitEstimation = await this.estimateGasLimit(
            this.txOptions.ethereumMtxRelayAdmin,
            t721Admin._address,
            encodedT721AdminExecuteTx,
        );

        if (gasLimitEstimation.error) {
            return {
                error: gasLimitEstimation.error,
                response: null,
            };
        }

        const gasPriceEstimation = await this.estimateGasPrice(gasLimitEstimation.response);

        if (gasPriceEstimation.error) {
            return {
                error: gasPriceEstimation.error,
                response: null,
            };
        }

        const txEntity = await this.sendRawTransaction(
            this.txOptions.ethereumMtxRelayAdmin,
            t721Admin._address,
            '0',
            encodedT721AdminExecuteTx,
            gasPriceEstimation.response,
            gasLimitEstimation.response,
        );

        if (txEntity.error) {
            return txEntity;
        }

        return {
            error: null,
            response: txEntity.response,
        };
    }

    /**
     * Method to broadcast Raw Transaction
     *
     * @param from
     * @param to
     * @param value
     * @param data
     * @param gasPrice
     * @param gasLimit
     */
    async sendRawTransaction(
        from: string,
        to: string,
        value: string,
        data: string,
        gasPrice: string,
        gasLimit: string,
    ): Promise<ServiceResponse<TxEntity>> {
        const accountCheck = await this.vaultereumService.read(`ethereum/accounts/${from}`);

        if (accountCheck.error) {
            return {
                error: accountCheck.error,
                response: null,
            };
        }

        const signedTx = await this.vaultereumService.write(`ethereum/accounts/${from}/sign-tx`, {
            address_to: to,
            amount: value,
            gas_price: gasPrice,
            gas_limit: gasLimit,
            data: data.slice(2),
            encoding: 'hex',
        });

        if (signedTx.error) {
            return {
                error: signedTx.error,
                response: null,
            };
        }

        const tx = await (await this.web3Service.get()).eth.sendSignedTransaction(
            signedTx.response.data.signed_transaction,
        );
        const subscriptionRes = await this.subscribe(tx.transactionHash);

        if (subscriptionRes.error) {
            return {
                error: subscriptionRes.error,
                response: null,
            };
        }

        return subscriptionRes;
    }
}
