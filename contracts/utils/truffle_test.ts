import {spawn}        from 'child_process';
import { module_log } from './contracts_log';

/**
 * Utility to run `truffle test` commands
 *
 * @param module_name
 * @param mig
 */
export async function truffle_test(module_name: string, mig: string): Promise<void> {

    return new Promise((ok: any, ko: any): void => {

        let truffle;
        const modlog = module_log(mig, module_name);

        try {
            truffle = spawn('truffle', ['test']);
            modlog.info(`Spawning command: ${truffle.spawnargs.join(' ')}`);
        } catch (e) {
            modlog.fatal(`Could not run command 'truffle migrate'`);
            modlog.fatal(e);
            process.exit(1);
        }

        truffle.stdout.on('data', (data: string): void => {
            data.toString().split('\n').forEach((line: string): void => (modlog as any).spawnlog(line));
        });

        truffle.stderr.on('data', (data: string): void => {
            data.toString().split('\n').forEach((line: string): void => (modlog as any).spawnerr(line));
        });

        truffle.on('close', (code): void => {
            if (code !== 0) {
                ko(code);
            } else {
                ok();
            }
        });

    })

}
