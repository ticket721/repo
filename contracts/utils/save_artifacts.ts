import { from_root } from '../../gulp/utils/from_root';
import * as path from 'path';
import * as fse from 'fs-extra';

/**
 * Utility to copy artifacts from a script contract module to the artifact directory
 *
 * @param module_name
 * @param net_name
 * @param artifacts
 */
export function save_artifacts(module_name: string, net_name: string, artifacts: {name: string; content: string;}[]): void {
    const dest_copy_path = from_root(path.join('artifacts', net_name, module_name, 'artifacts'));

    fse.ensureDirSync(dest_copy_path);

    for (const artifact of artifacts) {
        fse.writeFileSync(path.join(dest_copy_path, artifact.name), artifact.content);
    }

}
