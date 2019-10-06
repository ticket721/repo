import { GanacheConfig, NetworkConfig } from '../config';
import * as Dockerode                   from 'dockerode';
import { network_log }                  from '../utils/network_log';
import { pull_image }                   from '../utils/pull_image';
import { run_ganache }                  from '../utils/run_ganache';

/**
 *
 * Pulls & Runs image provided in `GanacheConfig` section.
 *
 * @param config
 * @constructor
 */
export async function GanacheRunner(config: NetworkConfig): Promise<void> {

    const docker = new Dockerode();

    try {
        await pull_image(docker, (config.config as GanacheConfig).image, (config.config as GanacheConfig).version);
    } catch (e) {
        network_log.fatal(`GanacheRunner | error while pulling ${(config.config as GanacheConfig).image}:${(config.config as GanacheConfig).version}`);
        network_log.fatal(e);
        process.exit(1);
    }

    try {
        await run_ganache(docker, config);
    } catch (e) {
        network_log.fatal(`GanacheRunner | error while creating ${(config.config as GanacheConfig).image}:${(config.config as GanacheConfig).version} (${(config.config as GanacheConfig).container_name})`);
        network_log.fatal(e);
        process.exit(1);
    }

}
