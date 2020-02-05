const get_config_sync = require('../gulp/utils/get_config_sync');

const { from_root } = require('../gulp/utils/from_root');
const { Portalize } = require('portalize');
const path = require('path');
const fs = require('fs');
const Web3 = require('web3');
const HDWalletProvider = require("truffle-hdwallet-provider");


function from_contracts(file) {
    return path.join(path.join(path.resolve(), '../..'), file);
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
            provider = function() {
                return new Web3.providers.HttpProvider(`${config.protocol}://${config.host}:${config.port}${config.path || ''}`);
            };
            break ;
        case 'hdwallet':
            provider = function() {
                return new HDWalletProvider(
                    t721_config.contracts.provider.mnemonic,
                    `${config.protocol}://${config.host}:${config.port}${config.path || ''}`,
                    t721_config.contracts.provider.account_index,
                    t721_config.contracts.provider.account_number,
                    t721_config.contracts.provider.derivation_path);
            };
            break ;
    }

    const export_data = {
        networks: {
            [config.name]: {
                host: config.host,
                port: config.port,
                network_id: config.network_id,
                provider,
                t721config: get_config_sync(),
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
    throw new Error(e);
}
