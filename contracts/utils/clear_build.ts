import { from_root } from '../../gulp/utils/from_root';
import * as path from 'path';
import * as fse from 'fs-extra';

/**
 * Utility to clear build directory in specified contracts module
 *
 * @param module_name
 */
export function clear_build(module_name: string): void {
    const build_dir_path = from_root(path.join('contracts', 'contracts_modules', module_name, 'build'));

    if (fse.existsSync(build_dir_path)) {
        fse.removeSync(build_dir_path);
    }

}
