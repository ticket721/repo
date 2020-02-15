import { Inject, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectSchedule, Schedule } from 'nest-schedule';
import {
    GlobalConfigOptions,
    GlobalConfigService,
} from '@lib/common/globalconfig/GlobalConfig.service';
import { Web3Service } from '@lib/common/web3/Web3.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { GlobalEntity } from '@lib/common/globalconfig/entities/Global.entity';
import { BinanceService } from '@lib/common/binance/Binance.service';

/**
 * Global Config task scheduler
 */
export class GlobalConfigScheduler implements OnModuleInit, OnModuleDestroy {
    /**
     * Dependency Injection
     *
     * @param web3Service
     * @param globalConfigService
     * @param shutdownService
     * @param schedule
     * @param globalConfigOptions
     * @param binanceService
     */
    constructor(
        private readonly web3Service: Web3Service,
        private readonly globalConfigService: GlobalConfigService,
        private readonly shutdownService: ShutdownService,
        @InjectSchedule() private readonly schedule: Schedule,
        @Inject('GLOBAL_CONFIG_MODULE_OPTIONS')
        private readonly globalConfigOptions: GlobalConfigOptions,
        private readonly binanceService: BinanceService,
    ) {}

    /**
     * Task to fetch ETH/EUR price
     */
    async fetchETHEURPrice(): Promise<void> {
        const price = await this.binanceService.getETHEURPrice();

        if (price.error) {
            return;
        }

        await this.globalConfigService.update(
            {
                id: 'global',
            },
            {
                eth_eur_price: price.response,
            },
        );
    }

    /**
     * Task to fetch latest block number
     */
    async fetchBlockNumber(): Promise<void> {
        const currentGlobalConfig = await this.globalConfigService.search({
            id: 'global',
        });

        if (
            currentGlobalConfig.error ||
            currentGlobalConfig.response.length === 0
        ) {
            const error = new Error(
                'GlobalConfigScheduler::global_document_fetch_error',
            );
            this.shutdownService.shutdownWithError(error);
            throw error;
        }

        const globalConfig: GlobalEntity = currentGlobalConfig.response[0];
        const web3 = await this.web3Service.get();
        const currentBlockNumber: number = await web3.eth.getBlockNumber();
        const storedBlockNumber: number = globalConfig.block_number;

        if (currentBlockNumber > storedBlockNumber) {
            await this.globalConfigService.update(
                {
                    id: 'global',
                },
                {
                    block_number: currentBlockNumber,
                },
            );
        }
    }

    /**
     * Interval Creator
     */
    onModuleInit(): void {
        this.schedule.scheduleIntervalJob(
            'fetchBlockNumber',
            this.globalConfigOptions.blockNumberFetchingRate,
            this.fetchBlockNumber.bind(this),
        );
        this.schedule.scheduleIntervalJob(
            'fetchEthereumPrice',
            this.globalConfigOptions.ethereumPriceFetchingRate,
            this.fetchETHEURPrice.bind(this),
        );
    }

    /**
     * Interval Stopper
     */
    onModuleDestroy(): void {
        this.schedule.cancelJobs();
    }
}
