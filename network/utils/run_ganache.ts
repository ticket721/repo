import * as Dockerode                   from 'dockerode';
import { network_log }                  from './network_log';
import { GanacheConfig, NetworkConfig } from '../config';

/**
 * Utility to create and run a ganache docker container.
 *
 * @param docker
 * @param config
 */
export async function run_ganache(docker: Dockerode, config: NetworkConfig): Promise<void> {
    const ganache_config: GanacheConfig = config.config as GanacheConfig;
    network_log.info(`Docker::createContainer creating ${ganache_config.image}:${ganache_config.version} (${ganache_config.container_name})`);
    const container = await docker.createContainer({
            Image: `${ganache_config.image}:${ganache_config.version}`,
            ExposedPorts: {
                '8545': {}
            },
            Cmd: [
                'ganache-cli',
                '-i', config.network_id.toString(),
                '-h', '0.0.0.0',
                '-p', '8545',
                '--mnemonic', ganache_config.mnemonic,
                '--gasLimit', ganache_config.gasLimit,
                '--gasPrice', ganache_config.gasPrice // 16/05
            ],
            HostConfig: {
                AutoRemove: true,
                PortBindings: {
                    '8545': [
                        {
                            HostPort: config.port.toString()
                        }
                    ]
                },
            },
            name: ganache_config.container_name
        }
    );
    await container.start();
    network_log.success(`Docker::createContainer created ${ganache_config.image}:${ganache_config.version} (${ganache_config.container_name})`);
}
