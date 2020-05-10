import { array, boolean, constant, Decoder, number, object, oneOf, optional, string } from '@mojotech/json-type-validation';

/**
 * Configuration for a specific migration step
 */
export interface MigrationTruffleStepConfig {
    /**
     * Type of the step to execute
     */
    type: 'truffle' | 'script'

    /**
     * Name of contract module to invoke
     */
    name: string;

    /**
     * True if tests should be invoked
     */
    test: boolean;

    /**
     * Truffle migration range to use
     */
    range: number[];

    /**
     *
     */
    args?: any;
}

/**
 * Configuration for a specific migration step
 */
export interface MigrationScriptStepConfig {
    /**
     * Type of the step to execute
     */
    type: 'truffle' | 'script'

    /**
     * Name of contract module to invoke
     */
    name: string;

    /**
     * Name of contract module to invoke
     */
    method: string;

    /**
     *
     */
    args?: any;
}

export type MigrationStepConfig = MigrationTruffleStepConfig | MigrationScriptStepConfig;

/**
 * Configuration for a specific migration
 */
export interface MigrationConfig {
    /**
     * Name given to the specific migration
     */
    name: string;

    /**
     * List of modules to invoke
     */
    serie: MigrationStepConfig[];
}

/**
 * TypeGuard instance to check provided JSON configs.
 */
export const MigrationTruffleStepConfigGuard: Decoder<MigrationTruffleStepConfig> = object({
    type: oneOf(constant('truffle')),
    name: string(),
    test: boolean(),
    range: array(number()),
    args: optional(object())
});

/**
 * TypeGuard instance to check provided JSON configs.
 */
export const MigrationScriptStepConfigGuard: Decoder<MigrationScriptStepConfig> = object({
    type: oneOf(constant('script')),
    name: string(),
    method: string(),
    args: optional(object())
});

/**
 * TypeGuard instance to check provided JSON configs.
 */
export const MigrationConfigGuard: Decoder<MigrationConfig> = object({
    name: string(),
    serie: array(oneOf(MigrationTruffleStepConfigGuard, MigrationScriptStepConfigGuard as any))
});


