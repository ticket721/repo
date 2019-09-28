import { GanacheConfig, NetworkConfig } from '../config';
import { network_log }                  from './network_log';
import { GethConfig }                   from '../config/GethConfig';

function print_ganache_config(config: GanacheConfig): void {
    network_log.info(`Mnemonic: ${config.mnemonic}`);
    network_log.info(`Ganache Image: ${config.image}`);
    network_log.info(`Ganache Container Version: ${config.version}`);
    network_log.info(`Ganache Container Name: ${config.container_name}`);
}

function print_geth_config(config: GethConfig): void {
    network_log.info(`Mnemonic: ${config.mnemonic}`);
    network_log.info(`Geth Image: ${config.image}`);
    network_log.info(`Geth Container Version: ${config.version}`);
    network_log.info(`Geth Container Name: ${config.container_name}`);
    network_log.info(`Number of accounts: ${config.accounts}`);
}

/**
 * Utility to log a summary of the given configuration
 *
 * @param config
 */
export function print_network_config(config: NetworkConfig, name: string): void {
    network_log.info(`Network Type: ${config.type}`);
    network_log.info(`Network Name: ${name}`);
    network_log.info(`Node Host: ${config.host}`);
    network_log.info(`Node Port: ${config.port}`);
    network_log.info(`Node Communication Protocol: ${config.protocol}`);
    network_log.info(`Network ID: ${config.network_id}`);

    switch (config.type) {
        case 'ganache': {
            print_ganache_config(config.config as GanacheConfig);
            break ;
        }
        case 'geth': {
            print_geth_config(config.config as GethConfig);
            break ;
        }
    }

}
