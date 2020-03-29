import { Column, CreateDateColumn, Entity, UpdateDateColumn } from '@iaminfinity/express-cassandra';
import { RawGem } from 'dosojin';
import { ECAAG } from '@lib/common/utils/ECAAG.helper';

/**
 * Raw Gem Entity stored in the database
 */
export interface RawGemEntity {
    /**
     * Current Gem Action Type
     */
    action_type: 'operation' | 'transfer';

    /**
     * Operation Status, defined if current state is operation
     */
    operation_status: {
        /**
         * Current status of the operation
         */
        status: string;

        /**
         * Current layer of the operation
         */
        layer: number;

        /**
         * Dosojin containing operation
         */
        dosojin: string;

        /**
         * List of operations to perform
         */
        operation_list: string[];
    };

    /**
     * Transfer Status, defined if current state is transfer
     */
    transfer_status: {
        /**
         * Connector Status
         */
        connector: {
            /**
             * Current status of the connector
             */
            status: string;

            /**
             * Current Layer containing the connector
             */
            layer: number;

            /**
             * Dosojin containing the connector
             */
            dosojin: string;

            /**
             * Name of the Connector
             */
            name: string;
        };

        /**
         * Receptacle Status
         */
        receptacle: {
            /**
             * Current status of the receptacle
             */
            status: string;

            /**
             * Current layer of the receptacle
             */
            layer: number;

            /**
             * Dosojin Containing the receptacle
             */
            dosojin: string;

            /**
             * Name of the receptacle
             */
            name: string;
        };
    };

    /**
     * Global Gem Status
     */
    gem_status: 'Running' | 'Complete' | 'Error' | 'Fatal' | 'MissingReceptacle';

    /**
     * Gem Payload
     */
    gem_payload: {
        /**
         * JSON.stringified object containing all values & currencies
         */
        values: string;

        /**
         * Contains all costs
         */
        costs: {
            /**
             * Value of the cost
             */
            value: string;

            /**
             * Scope of the cost
             */
            scope: string;

            /**
             * Dosojin taking the cost
             */
            dosojin: string;

            /**
             * Name of the entity taking the cost
             */
            entity_name: string;

            /**
             * Type of the entity take the cost
             */
            entity_type: string;

            /**
             * Layer number of the dosojin
             */
            layer: number;

            /**
             * Reason message
             */
            reason: string;
        }[];
    };

    /**
     * Error information
     */
    error_info: {
        /**
         * Dosojin causing the error
         */
        dosojin: string;

        /**
         * Name of the entity causing the error
         */
        entity_name: string;

        /**
         * Type of the entity causing the error
         */
        entity_type: string;

        /**
         * Layer number of the dosojin
         */
        layer: number;

        /**
         * Error message
         */
        message: string;
    };

    /**
     * Action history
     */
    route_history: {
        /**
         * Layer index
         */
        layer: number;

        /**
         * Dosojin Name
         */
        dosojin: string;

        /**
         * Entity Name
         */
        entity_name: string;

        /**
         * Entity Type
         */
        entity_type: string;

        /**
         * Call count
         */
        count: number;
    }[];

    /**
     * Untyped gem data
     */
    gem_data: string;

    /**
     * Refresh timer for runs
     */
    refresh_timer: number;
}

/**
 * Gem Order entity, linked to a user and containing a Dosojin Gem
 */
@Entity<GemOrderEntity>({
    table_name: 'gemorder',
    key: ['id'],
    es_index_mapping: {
        discover: '.*',
    },
} as any)
export class GemOrderEntity {
    /**
     * Entity Builder
     *
     * @param go
     */
    constructor(go?: GemOrderEntity) {
        if (go) {
            this.id = go.id ? go.id.toString() : go.id;
            this.distribution_id = go.distribution_id;
            this.circuit_name = go.circuit_name;
            this.initial_arguments = go.initial_arguments;
            this.gem = go.gem;
            this.gem.operation_status = this.gem.operation_status
                ? {
                      ...this.gem.operation_status,
                      operation_list: ECAAG(this.gem.operation_status.operation_list),
                  }
                : this.gem.operation_status;
            this.gem.route_history = ECAAG(this.gem.route_history);
            this.gem.gem_payload = this.gem.gem_payload
                ? {
                      ...this.gem.gem_payload,
                      costs: ECAAG(this.gem.gem_payload.costs),
                  }
                : this.gem.gem_payload;
            this.initialized = go.initialized;
            this.refresh_timer = go.refresh_timer;
            this.created_at = go.created_at;
            this.updated_at = go.updated_at;
        }
    }

    /**
     * Unique ID that is the hash of the payment method id
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    id: string;

    /**
     * Random number used for distribution purposes
     */
    @Column({
        type: 'bigint',
    })
    // tslint:disable-next-line:variable-name
    distribution_id: number;

    /**
     * Name of the circuit to run
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    circuit_name: string;

    /**
     * Initial Arguments to pass to the circuit
     */
    @Column({
        type: 'text',
    })
    // tslint:disable-next-line:variable-name
    initial_arguments: string;

    /**
     * Raw Gem data
     */
    @Column({
        type: 'frozen',
        typeDef: '<gem>',
    })
    gem: RawGemEntity;

    /**
     * Valid if gem has been initialized
     */
    @Column({
        type: 'boolean',
    })
    initialized: boolean;

    /**
     * Timer used for the run intervals
     */
    @Column({
        type: 'int',
    })
    // tslint:disable-next-line:variable-name
    refresh_timer: number;

    /**
     * Creation timestamp
     */
    @CreateDateColumn()
    // tslint:disable-next-line:variable-name
    created_at: Date;

    /**
     * Update timestamp
     */
    @UpdateDateColumn()
    // tslint:disable-next-line:variable-name
    updated_at: Date;

    /**
     * Static helper to convert from dosojin raw format to cassandra storable format
     *
     * @param gem
     */
    static fromDosojinRaw(gem: RawGem): RawGemEntity {
        return {
            action_type: gem.action_type,
            operation_status: gem.operation_status
                ? {
                      status: gem.operation_status.status,
                      layer: gem.operation_status.layer,
                      dosojin: gem.operation_status.dosojin,
                      operation_list: gem.operation_status.operation_list || [],
                  }
                : null,
            transfer_status: gem.transfer_status,
            gem_status: gem.gem_status,
            gem_payload: {
                values: gem.gem_payload.values ? JSON.stringify(gem.gem_payload.values) : '{}',
                costs: gem.gem_payload.costs
                    ? gem.gem_payload.costs.map((cost: any): any => ({
                          ...cost,
                          value: cost.value ? JSON.stringify(cost.value) : null,
                      }))
                    : [],
            },
            error_info: gem.error_info,
            route_history: gem.route_history,
            gem_data: gem.gem_data ? JSON.stringify(gem.gem_data) : '{}',
            refresh_timer: gem.refresh_timer,
        };
    }

    /**
     * Static helper to convert from cassandra storable format to Dosojin format
     *
     * @param gem
     */
    static toDosojinRaw(gem: RawGemEntity): RawGem {
        return {
            action_type: gem.action_type,
            operation_status: gem.operation_status
                ? {
                      status: gem.operation_status.status,
                      layer: gem.operation_status.layer,
                      dosojin: gem.operation_status.dosojin,
                      operation_list: gem.operation_status.operation_list || [],
                  }
                : null,
            transfer_status: gem.transfer_status,
            gem_status: gem.gem_status,
            gem_payload: {
                values: gem.gem_payload.values ? JSON.parse(gem.gem_payload.values) : {},
                costs: gem.gem_payload.costs
                    ? gem.gem_payload.costs.map((cost: any): any => ({
                          ...cost,
                          value: cost.value ? JSON.parse(cost.value) : null,
                      }))
                    : [],
            },
            error_info: gem.error_info,
            route_history: gem.route_history || [],
            gem_data: gem.gem_data ? JSON.parse(gem.gem_data) : {},
            refresh_timer: gem.refresh_timer,
        };
    }

    /**
     * Helper to generate random distribution ID
     */
    static genOrderID(): number {
        const max = 9223372036854775807;
        return Math.floor(Math.random() * max);
    }
}
