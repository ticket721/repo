import { from_root } from '../../gulp/utils/from_root';
import * as path from 'path';
import * as fse from 'fs-extra';

/**
 * Utility to copy an upgradeable build directory from a contract module to the artifact directory
 *
 * @param module_name
 * @param net_name
 */
export function save_upgradeable_build(module_name: string, net_name: string): void {
    const build_dir_path = from_root(path.join('modules', `@contracts_${module_name}`, '.openzeppelin'));
    const dest_copy_path = from_root(path.join('artifacts', net_name, module_name, 'upgradeable'));
    const artifact_dir = from_root(path.join('artifacts', net_name, module_name));

    fse.ensureDirSync(artifact_dir);

    if (fse.existsSync(dest_copy_path)) {
        fse.removeSync(dest_copy_path);
    }

    if (fse.existsSync(build_dir_path)) {
        fse.copySync(build_dir_path, dest_copy_path);
    } else {
        throw new Error(`Cannot find artifacts directory: ${build_dir_path}`);
    }

}
