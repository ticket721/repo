import { NetworkEngine } from '../../network';
import { get_config }    from '../utils/get_config';
import { repo_log }      from '../utils/log';

/**
 * Gulp task that calls the `run` method on the NetworkEngine
 */
export async function network_run(): Promise<void> {
    repo_log.info(`Starting task network::run`);
    console.log();

    const config = await get_config();

    const ne: NetworkEngine = new NetworkEngine(config.network, config.name);

    await ne.run();

    console.log();
    repo_log.success(`Completed task network::run`);
}

/**
 * Gulp task that calls the `clean` method on the NetworkEngine
 */
export async function network_clean(): Promise<void> {
    repo_log.info(`Starting task network::clean`);
    console.log();

    const config = await get_config();

    const ne: NetworkEngine = new NetworkEngine(config.network, config.name);

    await ne.clean();

    console.log();
    repo_log.success(`Completed task network::clean`);

}
