import { NetworkEngine } from '../../network/NetworkEngine';
import { get_config }    from '../utils/get_config';
import { repo_log }      from '../utils/log';

/**
 * Call the `run` method on the NetworkEngine
 */
export async function network_run(): Promise<void> {

    repo_log.info(`Starting task network::run`);
    console.log();

    const config = await get_config();

    const ne: NetworkEngine = new NetworkEngine(config.network);

    await ne.run();

    console.log();
    repo_log.success(`Completed task network::run`);
}

export async function network_clean(): Promise<void> {
    repo_log.info(`Starting task network::clean`);
    console.log();

    const config = await get_config();

    const ne: NetworkEngine = new NetworkEngine(config.network);

    await ne.clean();

    console.log();
    repo_log.success(`Completed task network::clean`);

}
