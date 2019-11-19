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
     * If value set to yes, will handle openzeppelin SDK alongside truffle
     */
    upgradeable: boolean;
}

/**
 * TypeGuard instance to check provided JSON configs.
 */
export const ContractsModuleConfigGuard: Decoder<ContractsModuleConfig> = object({
    name: string(),
    upgradeable: boolean()
});


