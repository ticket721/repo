import { get_config } from '../../gulp/utils/get_config';
import { server_log } from './server_log';
import * as VaultClientBuilder from 'node-vault';

const devPassword = 'thisisadevaccount';

export async function configureVaultereum(): Promise<void> {
    server_log.log(`Running configureVaultereum`);
    const config = await get_config();

    const client = VaultClientBuilder({
        apiVersion: 'v1',
        endpoint: `${config.dev.vaultereumProtocol}://${config.dev.vaultereumHost}:${config.dev.vaultereumPort}`,
        token: config.dev.vaultereumToken
    });

    try {
        await client.read('ethereum/config');
        server_log.log(`Vaultereum already configured`)
    } catch (e) {
        if (
            e.message.indexOf(
                'the ethereum backend is not configured properly',
            ) !== -1
        ) {
            await client.write('ethereum/config', {
                rpc_url: `${config.dev.vaultereumEthProtocol}://${config.dev.vaultereumEthHost}:${config.dev.vaultereumEthPort}`,
                chain_id: config.dev.vaultereumEthNetId,
            });
            server_log.log(`Configuring Vaultereum to point on ${config.network.protocol}://${config.network.host}:${config.network.port}@${config.network.network_id}`)
        } else {
            throw e;
        }
    }
    server_log.log(`Completed configureVaultereum`);
}

export async function adminRegistration(): Promise<void> {
    server_log.log(`Running adminRegistration`);
    const config = await get_config();
    const extraAdmins = config.dev ? config.dev.extraAdmins : [];

    if (extraAdmins.length === 0) {
        server_log.log('No Admins to upload')
    }

    const client = VaultClientBuilder({
        apiVersion: 'v1',
        endpoint: `${config.dev.vaultereumProtocol}://${config.dev.vaultereumHost}:${config.dev.vaultereumPort}`,
        token: config.dev.vaultereumToken
    });

    let idx = 0;
    for (const admin of extraAdmins) {
        server_log.log(`Importing ${admin.toLowerCase()} into vaultereum`);
        try {
            await client.write(`ethereum/import/admin_${idx}`, {
                path: `/dev_admin_keystores/${admin.toLowerCase()}.json`,
                passphrase: devPassword,
            });
            server_log.log(`Imported ${admin.toLowerCase()} into vaultereum`);
        } catch (e) {
            if (e.message.indexOf(`account admin_${idx} exists`) !== -1) {
                server_log.log(`Admin ${admin.toLowerCase()} already imported`);
            } else {
                throw e;
            }
        }
        ++idx;
    }

    server_log.log(`Completed adminRegistration`);
}

