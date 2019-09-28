import { from_root } from '../../gulp/utils/from_root';
import * as path from 'path';
import * as fse from 'fs-extra';

export function clear_build(mod: string): void {
    const build_dir_path = from_root(path.join('contracts', 'contracts_modules', mod, 'build'));

    if (fse.existsSync(build_dir_path)) {
        fse.removeSync(build_dir_path);
    }

}
