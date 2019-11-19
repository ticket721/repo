import * as fse      from 'fs-extra';
import * as path     from 'path';
import { Portalize } from 'portalize';
import { from_root } from '../../gulp/utils/from_root';

/**
 * Utility that takes a build directory and creates an artifact containing all directory informations
 * inside the portal
 *
 * @param path_to_build
 * @param module_name
 */
export function portal_injection(path_to_build: string, module_name: string): void {
    const files = fse.readdirSync(path.join(path_to_build, 'contracts'));

    const artifact = {};

    for (const file of files) {
        const content = JSON.parse(fse.readFileSync(path.join(path_to_build, 'contracts', file)));
        const filename = file.split('.').slice(0, -1).join('.');

        artifact[filename] = content;
    }

    Portalize.get.setPortal(from_root('contracts/portal'));
    Portalize.get.setModuleName('contracts');

    if (fse.existsSync(from_root(`contracts/portal/contracts/${module_name}.json`))) {
        fse.unlinkSync(from_root(`contracts/portal/contracts/${module_name}.json`)) ;
    }

    Portalize.get.add(`${module_name}.json`, artifact);

}
