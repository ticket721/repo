import { Circuit, Gem, RawGem } from 'dosojin';
import { ObjectSchema } from '@hapi/joi';
import { OnModuleInit } from '@nestjs/common';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { DosojinRunnerScheduler } from '@app/worker/dosojinrunner/DosojinRunner.scheduler';
import { Job, Queue } from 'bull';
import { InstanceSignature, OutrospectionService } from '@lib/common/outrospection/Outrospection.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { GemOrdersService } from '@lib/common/gemorders/GemOrders.service';
import { GemOrderEntity, RawGemEntity } from '@lib/common/gemorders/entities/GemOrder.entity';
import { leftPad } from '@common/global';
import { NestError } from '@lib/common/utils/NestError';

/**
 * Job Data Format for the Gem Order initializations
 */
export interface GemInitializationJob<InitialArguments> {
    /**
     * ID of the Gem Order
     */
    orderId: string;

    /**
     * Initialization arguments
     */
    args: InitialArguments;
}

/**
 * Job Data Format for the Gem Run
 */
export interface GemRunJob {
    /**
     * ID of the Gem Order
     */
    orderId: string;
}

/**
 * Base Class to contain and use Circuits in the DosojinRunner Module
 */
export class CircuitContainerBase<InitialArguments = any> implements OnModuleInit {
    /**
     * Dependency Injection
     *
     * @param circuit
     * @param initialArgumentsVerifier
     * @param logger
     * @param outrospectionService
     * @param dosojinQueue
     * @param shutdownService
     * @param gemOrdersService
     */
    constructor(
        protected readonly circuit: Circuit,
        protected readonly initialArgumentsVerifier: ObjectSchema<InitialArguments>,
        protected readonly logger: WinstonLoggerService,
        protected readonly outrospectionService: OutrospectionService,
        protected readonly dosojinQueue: Queue,
        protected readonly shutdownService: ShutdownService,
        protected readonly gemOrdersService: GemOrdersService,
    ) {}

    /**
     * Recover the name of the circuit
     */
    public get name(): string {
        return this.circuit.name;
    }

    /**
     * Initialization method that should be overidden
     *
     * @param args
     */
    public async initialize(args: InitialArguments): Promise<Gem> {
        throw new NestError(
            `CircuitContainerBase::initialize | ${this.circuit.name} has no custom initialization, each cicuit should implement its unique gem initialization`,
        );
    }

    /**
     * Run a Gem Order
     *
     * @param gem
     * @param dry
     */
    public async run(gem: Gem, dry?: boolean): Promise<Gem> {
        return this.circuit.run(gem, dry);
    }

    /**
     * Performs a Dry Run on the Gem
     * @param gem
     */
    public async completeDryRun(gem: Gem): Promise<Gem> {
        return this.circuit.dryRun(gem);
    }

    /**
     * Bull Task to run a Gem Order
     *
     * @param job
     */
    public async runTask(job: Job<GemRunJob>): Promise<void> {
        const orderRes = await this.gemOrdersService.search({
            id: job.data.orderId,
        });

        if (orderRes.error || orderRes.response.length === 0) {
            return this.shutdownService.shutdownWithError(
                new NestError(
                    `Unable to fetch / find gem order ${job.data.orderId}: ${orderRes.error || 'empty result'}`,
                ),
            );
        }

        const gemOrder: GemOrderEntity = orderRes.response[0];

        if (gemOrder.circuit_name !== this.circuit.name || gemOrder.initialized === false) {
            throw new NestError(`Invalid gem for circuit ${this.circuit.name} set to circuit ${gemOrder.circuit_name}`);
        }

        const rawGemEntity: RawGemEntity = gemOrder.gem;

        if (!rawGemEntity) {
            throw new NestError(`Cannot process uninitialized gem order: ${job.data.orderId}`);
        }

        if (rawGemEntity.gem_status !== 'Running') {
            return this.logger.log(`Interrupted run with Gem for invalid status reasons: ${rawGemEntity.gem_status}`);
        }

        const rawGem: RawGem = GemOrderEntity.toDosojinRaw(rawGemEntity);

        let gem: Gem = new Gem().load(rawGem);

        try {
            gem = await this.circuit.run(gem);
        } catch (e) {
            this.logger.error(e);
            gem.setGemStatus('Fatal');
        }

        const updatedRawGem: RawGem = gem.raw;

        const updatedRawGemEntity: RawGemEntity = GemOrderEntity.fromDosojinRaw(updatedRawGem);

        const updateRes = await this.gemOrdersService.update(
            {
                id: job.data.orderId,
            },
            {
                gem: updatedRawGemEntity,
                refresh_timer: updatedRawGemEntity.refresh_timer,
            },
        );

        if (updateRes.error) {
            return this.shutdownService.shutdownWithError(
                new NestError(`Error while updating gem after run: ${updateRes.error}`),
            );
        }

        if (updatedRawGemEntity.gem_status === 'Running') {
            const lastAction = updatedRawGemEntity.route_history[updatedRawGemEntity.route_history.length - 1];
            this.logger.log(
                `Successful Run with Gem@${leftPad(job.data.orderId.toString(), 20)} on ${lastAction.dosojin}:${
                    lastAction.entity_type
                }:${lastAction.entity_name} at layer ${lastAction.layer} (called ${lastAction.count} times)`,
            );
        } else {
            this.logger.log(
                `Gem # ${leftPad(job.data.orderId.toString(), 20)} finished with status ${
                    updatedRawGemEntity.gem_status
                }`,
            );
        }
    }

    /**
     * Bull task to initialize a Gem Order
     *
     * @param job
     */
    public async initializeTask(job: Job<GemInitializationJob<InitialArguments>>): Promise<void> {
        let gem: Gem;
        let active = true;

        try {
            gem = await this.initialize(job.data.args);
        } catch (e) {
            active = false;
            const rawGemAfterError = new Gem().raw;

            if (e.details) {
                rawGemAfterError.error_info = {
                    dosojin: null,
                    entity_name: null,
                    entity_type: null,
                    layer: null,
                    message: e.details.map((detail: any) => detail.message).join(' | '),
                };
            } else {
                rawGemAfterError.error_info = {
                    dosojin: null,
                    entity_name: null,
                    entity_type: null,
                    layer: null,
                    message: 'initialization_error',
                };
            }

            gem = new Gem().load(rawGemAfterError);
        }

        const rawGem = gem.raw;
        rawGem.gem_status = active ? 'Running' : 'Fatal';

        const updateRes = await this.gemOrdersService.update(
            {
                id: job.data.orderId,
            },
            {
                initialized: true,
                gem: GemOrderEntity.fromDosojinRaw(rawGem),
            },
        );

        if (updateRes.error) {
            return this.shutdownService.shutdownWithError(
                new NestError(`Error while initializing gem order ${job.data.orderId}: ${updateRes.error}`),
            );
        }

        if (active) {
            this.logger.log(`Successful Initialization of Gem # ${leftPad(job.data.orderId.toString(), 20)}`);
            await this.dosojinQueue.add(`@@dosojin/${this.circuit.name}/run`, {
                orderId: job.data.orderId,
            });
        } else {
            this.logger.log(`Invalid Initialization of Gem # ${leftPad(job.data.orderId.toString(), 20)}`);
        }
    }

    /**
     * Module Initialization and task registration
     */
    public async onModuleInit(): Promise<void> {
        const signature: InstanceSignature = await this.outrospectionService.getInstanceSignature();
        this.logger.log(`Initializing Circuit ${this.circuit.name}`);
        DosojinRunnerScheduler.register(this);

        if (signature.name === 'worker') {
            this.dosojinQueue
                .process(`@@dosojin/${this.circuit.name}/initialization`, 1, this.initializeTask.bind(this))
                .then(console.log)
                .catch(this.shutdownService.shutdownWithError);

            this.dosojinQueue
                .process(`@@dosojin/${this.circuit.name}/run`, 1, this.runTask.bind(this))
                .then(console.log)
                .catch(this.shutdownService.shutdownWithError);
        }
    }
}
