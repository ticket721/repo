import { Inject, OnModuleInit } from '@nestjs/common';
import VaultClientBuilder       from 'node-vault';
import { ShutdownService }      from '@lib/common/shutdown/Shutdown.service';
import { ServiceResponse }      from '@lib/common/utils/ServiceResponse';

export interface VaultereumOptions {
    VAULT_HOST: string;
    VAULT_PORT: number;
    VAULT_PROTOCOL: string;
    VAULT_TOKEN: string;
    VAULT_ETHEREUM_NODE_HOST: string;
    VAULT_ETHEREUM_NODE_PORT: number;
    VAULT_ETHEREUM_NODE_PROTOCOL: string;
    VAULT_ETHEREUM_NODE_NETWORK_ID: number;
}

export interface VaultClient {
    read(path: string, args?: any): Promise<any>;
    write(path: string, args?: any): Promise<any>;
}

export class VaultereumService implements OnModuleInit {

    private client: VaultClient = null;

    constructor(
        @Inject('VAULTEREUM_MODULE_OPTIONS')
        private readonly vaultereumModuleOptions: VaultereumOptions,
        private readonly shutdownService: ShutdownService,
    ) {}

    private async configure(): Promise<VaultClient> {
        const client = VaultClientBuilder({
            apiVersion: 'v1',
            endpoint: `${this.vaultereumModuleOptions.VAULT_PROTOCOL}://${this.vaultereumModuleOptions.VAULT_HOST}:${this.vaultereumModuleOptions.VAULT_PORT}`,
            token: this.vaultereumModuleOptions.VAULT_TOKEN,
        });

        try {
            await client.read('ethereum/config');
        } catch (e) {
            if (
                e.message.indexOf(
                    'the ethereum backend is not configured properly',
                ) !== -1
            ) {
                await client.write('ethereum/config', {
                    rpc_url: `${this.vaultereumModuleOptions.VAULT_ETHEREUM_NODE_PROTOCOL}://${this.vaultereumModuleOptions.VAULT_ETHEREUM_NODE_HOST}:${this.vaultereumModuleOptions.VAULT_ETHEREUM_NODE_PORT}`,
                    chain_id: this.vaultereumModuleOptions
                        .VAULT_ETHEREUM_NODE_NETWORK_ID,
                });
            } else {
                this.shutdownService.shutdownWithError(e);
                throw e;
            }
        }
        return client;
    }

    async onModuleInit(): Promise<void> {
        this.client = await this.configure();
    }

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

}
