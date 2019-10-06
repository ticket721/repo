import * as Dockerode    from 'dockerode';
import { NetworkConfig } from '../config';
import { network_log }   from './network_log';
import { GethConfig }    from '../config/GethConfig';
const Web3 = require('web3');

/**
 * Utility to create and run a ganache docker container.
 *
 * @param docker
 * @param config
 */
export async function run_geth(docker: Dockerode, config: NetworkConfig) {
    const geth_config: GethConfig = config.config as GethConfig;
    network_log.info(`Docker::createContainer | creating ${geth_config.image}:${geth_config.version} (${geth_config.container_name})`);
    const container = await docker.createContainer({
            Image: `${geth_config.image}:${geth_config.version}`,
            ExposedPorts: {
                '8545': {}
            },
            Cmd: [
                '--rpc', '--rpcport=8545', '--rpcaddr=0.0.0.0', '--rpccorsdomain=*', '--nodiscover', '--maxpeers=0', '--rpcapi=eth,net,web3'
            ],
            Env: [
                `ACCOUNT_NUMBER=${geth_config.accounts}`,
                `NET_ID=${config.network_id}`,
                "DATADIR=/tmp/data",
                `MNEMONIC=${geth_config.mnemonic}`
            ],
            Tty: true,
            HostConfig: {
                AutoRemove: true,
                PortBindings: {
                    '8545': [
                        {
                            HostPort: config.port.toString()
                        }
                    ]
                }
            },
            name: geth_config.container_name
        }
    );
    await container.start();

    network_log.info(`Docker::createContainer | starting liveness check, it takes several minutes !`);
    while (true) {
        try {
            const web3 = new Web3(new Web3.providers.HttpProvider(`${config.protocol}://${config.host}:${config.port}`));
            const coinbase = await web3.eth.getCoinbase();
            break ;
        } catch (e) {
            network_log.warn(`Docker::createContainer | no response retrying in 30 sec`);
            network_log.warn(e.message);
            network_log.warn();
            await new Promise((ok, ko) => setTimeout(ok, 30000));
        }
    }

    network_log.info(`Docker::createContainer | waiting for all accounts to be unlocked`);
    await new Promise((ok, ko) => setTimeout(ok, 30000));

    network_log.info(`Docker::createContainer | dummy tx to check DAG completion, it can take several minutes !`);
    const web3 = new Web3(new Web3.providers.HttpProvider(`${config.protocol}://${config.host}:${config.port}`));
    const coinbase = await web3.eth.getCoinbase();
    const receipt = await web3.eth.sendTransaction({
        from: coinbase,
        to: '0x0000000000000000000000000000000000000000',
        value: 1
    });

    network_log.info(`Docker::createContainer | tx was mined, dag was created, geth is ready`);
}
