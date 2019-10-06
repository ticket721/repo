import { array, boolean, Decoder, number, object, oneOf, optional, string } from '@mojotech/json-type-validation';

/**
 * Configuration for a specific contracts module
 */
export interface ContractsModuleConfig {
    /**
     * Name of the module. Should match the directory name
     * in the contracts_modules directory
     */
    name: string;

    /**
     * If module should be deployed during migration or ignored
     */
    active: boolean;

    /**
     * If artifacts should be recovered and placed into the contracts
     * modules. Truffle will find out at what point in the migration
     * we are and will continue from there only.
     */
    recover: boolean;

    /**
     * If tests should be launched before deploying anything
     */
    test: boolean;

    /**
     * Optional arguments that are injected into the truffle-config.js in
     * the extra-config section. Can be recovered in the migration files
     * and used as pleased.
     */
    arguments?: (string | number)[];
}

/**
 * TypeGuard instance to check provided JSON configs.
 */
export const ContractsModuleConfigGuard: Decoder<ContractsModuleConfig> = object({
    name: string(),
    active: boolean(),
    recover: boolean(),
    test: boolean(),
    arguments: optional(array(oneOf<string | number>(string(), number())))
});


