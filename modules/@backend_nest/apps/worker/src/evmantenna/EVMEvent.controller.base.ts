import { ContractsControllerBase } from '@lib/common/contracts/ContractsController.base';
import { Schedule } from 'nest-schedule';
import { GlobalConfigService } from '@lib/common/globalconfig/GlobalConfig.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { InstanceSignature, OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { Job, Queue } from 'bull';
import { EVMEventSetsService } from '@lib/common/evmeventsets/EVMEventSets.service';
import { Repository } from '@iaminfinity/express-cassandra';
import { EVMEvent } from '@lib/common/evmeventsets/entities/EVMEventSet.entity';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { EVMAntennaMergerScheduler, EVMProcessableEvent } from '@app/worker/evmantenna/EVMAntennaMerger.scheduler';
import { CRUDExtension, DryResponse } from '@lib/common/crud/CRUDExtension.base';
import { OnModuleInit } from '@nestjs/common';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { NestError } from '@lib/common/utils/NestError';
import { noConcurrentRun } from '@app/worker/utils/noConcurrentRun';

/**
 * Configuration for an EVM Event fetching function
 */
export interface EVMEventControllerConfig {
    /**
     * Filter to apply to the evm event fetch
     */
    filter?: any;

    /**
     * Array of topics to filter the query
     */
    topics?: string[];
}

/**
 * Returned format by the Web3 getPastEvents method
 */
export interface EVMEventRawResult {
    /**
     * Parsed return values
     */
    returnValues: {
        /**
         * Key Value for Variable => Value
         */
        [key: string]: number | string;
    };

    /**
     * Raw Information
     */
    raw: {
        /**
         * Raw data
         */
        data: string;

        /**
         * Raw topics
         */
        topics: string[];
    };

    /**
     * Event Name
     */
    event: string;

    /**
     * Signature of the Event
     */
    signature: string;

    /**
     * Index of the event within the transaction
     */
    logIndex: number;

    /**
     * Index of the transaction within the block
     */
    transactionIndex: number;

    /**
     * Hash of the transaction
     */
    transactionHash: string;

    /**
     * Hash of the block
     */
    blockHash: string;

    /**
     * Number of the block
     */
    blockNumber: number;

    /**
     * Address of the emitting entity
     */
    address: string;
}

/**
 * Data Model for event fetching jobs
 */
export interface EVMEventFetcherJob {
    /**
     * Block Number to fetch
     */
    blockNumber: number;
}

/**
 * Rollbackable update input
 */
export interface RollbackableField<Type> {
    /**
     * Old value
     */
    old: Type;

    /**
     * New Value
     */
    new: Type;
}

/**
 * Rollbackable Query Result
 */
export interface RollbackableQuery {
    /**
     * Forward Query
     */
    query: DryResponse;

    /**
     * Rollback of the Forward Query
     */
    rollback: DryResponse;
}

/**
 * Method used to build both the query and rollback batched queries
 */
export type Appender = (query: DryResponse, rollback: DryResponse) => void;

/**
 * Class to extend for each event type / Contract
 */
export class EVMEventControllerBase implements OnModuleInit {
    /**
     * Name of the bull job
     */
    private readonly fetchJobName: string = null;

    /**
     * Logger of the instance
     */
    private readonly logger: WinstonLoggerService = null;

    /**
     * Name of the Event being intercepted
     */
    public readonly eventName: string = null;

    /**
     * Dependency Injection
     *
     * @param contractsController
     * @param schedule
     * @param queue
     * @param globalConfigService
     * @param shutdownService
     * @param outrospectionService
     * @param evmEventSetsService
     * @param eventName
     * @param options
     */
    constructor(
        private readonly contractsController: ContractsControllerBase,
        private readonly schedule: Schedule,
        private readonly queue: Queue<EVMEventFetcherJob>,
        private readonly globalConfigService: GlobalConfigService,
        private readonly shutdownService: ShutdownService,
        private readonly outrospectionService: OutrospectionService,
        private readonly evmEventSetsService: EVMEventSetsService,
        eventName: string,
        private readonly options?: EVMEventControllerConfig,
    ) {
        this.eventName = eventName;
        this.fetchJobName = `@@evmantenna/fetchEVMEventsForBlock/${this.contractsController.getArtifactName()}/${
            this.eventName
        }`;
        this.logger = new WinstonLoggerService(`EVMEventController/${this.contractsController.getArtifactName()}`);
    }

    /**
     * Static utility to generate both forward and rollback queries on delete
     *
     * @param service
     * @param entity
     * @param append
     */
    static async rollbackableDelete<Entity>(
        service: CRUDExtension<Repository<Entity>, Entity>,
        entity: Entity,
        append: Appender,
    ): Promise<ServiceResponse<RollbackableQuery>> {
        throw new NestError('implement rollbackableDelete');
    }

    /**
     * Static utility to generate both forward and rollback queries on create
     *
     * @param service
     * @param entity
     * @param append
     */
    static async rollbackableCreate<Entity>(
        service: CRUDExtension<Repository<Entity>, Entity>,
        entity: Entity,
        append: Appender,
    ): Promise<ServiceResponse<RollbackableQuery>> {
        throw new NestError('implement rollbackableCreate');
    }

    /**
     * Static utility to generate both forward and rollback queries on update
     *
     * @param service
     * @param selector
     * @param fields
     * @param append
     */
    static async rollbackableUpdate<Entity>(
        service: CRUDExtension<Repository<Entity>, Entity>,
        selector: Partial<Entity>,
        fields: { [key: string]: RollbackableField<any> },
        append: Appender,
    ): Promise<ServiceResponse<void>> {
        for (const field of Object.keys(fields)) {
            const forwardUpdateRes = await service.dryUpdate(selector, {
                [field]: fields[field].new,
            } as Partial<Entity>);

            if (forwardUpdateRes.error) {
                return {
                    error: 'forward_update_query_building_error',
                    response: null,
                };
            }

            const rollbackUpdateRes = await service.dryUpdate(selector, {
                [field]: fields[field].old,
            } as Partial<Entity>);

            if (rollbackUpdateRes.error) {
                return {
                    error: 'rollback_update_query_building_error',
                    response: null,
                };
            }

            append(forwardUpdateRes.response, rollbackUpdateRes.response);
        }

        return {
            error: null,
            response: null,
        };
    }

    /**
     * Artifact Name Getter
     */
    public get artifactName(): string {
        return this.contractsController.getArtifactName();
    }

    /**
     * Method called by the merger to create changes query
     * Should be overriden by all implementations;
     *
     * @param event
     * @param append
     */
    async convert(event: EVMProcessableEvent, append: Appender): Promise<any> {
        const error = new NestError(
            `Error in ${this.contractsController.getArtifactName()}/${this.eventName} | convert should be overriden`,
        );
        this.shutdownService.shutdownWithError(error);
        throw error;
    }

    /**
     * Method to fetch specific events of artifact from a specific block to another
     *
     * @param from
     * @param to
     */
    async fetch(from: number, to: number): Promise<EVMEventRawResult[]> {
        const instance = await this.contractsController.get();

        return instance.getPastEvents(this.eventName, {
            ...this.options,
            fromBlock: from,
            toBlock: to,
        });
    }

    /**
     * Current block number properly fetched
     */
    private currentFetchHeight = null;

    /**
     * Current block number properly dispatched to be fetched
     */
    private currentDispatchHeight = null;

    /**
     * Function to verify is an event should be assigned to its converter
     *
     * @param eventName
     * @param artifactName
     */
    public isHandler(eventName: string, artifactName: string): boolean {
        return this.eventName === eventName && this.contractsController.getArtifactName() === artifactName;
    }

    /**
     * Background fetcher to dispatch fetch jobs on new blocks or errors
     */
    async eventBackgroundFetcher(): Promise<void> {
        const globalConfigRes = await this.globalConfigService.search({
            id: 'global',
        });

        if (globalConfigRes.error || globalConfigRes.response.length === 0) {
            return this.shutdownService.shutdownWithError(
                new NestError(`Unable to recover global config: ${globalConfigRes.error || 'no global config'}`),
            );
        }

        const globalConfig = globalConfigRes.response[0];

        if (globalConfig.block_number === 0 || globalConfig.processed_block_number === 0) {
            return;
        }

        if (this.currentFetchHeight === null || this.currentFetchHeight < globalConfig.processed_block_number) {
            this.currentFetchHeight = globalConfig.processed_block_number;
        }

        if (this.currentDispatchHeight === null || this.currentDispatchHeight < globalConfig.processed_block_number) {
            this.currentDispatchHeight = globalConfig.processed_block_number;
        }

        while (this.currentDispatchHeight < globalConfig.block_number) {
            const amount =
                globalConfig.block_number - this.currentDispatchHeight < 1000
                    ? globalConfig.block_number - this.currentDispatchHeight
                    : 1000;

            try {
                await this.fetchEVMEventsForBlock(this.currentDispatchHeight + 1, this.currentDispatchHeight + amount);
                this.logger.log(
                    `Fetched ${this.artifactName}::${this.eventName} for blocks: ${this.currentDispatchHeight +
                        1} => ${this.currentDispatchHeight + amount}`,
                );
                this.currentDispatchHeight += amount;
            } catch (e) {
                this.logger.error(e);
            }
        }
    }

    /**
     * Bull Job to fetch events for a specific block
     *
     * @param from
     * @param to
     */
    async fetchEVMEventsForBlock(from: number, to: number): Promise<void> {
        const events = await this.fetch(from, to);

        for (let fetchedBlock = from; fetchedBlock <= to; ++fetchedBlock) {
            const currentBlockEvents = events.filter(
                (ev: EVMEventRawResult): boolean => ev.blockNumber === fetchedBlock,
            );

            const createRes = await this.evmEventSetsService.create({
                artifact_name: this.contractsController.getArtifactName(),
                event_name: this.eventName,
                block_number: fetchedBlock,
                events: currentBlockEvents.map(
                    (ev: EVMEventRawResult): EVMEvent => ({
                        return_values: JSON.stringify(ev.returnValues),
                        raw_data: ev.raw.data,
                        raw_topics: ev.raw.topics,
                        event: ev.event,
                        signature: ev.signature,
                        log_index: ev.logIndex,
                        transaction_index: ev.transactionIndex,
                        transaction_hash: ev.transactionHash,
                        block_hash: ev.blockHash,
                        block_number: ev.blockNumber,
                        address: ev.address,
                    }),
                ),
            });

            if (createRes.error) {
                throw new NestError(
                    `EVMEvemtControllerBase::fetchEVMEventsForBlock | Unable to create evmeventset: ${createRes.error}`,
                );
            }

            if (events.length) {
                this.logger.log(
                    `Caught ${events.length} ${
                        this.eventName
                    } from ${this.contractsController.getArtifactName()} at block ${fetchedBlock}`,
                );
            }
        }
    }

    /**
     * Initialization and subscription to scheduler and bull queue
     */
    async onModuleInit(): Promise<void> {
        EVMAntennaMergerScheduler.registerEVMEventsController(this);

        const signature: InstanceSignature = await this.outrospectionService.getInstanceSignature();

        if (signature.master === true && signature.name === 'worker') {
            this.schedule.scheduleIntervalJob(
                `${this.contractsController.getArtifactName()}::${this.eventName}`,
                1000,
                noConcurrentRun.bind(this, this.fetchJobName, this.eventBackgroundFetcher.bind(this)),
            );
        }
    }
}
