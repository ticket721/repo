import { from_root } from '../../gulp/utils/from_root';
import * as path from 'path';
import * as fse from 'fs-extra';

/**
 * Utility to clear upgradeable build directory in specified contracts module
 *
 * @param module_name
 */
export function clear_upgradeable_build(module_name: string): void {
    const build_dir_path = from_root(path.join('modules', `@contracts_${module_name}`, '.openzeppelin'));

    if (fse.existsSync(build_dir_path)) {
        const files = fse.readdirSync(build_dir_path);
        for (const file of files) {
            if (file !== 'project.json') {
                fse.removeSync(path.join(build_dir_path, file));
            }
        }
    }

}
