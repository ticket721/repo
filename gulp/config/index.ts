import { GanacheConfig, GethConfig, NetworkConfig, RemoteConfig } from '../../network/config';
import { ContractsConfig }                                                   from '../../contracts/config';
import { array, constant, Decoder, number, object, oneOf, optional, string } from '@mojotech/json-type-validation';

/**
 * Configuration required to use the T721 Monorepo
 */
export interface T721Config {
    name: string;
    network: NetworkConfig;
    contracts: ContractsConfig;
    dev: DevConfig;
}

/**
 * Base class to extend in each main module
 */
export abstract class Engine<Config> {

    config: Config;
    name: string;

    abstract async run(): Promise<void>;
    abstract async clean(): Promise<void>;
}

/**
 * Dev mode variables
 */
export interface DevConfig {
    vaultereumHost: string;
    vaultereumPort: number;
    vaultereumProtocol: string;
    vaultereumEthHost: string;
    vaultereumEthPort: number;
    vaultereumEthProtocol: string;
    vaultereumEthNetId: number;
    vaultereumToken: string;

    extraAdmins: string[];
    extraAdminsEth: string;
    t721adminFunds: string;
}

/**
 * TypeGuard instance to check provided JSON configs.
 */
export const DevConfigGuard: Decoder<DevConfig> = object({
    vaultereumHost: string(),
    vaultereumPort: number(),
    vaultereumProtocol: string(),
    vaultereumEthHost: string(),
    vaultereumEthPort: number(),
    vaultereumEthProtocol: string(),
    vaultereumEthNetId: number(),
    vaultereumToken: string(),

    extraAdmins: array(string()),
    extraAdminsEth: string(),
    t721adminFunds: string(),
});

