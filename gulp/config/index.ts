import { NetworkConfig }   from '../../network/config';
import { ContractsConfig } from '../../contracts/config';

/**
 * Configuration required to use the T721 Monorepo
 */
export interface T721Config {
    name: string;
    network: NetworkConfig;
    contracts: ContractsConfig;
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

