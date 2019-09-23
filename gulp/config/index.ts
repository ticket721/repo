import { NetworkConfig } from '../../network/config';
import { Signale }       from 'signale';

/**
 * Configuration required to use the T721 Monorepo
 */
export interface T721Config {
    network: NetworkConfig;
}

/**
 * Base class to extend in each main module
 */
export abstract class Engine<Config> {

    config: Config;

    abstract async run(): Promise<void>;
    abstract async clean(): Promise<void>;
}

