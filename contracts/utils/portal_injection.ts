import * as fse      from 'fs-extra';
import * as path     from 'path';
import { Portalize } from 'portalize';
import { from_root } from '../../gulp/utils/from_root';

export function portal_injection(path_to_build: string, mod: string): void {
    const files = fse.readdirSync(path.join(path_to_build, 'contracts'));

    const artifact = {};

    for (const file of files) {
        const content = require(path.join(path_to_build, 'contracts', file));
        const filename = file.split('.').slice(0, -1).join('.');

        artifact[filename] = content;
    }

    Portalize.get.setPortal(from_root('contracts/portal'));
    Portalize.get.setModuleName('contracts');

    if (fse.existsSync(from_root(`contracts/portal/contracts/${mod}.json`))) {
        fse.unlinkSync(from_root(`contracts/portal/contracts/${mod}.json`)) ;
    }

    Portalize.get.add(`${mod}.json`, artifact);

}
