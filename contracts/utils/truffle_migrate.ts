import {spawn}        from 'child_process';
import { module_log } from './contracts_log';

/**
 * Utility to run `truffle migrate` commands
 *
 * @param module_name
 * @param net_name
 */
export async function truffle_migrate(module_name: string, net_name: string): Promise<void> {

    return new Promise((ok: any, ko: any): void => {

        let truffle;
        const modlog = module_log(module_name);

        try {
            truffle = spawn('truffle', ['migrate', '--network', net_name]);
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
