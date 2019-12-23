import { Inject, OnModuleInit } from '@nestjs/common';
import { Web3ModuleOptions }    from '@lib/common/web3/Web3.module';

/**
 * Utility to build and serve a Web3 instance
 */
export class Web3Service implements OnModuleInit {

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
    constructor(@Inject('WEB3_MODULE_OPTIONS') options: Web3ModuleOptions) {

        switch (options.protocol) {
            case 'http':
            case 'https': {
                this.web3 = new options.Web3(new options.Web3.providers.HttpProvider(`${options.protocol}://${options.host}:${options.port}`));
                break;
            }

            default:
                throw new Error(`Unknown protocol ${options.protocol} to build web3 instance`);
        }

    }

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
        return this.net_id || (this.net_id = await this.web3.eth.net.getId());
    }

    /**
     * Called when module starts
     */
    async onModuleInit(): Promise<void> {
        this.net_id = await this.web3.eth.net.getId();
    }

}
