import { from_root } from '../../gulp/utils/from_root';
import * as path from 'path';
import * as fse from 'fs-extra';

/**
 * Utility to copy the stored upgradeable artifact back in the specified contract module
 *
 * @param module_name
 * @param net_name
 */
export function recover_upgradeable_build(module_name: string, net_name: string): void {
    const build_dir_path = from_root(path.join('contracts', 'contracts_modules', module_name, '.openzeppelin'));
    const artifact_dir_path = from_root(path.join('artifacts', net_name, module_name, 'upgradeable'));

    if (fse.existsSync(artifact_dir_path)) {
        fse.copySync(artifact_dir_path, build_dir_path);
    }

}
