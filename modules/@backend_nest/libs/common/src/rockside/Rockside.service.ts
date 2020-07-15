import { Injectable } from '@nestjs/common';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { EIP712Signature, ExternalSigner } from '@ticket721/e712/lib';
import { keccak256FromBuffer } from '@common/global';
import { RocksideApi, TransactionOpts } from '@rocksideio/rockside-wallet-sdk/lib/api';
import { ConfigService } from '@lib/common/config/Config.service';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';

/**
 * Data model returned when creating an EAO
 */
export interface RocksideCreateEOAResponse {
    /**
     * EOA Address
     */
    address: string;
}

/**
 * Data model returned when creating an identity
 */
export interface RocksideCreateIdentityResponse {
    /**
     * Identity address
     */
    address: string;
}

/**
 * Rockside Service encapsulating the Rockside API SDK
 */
@Injectable()
export class RocksideService {
    /**
     * Dependency Injection
     *
     * @param rockside
     * @param configService
     */
    constructor(private readonly rockside: RocksideApi, private readonly configService: ConfigService) {}

    /**
     * Logger for the rockside service
     */
    private readonly logger = new WinstonLoggerService('rockside');

    /**
     * Utility to create an EOA using the Rockside API
     */
    async createEOA(): Promise<ServiceResponse<RocksideCreateEOAResponse>> {
        try {
            const addressCreationResponse = await this.rockside.createEOA();
            return {
                error: null,
                response: {
                    address: addressCreationResponse.address,
                },
            };
        } catch (e) {
            console.error(e);
            return {
                error: e.message,
                response: null,
            };
        }
    }

    /**
     * Retrieve the @ticket721/e712 compliant signer
     * @param eoa
     */
    getSigner(eoa: string): ExternalSigner {
        return async (encodedPayload: string): Promise<EIP712Signature> => {
            const hashedPayload = keccak256FromBuffer(Buffer.from(encodedPayload.slice(2), 'hex'));
            const rocksideSignature = (await this.rockside.signMessageWithEOA(eoa, hashedPayload)).signed_message;

            const v = parseInt(rocksideSignature.slice(130), 16);
            const r = `0x${rocksideSignature.slice(2, 2 + 64)}`;
            const s = `0x${rocksideSignature.slice(2 + 64, 2 + 128)}`;

            return {
                hex: rocksideSignature,
                r,
                v,
                s,
            };
        };
    }

    /**
     * Utility to create an identity with the Rockside API
     */
    async createIdentity(): Promise<ServiceResponse<RocksideCreateIdentityResponse>> {
        const userEoa = await this.createEOA();

        if (userEoa.error) {
            return {
                error: 'eoa_creation_error',
                response: null,
            };
        }

        const forwarderAddress = this.configService.get('ROCKSIDE_FORWARDER_ADDRESS');

        try {
            const identityCreationResponse = await this.rockside.createIdentity(
                forwarderAddress,
                userEoa.response.address,
            );
            return {
                error: null,
                response: identityCreationResponse,
            };
        } catch (e) {
            console.error(e);
            return {
                error: e.message,
                response: null,
            };
        }
    }

    /**
     * Utility to send a transaction from a previously created Rockside identity
     *
     * @param tx
     */
    async sendTransaction(tx: Omit<TransactionOpts, 'nonce' | 'gas'>): Promise<ServiceResponse<string>> {
        this.logger.log(`Broadcasting transaction with following arguments: ${JSON.stringify(tx, null, 4)}`);

        try {
            const transactionCreationResponse = await this.rockside.sendTransaction(tx);
            return {
                error: null,
                response: transactionCreationResponse.transaction_hash,
            };
        } catch (e) {
            console.error(e);
            return {
                error: e.message,
                response: null,
            };
        }
    }
}
