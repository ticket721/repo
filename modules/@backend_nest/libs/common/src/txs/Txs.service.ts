import { Inject, Injectable } from '@nestjs/common';
import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { TxsRepository } from '@lib/common/txs/Txs.repository';
import { TxEntity } from '@lib/common/txs/entities/Tx.entity';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { isTransactionHash } from '@common/global';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import Decimal from 'decimal.js';
import { RocksideService } from '@lib/common/rockside/Rockside.service';

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
     * @param web3Service
     * @param rocksideService
     */
    constructor(
        @InjectRepository(TxsRepository)
        txsRepository: TxsRepository,
        @InjectModel(TxEntity)
        txEntity: BaseModel<TxEntity>,
        @Inject('TXS_MODULE_OPTIONS')
        private readonly txOptions: TxsServiceOptions,
        private readonly globalConfigService: GlobalConfigService,
        private readonly web3Service: Web3Service,
        private readonly rocksideService: RocksideService,
    ) {
        super(
            txEntity,
            txsRepository,
            /* istanbul ignore next */
            (e: TxEntity) => {
                return new txEntity(e);
            },
            /* istanbul ignore next */
            (tx: TxEntity) => {
                return new TxEntity(tx);
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
        const web3 = await this.web3Service.get();

        try {
            const nonce = await web3.eth.getTransactionCount(from);

            const gasLimitEstimation = await web3.eth.estimateGas({
                from,
                nonce,
                to,
                data,
            });

            return {
                error: null,
                response: gasLimitEstimation,
            };
        } catch (e) {
            return {
                error: e.message,
                response: null,
            };
        }
    }

    /**
     * Method to broadcast Raw Transaction
     *
     * @param from
     * @param to
     * @param value
     * @param data
     */
    async sendRawTransaction(
        from: string,
        to: string,
        value: string,
        data: string,
    ): Promise<ServiceResponse<TxEntity>> {
        const sentTransactionRes = await this.rocksideService.sendTransaction({
            from,
            to,
            value,
            data,
        });

        if (sentTransactionRes.error) {
            return {
                error: sentTransactionRes.error,
                response: null,
            };
        }

        const subscriptionRes = await this.subscribe(sentTransactionRes.response);

        if (subscriptionRes.error) {
            return {
                error: subscriptionRes.error,
                response: null,
            };
        }

        return {
            error: null,
            response: subscriptionRes.response,
        };
    }
}
