/**
 * Checks if T721_CONFIG variable is set
 */
import { repo_log }           from '../utils/log';

export async function required_config(): Promise<void> {

    if (!process.env.T721_CONFIG) {
        repo_log.fatal('Missing T721_CONFIG env variable');
        process.exit(1);
    }

}

