// Docker kill container
import * as Dockerode  from 'dockerode';
import { network_log } from './network_log';

/**
 * Utility to `docker kill` the provided container
 *
 * @param docker
 * @param container_name
 */
export async function kill_container(docker: Dockerode, container_name: string) {
    try {
        const container = await docker.getContainer(container_name);
        await container.kill();
        network_log.info(`Docker::kill | ${container_name} got killed`);
    } catch (e) {}
}
