import { Inject, Injectable } from '@nestjs/common';
import { FSService } from '@lib/common/fs/FS.service';
import { Currencies } from '@lib/common/utils/Currencies.joi';
import { ContractsService } from '@lib/common/contracts/Contracts.service';
import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';

export interface CurrencyConfig {
    name: string;
    type: 'erc20' | 'set';
    loadType: 'module' | 'address';
    dollarPeg?: number;
    contains?: string[];
    moduleName?: string;
    contractName?: string;
    contractAddress?: string;
}

export interface SetCurrency {
    type: string;
    contains: string[];
}

export interface NativeCurrency {
    type: string;
    name: string;
    module: string;
    address: string;
    dollarPeg?: number;
    controller: ContractsControllerBase;
}

export interface ERC20Currency {
    type: string;
    name: string;
    module: string;
    address: string;
    dollarPeg?: number;
    controller: ContractsControllerBase;
}

@Injectable()
export class CurrenciesService {
    private readonly currencyConfigs: CurrencyConfig[];
    private readonly currencies: {
        [key: string]: ERC20Currency | NativeCurrency | SetCurrency;
    } = {};
    private loaded: boolean = false;

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

    private async loadContractMode(
        currencyConfig: CurrencyConfig,
    ): Promise<void> {
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
            name: currencyConfig.contractName,
            module: currencyConfig.moduleName,
            address: currencyConfig.contractAddress,
            dollarPeg: currencyConfig.dollarPeg,
            controller,
        };
    }

    private async loadModuleMode(
        currencyConfig: CurrencyConfig,
    ): Promise<void> {
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

        const address = (await controller.get()).address;

        this.currencies[currencyConfig.name] = {
            type: currencyConfig.type,
            name: currencyConfig.contractName,
            module: currencyConfig.moduleName,
            address,
            dollarPeg: currencyConfig.dollarPeg,
            controller,
        };
    }

    private async loadERC20(currencyConfig: CurrencyConfig): Promise<void> {
        switch (currencyConfig.loadType) {
            case 'address':
                return this.loadContractMode(currencyConfig);
            case 'module':
                return this.loadModuleMode(currencyConfig);
        }
    }

    private async loadSet(currencyConfig: CurrencyConfig): Promise<void> {
        this.currencies[currencyConfig.name] = {
            type: 'set',
            contains: currencyConfig.contains,
        };
    }

    private async load(): Promise<{
        [key: string]: ERC20Currency | NativeCurrency | SetCurrency;
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

    public async get(
        currency: string,
    ): Promise<ERC20Currency | NativeCurrency | SetCurrency> {
        return this.loaded
            ? this.currencies[currency]
            : (await this.load())[currency];
    }
}
