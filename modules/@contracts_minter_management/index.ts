import { ScriptStepExportFormat, ScriptStepResponseFormat } from '../../contracts/config/ScriptStepExportFormat';
import { ContractsConfig }                                  from '../../contracts/config';
import { Wallet, utils }                                    from 'ethers';
import * as fs                                              from 'fs';
import { contracts_log }                                    from '../../contracts/utils/contracts_log';
import { RocksideApi }                                      from '@rocksideio/rockside-wallet-sdk/lib/api';

async function prepare_minters(config: ContractsConfig, args?: any): Promise<ScriptStepResponseFormat> {
    const minterRet: string[] = [];
    const identityRet: string[] = [];

    switch (args.mode) {
        case 'development': {
            contracts_log.info(`MinterManagement | generating 10 mock minter addresses`);
            for (let idx = 0; idx < args.count; ++idx) {
                const wallet = Wallet.createRandom();
                const address = wallet.address;
                const formattedAddress = utils.getAddress(address);
                fs.writeFileSync(`/tmp/ROCKSIDE_MOCK_EOA_${formattedAddress}`, wallet.privateKey);
                const identitywallet = Wallet.createRandom();
                const identityAddress = identitywallet.address;
                const formattedIdentityAddress = utils.getAddress(identityAddress);
                fs.writeFileSync(`/tmp/ROCKSIDE_MOCK_IDENTITY_${formattedIdentityAddress}`, formattedAddress);
                minterRet.push(formattedAddress);
                identityRet.push(formattedIdentityAddress);
                contracts_log.success(`MinterManagement | generated => ${formattedAddress}`);
            }
            contracts_log.success(`MinterManagement | generated 10 mock minter addresses`);
            break;
        }

        case 'production': {
            const endpoint = args.endpoint;
            const networkId = parseInt(args.network_id, 10);
            const networkName = args.network_name;
            const tokenEnvName = args.token_var_name;

            const api = new RocksideApi({
                apikey: process.env[tokenEnvName],
                baseUrl: endpoint,
                network: [networkId, networkName] as any
            });

            for (let idx = 0; idx < args.count; ++idx) {

                const forwarder = process.env[args.forwarder];

                const identityEoa = await api.createEOA();
                contracts_log.success(`MinterManagement | generated identity eoa => ${identityEoa.address}`);
                const identity = await api.createIdentity(forwarder, identityEoa.address);
                identityRet.push(utils.getAddress(identity.address));
                contracts_log.success(`MinterManagement | generated identity => ${identity.address}`);

                const eoa = await api.createEOA();
                minterRet.push(utils.getAddress(eoa.address));
                contracts_log.success(`MinterManagement | generated eoa => ${eoa.address}`);
            }

        }

    }

    return {
        status: null,
        artifacts: [
            {
                name: 'minters.json',
                content: JSON.stringify(minterRet, null, 4)
            },
            {
                name: 'identities.json',
                content: JSON.stringify(identityRet, null, 4)
            },
        ],
    };
}

export default {
    methods: {
        prepare_minters,
    },
} as ScriptStepExportFormat;
