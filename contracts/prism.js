const get_config_sync = require('../gulp/utils/get_config_sync');

const { from_root } = require('../gulp/utils/from_root');
const { Portalize } = require('portalize');
const path = require('path');
const Web3 = require('web3');
const HDWalletProvider = require("truffle-hdwallet-provider");
const {header_value_processor} = require('../network/utils/header_value_processor');
const {path_processor} = require('../network/utils/path_processor');
const {LedgerSubprovider, Web3ProviderEngine } = require('@0x/subproviders');
const ProviderSubprovider = require('web3-provider-engine/subproviders/provider');

const Eth = require('@ledgerhq/hw-app-eth').default;
const TransportNodeHid = require('@ledgerhq/hw-transport-node-hid').default;
async function ledgerEthereumNodeJsClientFactoryAsync() {
    const ledgerConnection = await TransportNodeHid.create();
    const ledgerEthClient = new Eth(ledgerConnection);
    return ledgerEthClient;
}

function from_contracts(file) {
    return path.join(path.join(path.resolve(), '../..'), file);
}

class LedgerProvider extends Web3ProviderEngine {
    constructor(connector, options, url, headers, debug) {
        super();

        this.addProvider(new LedgerSubprovider({
            baseDerivationPath: options.derivationPath,
            networkId: options.networkId,
            accountFetchingConfigs: {
                shouldAskForOnDeviceConfirmation: true,
            },
            ledgerEthereumClientFactoryAsync: ledgerEthereumNodeJsClientFactoryAsync,
        }));

        switch (connector) {
            case 'http': {
                const web3Provider = new Web3.providers.HttpProvider(url, {headers, keepAlive: false});
                web3Provider.sendAsync = web3Provider.send;
                this.addProvider(new ProviderSubprovider(web3Provider));
                break ;
            }
            case 'ws': {
                const web3Provider = new Web3.providers.WebsocketProvider(url, {headers});
                web3Provider.sendAsync = web3Provider.send;
                this.addProvider(new ProviderSubprovider(web3Provider));
                break ;
            }
        }
        this.start();
    }

    send(...args) {
        return this.sendAsync(...args);
    }

}


Portalize.get.setPortal(from_contracts('portal'));
Portalize.get.setModuleName('contracts');

try {
    const config = Portalize.get.get('network.json', {module: 'network'});

    if (!process.env.T721_CONFIG) {
        throw new Error('Missing T721_CONFIG env variable');
    }

    const t721_config = require(from_root(process.env.T721_CONFIG));

    const artifacts = {};

    for (const contract_module of t721_config.contracts.modules) {

        let artifact;
        try {
            artifact = Portalize.get.get(`${contract_module.name}.json`, {module: 'contracts'});
        } catch (e) {
            artifact = null;
        }

        artifacts[contract_module.name] = artifact;
    }

    let args = null;
    try {
        args = require('./run_args.js');
    } catch (e) {}

    let provider;

    switch (t721_config.contracts.provider.type) {
        case 'http':
            switch (t721_config.network.connector) {
                case 'http': {
                    provider = function() {
                        return new Web3.providers.HttpProvider(`${config.protocol}://${config.host}:${config.port}${path_processor(config.path || '')}`, header_value_processor(config.headers));
                    };
                    break ;
                }

                case 'ws': {
                    provider = function() {
                        return new Web3.providers.WebsocketProvider(`${config.protocol}://${config.host}:${config.port}${path_processor(config.path || '')}`, header_value_processor(config.headers));
                    };
                }
            }
            break ;
        case 'hdwallet':
            provider = function() {
                return new HDWalletProvider(
                    t721_config.contracts.provider.mnemonic,
                    `${config.protocol}://${config.host}:${config.port}${path_processor(config.path || '')}`,
                    t721_config.contracts.provider.account_index,
                    t721_config.contracts.provider.account_number,
                    t721_config.contracts.provider.derivation_path);
            };
            break ;
        case 'ledger':
            provider = function() {
                return new LedgerProvider(
                    t721_config.network.connector,
                    {
                        networkId: config.network_id,
                        derivationPath: t721_config.contracts.provider.derivation_path,

                    },
                    `${config.protocol}://${config.host}:${config.port}${path_processor(config.path || '')}`,
                    header_value_processor(config.headers)
                )
            };
            break ;
    }

    const export_data = {
        networks: {
            [config.name]: {
                network_id: config.network_id,
                provider,
                t721config: get_config_sync(),
                skipDryRun: true,
                gasPrice: config.gas_price
            }
        },
        artifacts,
        args
    };

    if (t721_config.contracts.post_migration) {
        for (const post_migration_module of t721_config.contracts.post_migration) {
            switch (post_migration_module.type) {
                case 'etherscan_verify': {
                    export_data.plugins = [
                        'truffle-plugin-verify',
                        ...(export_data.plugins || [])
                    ];
                    export_data.api_keys = {
                        etherscan: post_migration_module.api_key,
                        ...(export_data.api_keys || {})
                    };
                    break;
                }
            }
        }
    }

    module.exports = export_data;

} catch (e) {
    console.error(e);
    throw new Error(e);
}
