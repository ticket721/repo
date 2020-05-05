import { repo_log }                               from '../utils/log';
import { adminRegistration, configureVaultereum } from '../../modules/@backend_tasks/AdminRegistration.dev';
import { get_config }                             from '../utils/get_config';
import { DevConfigGuard }                         from '../config';
import { check_dependencies }                     from '../utils/check_dependencies';

/**
 * Gulp task that calls the development preparation steps for the server
 */
export async function server_dev_prepare(): Promise<void> {
    repo_log.info(`Starting task server::dev::prepare`);

    await check_dependencies();

    const config = await get_config() ;

    try {
        if (config.dev) {
            DevConfigGuard.runWithException(config.dev);
        }
    } catch (e) {
        repo_log.fatal(`server_dev_prepare | error in configuration`);
        repo_log.fatal(`at ${e.at}`);
        repo_log.fatal(e.message);
        process.exit(1);

    }

    await configureVaultereum();
    await adminRegistration();

    repo_log.info(`Finished task server::dev::prepare`);
}
