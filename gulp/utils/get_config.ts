import { T721Config } from '../config';
import { from_root }  from './from_root';
import { repo_log }   from './log';

export async function get_config(): Promise<T721Config> {

    try {
        return (await import(from_root(process.env.T721_CONFIG)));

    } catch (e) {
        repo_log.fatal('Could not load config');
        repo_log.fatal(e);
        process.exit(1);
    }

}

