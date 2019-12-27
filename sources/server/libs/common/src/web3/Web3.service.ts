import { Inject, OnModuleInit } from '@nestjs/common';

export interface Web3ServiceOptions {
    Web3: any;
    host: string;
    port: string;
    protocol: string;
}

/**
 * Utility to build and serve a Web3 instance
 */
export class Web3Service {

    /**
     * Web3 instance
     */
    private readonly web3: any;

    /**
     * Pre-fetched network id
     */
    private net_id: number;

    /**
     * Dependency Injection
     *
     * @param options
     */
    constructor (@Inject('WEB3_MODULE_OPTIONS') private readonly options: Web3ServiceOptions) {

        switch (this.options.protocol) {
            case 'http':
            case 'https': {
                this.web3 = new this.options.Web3(new this.options.Web3.providers.HttpProvider(`${this.options.protocol}://${this.options.host}:${this.options.port}`));
                break;
            }

            default:
                throw new Error(`Unknown protocol ${this.options.protocol} to build web3 instance`);
        }

    }

    /**
     * Recover the Web3 instance
     */
    public get<Web3Interface = any>(): Web3Interface {
        return this.web3;
    }

    /**
     * First call should fetch with this helper
     */
    private async fetchNetwork(): Promise<number> {
        this.net_id = await this.web3.eth.net.getId();
        return this.net_id;
    }

    /**
     * Recover the network id
     */
    public async net(): Promise<number> {
        return this.net_id || this.fetchNetwork();
    }

}
