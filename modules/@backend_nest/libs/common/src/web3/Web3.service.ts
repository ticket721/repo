import { Inject }    from '@nestjs/common';
import { NestError } from '@lib/common/utils/NestError';

/**
 * Build options for the Web3 Service
 */
export interface Web3ServiceOptions {
    /**
     * Custom class to use to create the rpc client
     */
    Web3: any;

    /**
     * Ethereum node hostname
     */
    host: string;

    /**
     * Ethereum node port
     */
    port: string;

    /**
     * Ethereum node communication protocol
     */
    protocol: string;

    /**
     * Http headers to add
     */
    headers: {name: string; value: string;}[];

    /**
     * Http Path
     */
    path?: string;
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
    private netId: number;

    /**
     * Dependency Injection
     *
     * @param options
     */
    constructor(
        @Inject('WEB3_MODULE_OPTIONS')
        private readonly options: Web3ServiceOptions,
    ) {
        switch (this.options.protocol) {
            case 'http':
            case 'https': {
                this.web3 = new this.options.Web3(
                    new this.options.Web3.providers.HttpProvider(
                        `${this.options.protocol}://${this.options.host}:${this.options.port}${this.options.path || ''}`,
                        {headers: this.options.headers}
                    ),
                );
                break;
            }

            default:
                throw new NestError(`Unknown protocol ${this.options.protocol} to build web3 instance`);
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
        this.netId = await this.web3.eth.net.getId();
        return this.netId;
    }

    /**
     * Recover the network id
     */
    public async net(): Promise<number> {
        return this.netId || this.fetchNetwork();
    }
}
