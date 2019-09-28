import { from_root } from '../../gulp/utils/from_root';
import * as path from 'path';
import * as fse from 'fs-extra';

export function save_build(mod: string, net_name: string): void {
    const build_dir_path = from_root(path.join('contracts', 'contracts_modules', mod, 'build'));
    const dest_copy_path = from_root(path.join('artifacts', net_name, mod, 'build'));
    const artifact_dir = from_root(path.join('artifacts', net_name, mod));

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
