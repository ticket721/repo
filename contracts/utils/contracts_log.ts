import { Signale }  from 'signale';
import { core_log } from '../../gulp/utils/log';

/**
 * Network Logging Utility
 */
export const contracts_log: Signale = core_log.scope('🔗');

export const module_log = (mod_name: string): Signale => core_log.scope('🔗', mod_name);
