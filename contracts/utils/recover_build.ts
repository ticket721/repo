import { from_root } from '../../gulp/utils/from_root';
import * as path from 'path';
import * as fse from 'fs-extra';

export function recover_build(mod: string, net_name: string): void {
    const build_dir_path = from_root(path.join('contracts', 'contracts_modules', mod, 'build'));
    const artifact_dir_path = from_root(path.join('artifacts', net_name, mod, 'build'));

    if (fse.existsSync(artifact_dir_path)) {
        fse.copySync(artifact_dir_path, build_dir_path);
    }

}
