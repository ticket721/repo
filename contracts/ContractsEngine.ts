import { ContractsConfig, ContractsConfigGuard, ContractsModuleConfig } from './config';
import { Engine }                                                       from '../gulp/config';
import { contracts_log, migration_log, module_log }                     from './utils/contracts_log';
import { check_contracts_portal }                                       from './utils/check_contracts_portal';
import { print_contracts_config }                                       from './utils/print_contracts_config';
import { from_root }                                                    from '../gulp/utils/from_root';
import { truffle_migrate }                                              from './utils/truffle_migrate';
import { clear_build }                                                  from './utils/clear_build';
import { save_build }                                                   from './utils/save_build';
import { recover_build }                                                from './utils/recover_build';
import { truffle_test }                                                 from './utils/truffle_test';
import * as path                                                        from 'path';
import { portal_injection }                                            from './utils/portal_injection';
import { clean_portal }                                                from './utils/clean_portal';
import { clear_upgradeable_build }                                     from './utils/clear_upgradeable_build';
import { save_upgradeable_build }                                      from './utils/save_upgradeable_build';
import { recover_upgradeable_build }                                   from './utils/recover_upgreadable_build';
import { check_artifacts_dir, RepoMigrationStatus, RepoMigrationStep } from './utils/check_artifacts_dir';
import { update_migration }                                            from './utils/update_migration';
import { MigrationStepConfig }                                         from './config/MigrationConfig';
import { check_build }                                                 from './utils/check_build';
import { clear_run_args }                                              from './utils/clear_run_args';
import { write_run_args }                                              from './utils/write_run_args';

/**
 * Contracts Engine, used to consume `ContractsConfiguration` objects and do the following:
 *
 * - For each contracts module:
 *  - Run tests if required
 *  - Recover previous build artifacts if required
 *  - Run Truffle Migration
 *  - Save build artifacts if required
 *  - Run post migration actions if any is defined
 *  -
 */
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
        print_contracts_config(config);
        contracts_log.success('ContractsEngine::constructor | completed');

    }

    /**
     * Utility to execute a set of truffle migration files on a specified contract module.
     * Updates and saves all generated artifacts
     *
     * @param mod
     * @param step
     * @param mig
     */
    private async process_module(mod: ContractsModuleConfig, step: MigrationStepConfig, mig: string) {

        const modlog = module_log(mig, mod.name);

        // #1 Clear previous builds from the contracts directory
        try {
            modlog.info(`ContractsEngine::process_module | clearing any previous build artifacts`);
            clear_build(mod.name);
            clear_run_args();
            if (mod.upgradeable) {
                clear_upgradeable_build(mod.name);
            }
            modlog.success(`ContractsEngine::process_module | finished clearing build artifacts`);
        } catch (e) {
            modlog.fatal(`ContractsEngine::process_module | cannot clear build directory`);
            modlog.fatal(e);
            process.exit(1);
        }

        // #2 If any artifact exists, recover them into contract build directory
        if (check_build(mod.name, this.name)) {
            modlog.info(`ContractsEngine::run | recovering previous build artifacts`);
            recover_build(mod.name, this.name);
            if (mod.upgradeable) {
                recover_upgradeable_build(mod.name, this.name);
            }
            modlog.success(`ContractsEngine::run | recovered previous build artifacts`);
        } else {
            modlog.info(`ContractsEngine::run | no saved build artifacts`);
        }

        // #3 Inject arguments if they exist
        if (step.args) {
            modlog.info(`ContractsEngine::run | write run specific arguments`);
            write_run_args(step.args);
            modlog.success(`ContractsEngine::run | written run specific arguments`);
        }

        // #4 Change current directory to contract module directory
        try {
            process.chdir(from_root(`modules/@contracts_${mod.name}`));
        } catch (e) {
            modlog.fatal(`ContractsEngine::run | cannot change directory to ${mod.name} module`);
            modlog.fatal(e);
            process.exit(1);
        }

        // #5 Run contracts tests if required
        if (step.test) {

            try {

                modlog.info(`ContractsEngine::run | starting tests`);
                await truffle_test(mod.name, mig);
                modlog.success(`ContractsEngine::run | finished tests`);

            } catch (e) {

                modlog.fatal(`ContractsEngine::run | command 'truffle test' exited with code ${e}`);
                process.exit(1);

            }

        }

        // #6 Run migration range
        try {
            modlog.info(`ContractsEngine::run | starting migration`);
            await truffle_migrate(mod.name, mig, this.name, step.range[0], step.range[1]);
            modlog.success(`ContractsEngine::run | finished migration`);
        } catch (e) {
            modlog.fatal(`ContractsEngine::run | command 'truffle migrate' exited with code ${e}`);
            process.exit(1);
        }

        //if (this.config.post_migration) {
        //    for (const post_migration_module of this.config.post_migration) {
        //        modlog.info(`ContractsEngine::run | starting post migration module ${post_migration_module.type}`);
        //        try {
        //            switch (post_migration_module.type) {
        //                case 'etherscan_verify': {
        //                    await EtherscanVerify(this.config, post_migration_module, mod.name, this.name);
        //                    break ;
        //                }
        //            }
        //        } catch (e) {
        //            modlog.fatal(`ContractsEngine::run | post migration module ${post_migration_module.type} crashed`);
        //            process.exit(1);
        //        }
        //        modlog.success(`ContractsEngine::run | finished post migration module ${post_migration_module.type}`);
        //    }
        //}

        // #7 Save build artifacts to artifacts directory
        modlog.info(`ContractsEngine::run | saving build artifacts`);
        save_build(mod.name, this.name);
        if (mod.upgradeable) {
            save_upgradeable_build(mod.name, this.name);
        }
        modlog.success(`ContractsEngine::run | saving build artifacts`);

        const build_dir = from_root(path.join('modules', `@contracts_${mod.name}`, 'build'));

        // #8 Save build artifacts to portal
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

    /**
     * Main method. Required network configuration setup before being called. Manages all
     * the contracts modules, migrations, test, post migrations etc ...
     */
    public async run(): Promise<void> {
        console.log();
        contracts_log.info('ContractsEngine::run | started');
        check_contracts_portal();
        const current_dir = process.cwd();

        const modules = {};

        for (const mod of this.config.modules) {
            modules[mod.name] = mod;
            contracts_log.info(`ContractsEngine::run | loaded [ ${mod.name} ]`);
        }

        let migration_status: RepoMigrationStatus[] = null;

        try {
            contracts_log.info(`ContractsEngine::run | setting up ${this.name} artifacts directory`);
            migration_status = check_artifacts_dir(this.name);
            contracts_log.success(`ContractsEngine::run | ${this.name} artifacts directory is ready`);
        } catch (e) {
            contracts_log.fatal(`ContractsEngine::run | cannot setup artifacts directory`);
            contracts_log.fatal(e);
            process.exit(1);
        }

        for (const migration of this.config.migrations) {

            const miglog = migration_log(migration.name);

            if (migration_status.findIndex((elem: RepoMigrationStatus) => elem.name === migration.name && elem.status === true) !== -1) {
                miglog.info(`ContractsEngine::run | skipping migration ${migration.name}`);
                continue;
            }

            miglog.info(`ContractsEngine::run | starting migration ${migration.name}`);

            let step_idx = 1;

            const history: RepoMigrationStep[] = [];

            for (const step of migration.serie) {
                miglog.info(`ContractsEngine::run | starting step [ ${step_idx} / ${migration.serie.length} ] on ${step.name} from truffle migration ${step.range[0]} to ${step.range[1]}`);

                await this.process_module(modules[step.name], step, migration.name);

                for (let history_idx = step.range[0]; history_idx <= step.range[1]; ++history_idx) {
                    history.push({
                        name: step.name,
                        args: step.args,
                        migration_number: history_idx
                    });
                }

                ++step_idx;
            }

            migration_status.push({
                name: migration.name,
                status: true,
                history
            });

            miglog.success(`ContractsEngine::run | finished migration ${migration.name}`);


            update_migration(this.name, migration_status);
        }

        process.chdir(current_dir);
        contracts_log.success('ContractsEngine::run | completed');
    }

    /**
     * Cleans all work previously done in the portal by the ContractsEngine
     */
    public async clean(): Promise<void> {
        console.log();
        contracts_log.info('ContractsEngine::clean | started');
        await clean_portal();
        contracts_log.success('ContractsEngine::clean | completed');
    }

}
