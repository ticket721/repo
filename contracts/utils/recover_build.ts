import { from_root } from '../../gulp/utils/from_root';
import * as path from 'path';
import * as fse from 'fs-extra';

/**
 * Utility to copy the stored artifact back in the specified contract module
 *
 * @param module_name
 * @param net_name
 */
export function recover_build(module_name: string, net_name: string): void {
    const build_dir_path = from_root(path.join('modules', `@contracts_${module_name}`, 'build'));
    const artifact_dir_path = from_root(path.join('artifacts', net_name, module_name, 'build'));

    if (fse.existsSync(artifact_dir_path)) {
        fse.copySync(artifact_dir_path, build_dir_path);
    }

}
