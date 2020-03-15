import { Inject, OnModuleInit } from '@nestjs/common';
import VaultClientBuilder from 'node-vault';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse';
import { EIP712Signature } from '@ticket721/e712';
import { ExternalSigner } from '@ticket721/e712/lib/EIP712Signer';

/**
 * Options to build and use Vaultereum
 */
export interface VaultereumOptions {
    /**
     * Vault hostname
     */
    VAULT_HOST: string;

    /**
     * Vault port
     */
    VAULT_PORT: number;

    /**
     * Vault protocol
     */
    VAULT_PROTOCOL: string;

    /**
     * Vault token
     */
    VAULT_TOKEN: string;

    /**
     * Vault Ethereum Node Host
     */
    VAULT_ETHEREUM_NODE_HOST: string;

    /**
     * Vault Ethereum Node Port
     */
    VAULT_ETHEREUM_NODE_PORT: number;

    /**
     * Vault Ethereum Node Protocol
     */
    VAULT_ETHEREUM_NODE_PROTOCOL: string;

    /**
     * Vault Ethereum Node Network ID
     */
    VAULT_ETHEREUM_NODE_NETWORK_ID: number;
}

/**
 * Vault Client typing
 */
export abstract class VaultClient {
    /**
     * Read a path on the vault
     *
     * @param path
     * @param args
     */
    abstract read(path: string, args?: any): Promise<any>;

    /**
     * Write a path on the vault
     *
     * @param path
     * @param args
     */
    abstract write(path: string, args?: any): Promise<any>;
}

/**
 * Service to control the Vault
 */
// tslint:disable-next-line:max-classes-per-file
export class VaultereumService implements OnModuleInit {
    /**
     * Vault Client
     */
    private client: VaultClient = null;

    /**
     * Dependency Injection
     *
     * @param vaultereumModuleOptions
     * @param shutdownService
     */
    constructor(
        @Inject('VAULTEREUM_MODULE_OPTIONS')
        private readonly vaultereumModuleOptions: VaultereumOptions,
        private readonly shutdownService: ShutdownService,
    ) {}

    /**
     * Builds the Vault client
     */

    /* istanbul ignore next */
    public build(args: any): VaultClient {
        return VaultClientBuilder(args);
    }

    /**
     * Configure the Service
     */
    public async configure(): Promise<VaultClient> {
        const client = this.build({
            apiVersion: 'v1',
            endpoint: `${this.vaultereumModuleOptions.VAULT_PROTOCOL}://${this.vaultereumModuleOptions.VAULT_HOST}:${this.vaultereumModuleOptions.VAULT_PORT}`,
            token: this.vaultereumModuleOptions.VAULT_TOKEN,
        });

        try {
            await client.read('ethereum/config');
        } catch (e) {
            this.shutdownService.shutdownWithError(e);
            throw e;
        }
        return client;
    }

    /**
     * Service initialization
     */
    async onModuleInit(): Promise<void> {
        this.client = await this.configure();
    }

    /**
     * Method to write on a Vault path
     *
     * @param path
     * @param args
     */
    async write<DataType = any>(path: string, args?: any): Promise<ServiceResponse<DataType>> {
        try {
            const res = (await this.client.write(path, args)) as DataType;
            return {
                error: null,
                response: res,
            };
        } catch (e) {
            return {
                error: e.message,
                response: null,
            };
        }
    }

    /**
     * Method to read a Vault path
     *
     * @param path
     * @param args
     */
    async read<DataType = any>(path: string, args?: any): Promise<ServiceResponse<DataType>> {
        try {
            const res = (await this.client.read(path, args)) as DataType;
            return {
                error: null,
                response: res,
            };
        } catch (e) {
            return {
                error: e.message,
                response: null,
            };
        }
    }

    /**
     * Get e712 signer using vaultereum
     *
     * @param signer
     */
    getSigner(signer: string): ExternalSigner {
        return async (encodedPayload: string): Promise<EIP712Signature> => {
            const signature = await this.write(`ethereum/accounts/${signer}/sign`, {
                data: encodedPayload.slice(2),
                encoding: 'hex',
            });

            if (signature.error) {
                throw new Error(`Unable to sign using external vault signer for account ${signer}: ${signature.error}`);
            }

            const hexSignature = signature.response.data.signature;
            const v = parseInt(hexSignature.slice(130), 16);
            const r = `0x${hexSignature.slice(2, 2 + 64)}`;
            const s = `0x${hexSignature.slice(2 + 64, 2 + 128)}`;

            return {
                hex: hexSignature,
                r,
                v,
                s,
            };
        };
    }
}
