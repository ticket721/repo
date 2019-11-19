import { from_root }     from '../../gulp/utils/from_root';
import * as fs           from 'fs';
import * as path         from 'path';
import { contracts_log } from './contracts_log';

export interface RepoMigrationStep {
    name: string;
    migration_number: number;
    args: any;
}

export interface RepoMigrationStatus {
    name: string;
    status: boolean;
    history: RepoMigrationStep[];
}

/**
 * Utility to check if artifacts directory exists for provided network name
 * If it doesn't, creates it.
 *
 * @param net_name
 */
export function check_artifacts_dir(net_name: string): RepoMigrationStatus[] {

    const artifact_dir = from_root(path.join('artifacts', net_name));

    if (!fs.existsSync(artifact_dir)) {
        contracts_log.info(`check_artifacts_dir | create ${net_name} artifacts directory and migration tracker`);
        fs.mkdirSync(artifact_dir);
        fs.writeFileSync(path.join(artifact_dir, 'migration.json'), JSON.stringify([]));
    }

    const migration_statuses: RepoMigrationStatus[] = JSON.parse(fs.readFileSync(path.join(artifact_dir, 'migration.json')).toString());

    return migration_statuses;

}

