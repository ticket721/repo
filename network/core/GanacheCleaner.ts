import { NetworkConfig }  from '../config';
import * as Dockerode     from 'dockerode';
import { network_log }    from '../utils/network_log';
import { kill_container } from '../utils/kill_container';

/**
 * Cleans any `NetworkEngine` related work, when `type` is `ganache`.
 *
 * @param config
 * @constructor
 */
export async function GanacheCleaner(config: NetworkConfig): Promise<void> {

    const docker = new Dockerode();

    try {
        await kill_container(docker, config.config.container_name);
    } catch (e) {
        network_log.fatal(`GanacheCleaner error while killing ${config.config.container_name}`);
        network_log.fatal(e);
        process.exit(1);
    }

}
