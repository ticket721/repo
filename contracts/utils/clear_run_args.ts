import { from_root } from '../../gulp/utils/from_root';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Utility to remove run_args.js script if it exists
 */
export function clear_run_args(): void {
    const run_args_script = from_root(path.join('contracts', 'run_args.js'));
    if (fs.existsSync(run_args_script)) {
        fs.unlinkSync(run_args_script);
    }
}
