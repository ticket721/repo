import { Injectable } from '@nestjs/common';
import { ContractsService } from '@lib/common/contracts/Contracts.service';
import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { IsNumber, IsNumberString, IsString } from 'class-validator';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import currenciesConfig from '@lib/common/currencies/Currencies.config.value';
import { NestError } from '@lib/common/utils/NestError';
import { log2 } from '@common/global';

/**
 * Price of the Category
 */
export class Price {
    /**
     * Currency of the price
     */
    @IsString()
    currency: string;

    /**
     * Value as a string decimal 10
     */
    @IsString()
    value: string;

    /**
     * Value as a log
     */
    @IsNumber()
    // tslint:disable-next-line:variable-name
    log_value: number;
}

/**
 * Input Price expected from users
 */
export class InputPrice {
    /**
     * Currency Name
     */
    @IsString()
    currency: string;

    /**
     * Currency Price
     */
    @IsNumberString()
    price: string;
}

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

    /**
     * Helper to compute required fee for given currency
     *
     * @param amount
     */
    feeComputer?: (amount: string) => string;
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

    /**
     * Helper to compute required fee for given currency
     *
     * @param amount
     */
    feeComputer: (amount: string) => string;
}

/**
 * Service to load and serve currency configs
 */
@Injectable()
export class CurrenciesService {
    /**
     * Loaded Currency Configs
     */
    private readonly currencyConfigs: CurrencyConfig[] = currenciesConfig;

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
     * @param contractsService
     * @param web3Service
     * @param shutdownService
     */
    constructor(
        private readonly contractsService: ContractsService,
        private readonly web3Service: Web3Service,
        private readonly shutdownService: ShutdownService,
    ) {}

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
            feeComputer: currencyConfig.feeComputer,
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
            feeComputer: currencyConfig.feeComputer,
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

    /**
     * Internal helper to get all depending currencies
     *
     * @param inputPrice
     * @param met
     */
    private async internalRecursiveResolver(inputPrice: string, met: { [key: string]: boolean }): Promise<string[]> {
        let currencies: string[] = [];

        const currency: ERC20Currency | SetCurrency = await this.get(inputPrice);

        if (currency === undefined) {
            throw new NestError(`Cannot find currency ${inputPrice}`);
        }

        switch (currency.type) {
            case 'set': {
                const setCurrency: SetCurrency = currency as SetCurrency;

                if (met[setCurrency.name] === true) {
                    break;
                }

                met[setCurrency.name] = true;

                for (const setInternalCurrency of setCurrency.contains) {
                    currencies = [...currencies, ...(await this.internalRecursiveResolver(setInternalCurrency, met))];
                }

                break;
            }

            case 'erc20': {
                const erc20Currency: ERC20Currency = currency as ERC20Currency;

                if (met[erc20Currency.name] === true) {
                    break;
                }

                met[erc20Currency.name] = true;
                currencies.push(erc20Currency.name);

                break;
            }
        }

        return currencies;
    }

    /**
     * Resolves all the given prices to a complete flat list of currencies
     *
     * @param inputPrices
     */
    public async resolveInputPrices(inputPrices: InputPrice[]): Promise<ServiceResponse<Price[]>> {
        let ret: Price[] = [];
        const met = {};

        try {
            for (const inputPrice of inputPrices) {
                ret = [
                    ...ret,
                    ...(await this.internalRecursiveResolver(inputPrice.currency, met)).map(
                        (curr: string): Price => ({
                            currency: curr,
                            value: inputPrice.price,
                            log_value: log2(inputPrice.price),
                        }),
                    ),
                ];
            }
        } catch (e) {
            return {
                error: 'invalid_currencies',
                response: null,
            };
        }

        ret = ret.filter(
            (elem: Price, idx: number): boolean =>
                ret.findIndex((subElem: Price): boolean => subElem.currency === elem.currency) === idx,
        );

        return {
            error: null,
            response: ret,
        };
    }

    /**
     * Computes the fee on the given currency for a specific amount
     *
     * @param currency
     * @param amount
     */
    public async computeFee(currency: string, amount: string): Promise<string> {
        const currencyInfo = await this.get(currency);

        if ((currencyInfo as ERC20Currency).feeComputer) {
            return (currencyInfo as ERC20Currency).feeComputer(amount);
        }

        return '0';
    }
}
