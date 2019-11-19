import { from_root } from '../../gulp/utils/from_root';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Utility to check if contract module has a build directory saved in the artifacts directory
 *
 * @param module_name
 * @param net_name
 */
export function check_build(module_name: string, net_name: string): boolean {
    const artifact_dir = from_root(path.join('artifacts', net_name));
    const build_dir = path.join(artifact_dir, module_name, 'build');

    return fs.existsSync(build_dir);
}
