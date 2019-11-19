import { array, boolean, Decoder, number, object, oneOf, optional, string } from '@mojotech/json-type-validation';

/**
 * Configuration for a specific migration step
 */
export interface MigrationStepConfig {
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
export const MigrationStepConfigGuard: Decoder<MigrationStepConfig> = object({
    name: string(),
    test: boolean(),
    range: array(number()),
    args: optional(object())
});

/**
 * TypeGuard instance to check provided JSON configs.
 */
export const MigrationConfigGuard: Decoder<MigrationConfig> = object({
    name: string(),
    serie: array(MigrationStepConfigGuard)
});


