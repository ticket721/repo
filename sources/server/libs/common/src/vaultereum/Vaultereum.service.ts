import { Inject, OnModuleInit } from '@nestjs/common';
import VaultClientBuilder from 'node-vault';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse';

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

export abstract class VaultClient {
    abstract read(path: string, args?: any): Promise<any>;
    abstract write(path: string, args?: any): Promise<any>;
}

// tslint:disable-next-line:max-classes-per-file
export class VaultereumService implements OnModuleInit {
    private client: VaultClient = null;

    constructor(
        @Inject('VAULTEREUM_MODULE_OPTIONS')
        private readonly vaultereumModuleOptions: VaultereumOptions,
        private readonly shutdownService: ShutdownService,
    ) {}

    /* istanbul ignore next */
    public build(args: any): VaultClient {
        return VaultClientBuilder(args);
    }

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

    async onModuleInit(): Promise<void> {
        this.client = await this.configure();
    }

    async write<DataType = any>(
        path: string,
        args?: any,
    ): Promise<ServiceResponse<DataType>> {
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

    async read<DataType = any>(
        path: string,
        args?: any,
    ): Promise<ServiceResponse<DataType>> {
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
