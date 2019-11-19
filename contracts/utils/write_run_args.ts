import { from_root } from '../../gulp/utils/from_root';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Write run specific script that will be imported when running any truffle command
 *
 * @param args
 */
export function write_run_args(args: any): void {
    const run_args_script = from_root(path.join('contracts', 'run_args.js'));
    const content = `
    module.exports = ${JSON.stringify(args, null, 4)} 
    `;
    fs.writeFileSync(run_args_script, content);
}
