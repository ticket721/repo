import { ContractsConfig, ContractsConfigGuard } from './config';
import { Engine }                                from '../gulp/config';
import { contracts_log, module_log }             from './utils/contracts_log';
import { check_contracts_portal }                from './utils/check_contracts_portal';
import { print_contracts_config } from './utils/print_contracts_config';
import { from_root }              from '../gulp/utils/from_root';
import { truffle_migrate }        from './utils/truffle_migrate';
import { clear_build }            from './utils/clear_build';
import { save_build }             from './utils/save_build';
import { recover_build }          from './utils/recover_build';
import { truffle_test }           from './utils/truffle_test';
import * as path                  from 'path';
import { portal_injection }       from './utils/portal_injection';
import { clean_portal }           from './utils/clean_portal';

export class ContractsEngine extends Engine<ContractsConfig> {

    constructor(config: ContractsConfig, name: string) {
        super();
        this.config = config;
        this.name = name;

        contracts_log.info('ContractsEngine::constructor | started');
        contracts_log.info('');
        try {
            ContractsConfigGuard.runWithException(this.config);
        } catch (e) {
            contracts_log.fatal(`ContractsEngine::constructor | error in configuration`);
            contracts_log.fatal(`at ${e.at}`);
            contracts_log.fatal(e.message);
            process.exit(1);
        }
        check_contracts_portal();
        print_contracts_config(config);
        contracts_log.success('ContractsEngine::constructor | completed');

    }


    public async run(): Promise<void> {
        console.log();
        contracts_log.info('ContractsEngine::run | started');
        const current_dir = process.cwd();

        for (const mod of this.config.modules) {
            const modlog = module_log(mod.name);

            try {
                modlog.info(`ContractsEngine::run | clearing any previous build artifacts`);
                clear_build(mod.name);
                modlog.success(`ContractsEngine::run | finished clearing build artifacts`);
            } catch (e) {
                modlog.fatal(`ContractsEngine::run | cannot clear build directory`);
                modlog.fatal(e);
                process.exit(1);
            }

            if (mod.recover) {
                modlog.info(`ContractsEngine::run | recovering previous build artifacts`);
                recover_build(mod.name, this.name);
                modlog.success(`ContractsEngine::run | recovered previous build artifacts`);
            }

            try {
                process.chdir(from_root(`contracts/contracts_modules/${mod.name}`));
            } catch (e) {
                modlog.fatal(`ContractsEngine::run | cannot change directory to ${mod.name} module`);
                modlog.fatal(e);
                process.exit(1);
            }

            if (mod.test) {

                try {

                    modlog.info(`ContractsEngine::run | starting tests`);
                    await truffle_test(mod.name);
                    modlog.success(`ContractsEngine::run | finished tests`);

                } catch (e) {

                    modlog.fatal(`ContractsEngine::run | command 'truffle test' exited with code ${e}`);
                    process.exit(1);

                }

            }

            try {
                modlog.info(`ContractsEngine::run | starting migration`);
                await truffle_migrate(mod.name, this.name);
                modlog.success(`ContractsEngine::run | finished migration`);
            } catch (e) {
                modlog.fatal(`ContractsEngine::run | command 'truffle migrate' exited with code ${e}`);
                process.exit(1);
            }

            if (this.config.artifacts === true) {
                modlog.info(`ContractsEngine::run | saving build artifacts`);
                save_build(mod.name, this.name);
                modlog.success(`ContractsEngine::run | saving build artifacts`);
            }

            const build_dir = from_root(path.join('contracts', 'contracts_modules', mod.name, 'build'));

            try {
                modlog.info(`ContractsEngine::run | saving build & migration artifacts to portal`);
                portal_injection(build_dir, mod.name);
                modlog.success(`ContractsEngine::run | saved build & migration artifacts to portal`);
            } catch (e) {
                modlog.fatal(`ContractsEngine::run | error when saving build artifacts to portal`);
                modlog.fatal(e);
                process.exit(1);
            }

        }

        process.chdir(current_dir);
        contracts_log.success('ContractsEngine::run | completed');
    }

    public async clean(): Promise<void> {
        console.log();
        contracts_log.info('ContractsEngine::run | started');
        await clean_portal();
        contracts_log.success('ContractsEngine::run | completed');
    }

}
