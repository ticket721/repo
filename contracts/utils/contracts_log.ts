import { Signale }  from 'signale';
import { core_log } from '../../gulp/utils/log';

/**
 * Contracts Logging Utility
 */
export const contracts_log: Signale = core_log.scope('🔗');

export const module_log = (migration_name: string, module_name: string): Signale => core_log.scope('🔗', migration_name, module_name);
export const migration_log = (migration_name: string): Signale => core_log.scope('🔗', migration_name);

