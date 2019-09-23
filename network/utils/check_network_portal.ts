import * as fs         from 'fs';
import { from_root }   from '../../gulp/utils/from_root';
import { network_log } from './network_log';

/**
 * Utility to check if portal has been created in the network directory
 */
export function check_network_portal(): void {
    if (!fs.existsSync(from_root('network/portal'))) {
        network_log.fatal(`Missing portal at ${from_root('network/portal')}`);
        process.exit(1);
    }
}
