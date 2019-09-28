import * as fs           from 'fs';
import { from_root }     from '../../gulp/utils/from_root';
import { contracts_log } from './contracts_log';
import { Portalize }     from 'portalize';

/**
 * Utility to check if portal has been created in the contracts directory
 */
export function check_contracts_portal(): void {

    if (!fs.existsSync(from_root('contracts/portal'))) {
        contracts_log.fatal(`check_contracts_portal | missing portal at ${from_root('contracts/portal')}`);
        process.exit(1);
    }

    Portalize.get.setPortal(from_root('contracts/portal'));
    Portalize.get.setModuleName('contracts');

    if (!Portalize.get.requires({
        file: 'network.json',
        from: 'network',
        action: 'add'
    })) {
        contracts_log.fatal(`check_contracts_portal | missing network.json configuration`);
        process.exit(1);
    }

}
