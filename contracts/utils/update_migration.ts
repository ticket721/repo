import { RepoMigrationStatus } from './check_artifacts_dir';
import { from_root }           from '../../gulp/utils/from_root';
import * as path               from 'path';
import * as fs                 from 'fs';
import { contracts_log }       from './contracts_log';

/**
 * Utility to update the migration.json file
 *
 * @param net_name
 * @param config
 */
export function update_migration(net_name: string, config: RepoMigrationStatus[]): void {
    const artifact_dir = from_root(path.join('artifacts', net_name));
    const migration_config_file = path.join(artifact_dir, 'migration.json');

    if (!fs.existsSync(migration_config_file)) {
        contracts_log.fatal(`update_migration | ${net_name} has no migration file`);
        process.exit(1);
    }

    fs.writeFileSync(migration_config_file, JSON.stringify(config, null, 4));
}
