import { Engine }                  from '../gulp/config';
import { NetworkConfig }           from './config';
import { network_log }             from './utils/network_log';
import { print_network_config }    from './utils/print_network_config';
import { GanacheRunner }           from './core/GanacheRunner';
import { eth_node_liveness_check } from './utils/eth_node_liveness_check';
import { eth_node_check_net_id }   from './utils/eth_node_check_net_id';
import { GanacheCleaner }          from './core/GanacheCleaner';
import { GethRunner }              from './core/GethRunner';
import { GethCleaner }             from './core/GethCleaner';
import { check_network_portal }    from './utils/check_network_portal';
import { clean_portal }            from './utils/clean_portal';
import { save_portal }             from './utils/save_portal';
import { NetworkConfigGuard }      from './config/NetworkConfig';

/**
 * Network Engine, used to consume `NetworkConfiguration` objects and do the following:
 *
 * - Run and check if any instance should be created in a Docker container, performs liveness check and saves configuration to portal
 * - Clean all performed actions
 *
 */
export class NetworkEngine extends Engine<NetworkConfig> {

    constructor(config: NetworkConfig, name: string) {
        super();
        this.config = config;
        this.name = name;

        network_log.info('NetworkEngine::constructor | started');
        network_log.info('');
        try {
            NetworkConfigGuard.runWithException(this.config);
        } catch (e) {
            network_log.fatal(`NetworkEngine::constructor | error in configuration`);
            network_log.fatal(`at ${e.at}`);
            network_log.fatal(e.message);
            process.exit(1);
        }
        check_network_portal();
        print_network_config(config, name);
        network_log.info('');
        network_log.success('NetworkEngine::constructor | completed');
    }

    /**
     * Main method, used to raise any Docker container if need (if `type` is `ganache` or `geth`). Then performs
     * liveness check by retrieving current network ID and check if it matches provided one. Finally writes configuration
     * to portal, making it accessible by the Contracts Engine.
     */
    async run(): Promise<void> {
        console.log();
        network_log.info('NetworkEngine::run | started');

        switch (this.config.type) {
            case 'ganache': {
                await GanacheRunner(this.config);
                break ;
            }
            case 'geth': {
                await GethRunner(this.config);
                break ;
            }
        }

        for (let idx = 0; idx < 20; ++idx) {
            try {
                await eth_node_liveness_check(this.config.host, this.config.port, this.config.protocol, this.config.path);
            } catch (e) {
                if (idx < 19) {
                    network_log.warn();
                    network_log.warn(`NetworkEngine::run | error during liveness check [${idx} / 20]`);
                    network_log.warn(e.message);

                    await new Promise((ok: any, ko: any): void => void setTimeout(ok, 5000));

                } else {
                    network_log.fatal(`NetworkEngine::run | error during liveness check`);
                    network_log.fatal(e);
                    process.exit(1);
                }
            }
        }

        try {
            await eth_node_check_net_id(this.config.host, this.config.port, this.config.protocol, this.config.network_id, this.config.path);
        } catch (e) {
            network_log.fatal(`NetworkEngine::run | error during network id check`);
            network_log.fatal(e);
            process.exit(1);
        }

        network_log.info('NetworkEngine::run | saving config to portal');
        await save_portal(this.config, this.name);
        network_log.success('NetworkEngine::run | saved config to portal');

        network_log.success('NetworkEngine::run | completed');
    }

    /**
     * Cleans any work previously done by the `run` method. Should never crash, even if nothing to clean.
     */
    async clean(): Promise<void> {
        console.log();
        network_log.info('NetworkEngine::clean | started');

        switch (this.config.type) {
            case 'ganache': {
                await GanacheCleaner(this.config);
                break ;
            }
            case 'geth': {
                await GethCleaner(this.config);
                break ;
            }
        }

        network_log.info('NetworkEngine::clean | cleaning portal');
        await clean_portal();
        network_log.success('NetworkEngine::clean | cleaned portal');

        network_log.success('NetworkEngine::clean | completed');
    }

}
