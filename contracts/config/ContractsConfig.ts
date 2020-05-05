import { array, boolean, Decoder, object, oneOf, optional }  from '@mojotech/json-type-validation';
import { ContractsModuleConfig, ContractsModuleConfigGuard } from './ContractsModuleConfig';
import {
    HDWalletProviderConfig,
    HDWalletProviderGuard,
    HttpProviderConfig,
    HttpProviderGuard, LedgerProviderGuard,
} from './ProviderConfigs';
import { PostMigrationConfigGuard, PostMigrationConfigs }    from './PostMigrationConfigs';
import { MigrationConfig, MigrationConfigGuard }             from './MigrationConfig';

/**
 * Configuration required for the contracts engine module.
 *
 * @example
 * ```
 * {
 *
 *     "modules": [
 *         {
 *             "name": "daiplus",
 *             "recover": false,
 *             "active": true,
 *             "test": false,
 *             "arguments": [
 *                 "DaiPlus Local Meta-Stablecoin v1.0",
 *                 "Dai+",
 *                 18
 *             ]
 *         }
 *     ],
 *     "artifacts": true,
 *     "provider": {
 *         "type": "hdwallet",
 *         "mnemonic": "cross uniform panic climb universe awful surprise list dutch ability label cat",
 *         "account_index": 0,
 *         "account_number": 10
 *     }
 *
 * }
 * ```
 */
export interface ContractsConfig {
    /**
     * Contracts modules. Should be found in the contracts_modules directory.
     * These modules have a special truffle-config.js that will try to fetch
     * informations from the T721 env if it finds any.
     */
    modules: ContractsModuleConfig[];

    /**
     * Provider to use to connect to the node. The node information are
     * fetched from the portal and directly injected into the truffle-config.js of
     * the contracts_modules
     */
    provider: HttpProviderConfig | HDWalletProviderConfig;

    /**
     * Actions to trigger once the migration is complete.
     * ex: Etherscan Contract Verification
     */
    post_migration?: PostMigrationConfigs;

    /**
     * List of modules and truffle migration steps to invoke
     */
    migrations: MigrationConfig[]
}

/**
 * TypeGuard instance to check provided JSON configs.
 */
export const ContractsConfigGuard: Decoder<ContractsConfig> = object({
    modules: array(ContractsModuleConfigGuard),
    provider: oneOf(HttpProviderGuard, HDWalletProviderGuard, LedgerProviderGuard),
    post_migration: optional(PostMigrationConfigGuard),
    migrations: array(MigrationConfigGuard)
});
