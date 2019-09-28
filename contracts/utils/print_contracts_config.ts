import { ContractsConfig, ContractsModuleConfig } from '../config';
import { contracts_log }                          from './contracts_log';

export function print_contracts_module_config(config: ContractsModuleConfig): void {
    contracts_log.info(`  Name: ${config.name}`);
    contracts_log.info(`  Active: ${config.active}`);
    contracts_log.info(`  Recover mode: ${config.recover}`);
    contracts_log.info();
}

export function print_contracts_config(config: ContractsConfig): void {


    contracts_log.info(`Contracts Module Count: ${config.modules.length}`);
    contracts_log.info();

    for (const mod of config.modules) {
        print_contracts_module_config(mod);
    }

}
