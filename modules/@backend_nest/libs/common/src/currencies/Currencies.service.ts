import { Inject, Injectable } from '@nestjs/common';
import { FSService } from '@lib/common/fs/FS.service';
import { Currencies } from '@lib/common/utils/Currencies.joi';
import { ContractsService } from '@lib/common/contracts/Contracts.service';
import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';

/**
 * Configuration for a currency type
 */
export interface CurrencyConfig {
    /**
     * Name of the currency
     */
    name: string;

    /**
     * Type of the currency
     */
    type: 'erc20' | 'set';

    /**
     * Load type to use to recover details
     */
    loadType: 'module' | 'address';

    /**
     * If defined, used in frontend to display fiat balance
     */
    dollarPeg?: number;

    /**
     * List of sub-currencies for Set type
     */
    contains?: string[];

    /**
     * Module name to recover artifacts
     */
    moduleName?: string;

    /**
     * Name of the Contract
     */
    contractName?: string;

    /**
     * Address of the Contract
     */
    contractAddress?: string;
}

/**
 * Set Type Data Type
 */
export interface SetCurrency {
    /**
     * Type Name === 'set'
     */
    type: string;

    /**
     * Name of the currency
     */
    name: string;

    /**
     * Sub Currencies
     */
    contains: string[];
}

/**
 * ERC20 Type Data Type
 */
export interface ERC20Currency {
    /**
     * Type Name === 'erc20'
     */
    type: string;

    /**
     * Name of the currency
     */
    name: string;

    /**
     * Module name to recover artifacts
     */
    module: string;

    /**
     * Address of the currency
     */
    address: string;

    /**
     * If defined, used in frontend to display fiat balance
     */
    dollarPeg?: number;

    /**
     * Smart Contract Controller Instance
     */
    controller: ContractsControllerBase;
}

/**
 * Service to load and serve currency configs
 */
@Injectable()
export class CurrenciesService {
    /**
     * Loaded Currency Configs
     */
    private readonly currencyConfigs: CurrencyConfig[];

    /**
     * Transformed Currencies Configs
     */
    private readonly currencies: {
        [key: string]: ERC20Currency | SetCurrency;
    } = {};

    /**
     * Flag to detect if already loaded
     */
    private loaded: boolean = false;

    /**
     * Dependency Injection
     *
     * @param configPath
     * @param fsService
     * @param contractsService
     * @param web3Service
     * @param shutdownService
     */
    constructor(
        @Inject('CURRENCIES_MODULE_OPTIONS')
        configPath: string,
        fsService: FSService,
        private readonly contractsService: ContractsService,
        private readonly web3Service: Web3Service,
        private readonly shutdownService: ShutdownService,
    ) {
        const data: any = JSON.parse(fsService.readFile(configPath));

        const { error, value: validatedEnvConfig } = Currencies.validate(data);

        if (error) {
            throw new Error(`Currencies validation error: ${error.message}`);
        }

        this.currencyConfigs = validatedEnvConfig;
    }

    /**
     * Load Currency in contract mode
     *
     * @param currencyConfig
     */
    private async loadContractMode(currencyConfig: CurrencyConfig): Promise<void> {
        const controller: ContractsControllerBase = new ContractsControllerBase(
            this.contractsService,
            this.web3Service,
            this.shutdownService,
            currencyConfig.moduleName,
            currencyConfig.contractName,
            {
                address: currencyConfig.contractAddress,
                name: currencyConfig.name,
            },
        );

        await controller.loadContract();

        this.currencies[currencyConfig.name] = {
            type: currencyConfig.type,
            name: currencyConfig.name,
            module: currencyConfig.moduleName,
            address: currencyConfig.contractAddress,
            dollarPeg: currencyConfig.dollarPeg,
            controller,
        };
    }

    /**
     * Load Currency in module mode
     *
     * @param currencyConfig
     */
    private async loadModuleMode(currencyConfig: CurrencyConfig): Promise<void> {
        const controller: ContractsControllerBase = new ContractsControllerBase(
            this.contractsService,
            this.web3Service,
            this.shutdownService,
            currencyConfig.moduleName,
            currencyConfig.contractName,
            {
                name: currencyConfig.name,
            },
        );

        await controller.loadContract();

        const address = (await controller.get())._address;

        this.currencies[currencyConfig.name] = {
            type: currencyConfig.type,
            name: currencyConfig.name,
            module: currencyConfig.moduleName,
            address,
            dollarPeg: currencyConfig.dollarPeg,
            controller,
        };
    }

    /**
     * Load ERC20 currency type
     *
     * @param currencyConfig
     */
    private async loadERC20(currencyConfig: CurrencyConfig): Promise<void> {
        switch (currencyConfig.loadType) {
            case 'address':
                return this.loadContractMode(currencyConfig);
            case 'module':
                return this.loadModuleMode(currencyConfig);
        }
    }

    /**
     * Load Set currency type
     *
     * @param currencyConfig
     */
    private async loadSet(currencyConfig: CurrencyConfig): Promise<void> {
        this.currencies[currencyConfig.name] = {
            type: 'set',
            name: currencyConfig.name,
            contains: currencyConfig.contains,
        };
    }

    /**
     * Load Currencies
     */
    private async load(): Promise<{
        [key: string]: ERC20Currency | SetCurrency;
    }> {
        for (const currencyConfig of this.currencyConfigs) {
            switch (currencyConfig.type) {
                case 'erc20': {
                    await this.loadERC20(currencyConfig);
                    break;
                }
                case 'set': {
                    await this.loadSet(currencyConfig);
                    break;
                }
            }
        }
        this.loaded = true;
        return this.currencies;
    }

    /**
     * Recover (and load if required) currency configs
     *
     * @param currency
     */
    public async get(currency: string): Promise<ERC20Currency | SetCurrency> {
        return this.loaded ? this.currencies[currency] : (await this.load())[currency];
    }
}
