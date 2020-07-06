import { get_config }         from '../utils/get_config';
import { repo_log }           from '../utils/log';
import { ContractsEngine }    from '../../contracts';
import { check_dependencies } from '../utils/check_dependencies';

export async function contracts_run(): Promise<void> {

    repo_log.info(`Starting task contracts::run`);
    console.log();

    await check_dependencies();

    const config = await get_config();

    const ne: ContractsEngine = new ContractsEngine(config.contracts, config.name);

    await ne.run();

    console.log();
    repo_log.success(`Completed task contracts::run`);
}

export async function contracts_clean(): Promise<void> {
    repo_log.info(`Starting task contracts::clean`);
    console.log();

    await check_dependencies();

    const config = await get_config();

    const ne: ContractsEngine = new ContractsEngine(config.contracts, config.name);

    await ne.clean();

    console.log();
    repo_log.success(`Completed task contracts::clean`);

}

