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
export class Web3Service implements OnModuleInit {

    /**
     * Web3 instance
     */
    private web3: any;

    /**
     * Pre-fetched network id
     */
    private net_id: number;

    /**
     * Dependency Injection
     *
     * @param options
     */
     constructor (@Inject('WEB3_MODULE_OPTIONS') private readonly options: Web3ServiceOptions) {}

    /**
     * Recover the Web3 instance
     */
    public get<Web3Interface = any>(): Web3Interface {
        return this.web3;
    }

    /**
     * Recover the network id
     */
    public async net(): Promise<number> {
        return this.net_id;
    }

    /**
     * Called when module starts
     */
    async onModuleInit(): Promise<void> {

        switch (this.options.protocol) {
            case 'http':
            case 'https': {
                this.web3 = new this.options.Web3(new this.options.Web3.providers.HttpProvider(`${this.options.protocol}://${this.options.host}:${this.options.port}`));
                break;
            }

            default:
                throw new Error(`Unknown protocol ${this.options.protocol} to build web3 instance`);
        }

        this.net_id = await this.web3.eth.net.getId();
    }

}
