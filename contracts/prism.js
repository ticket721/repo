const { Portalize } = require('portalize');
const path = require('path');
const fs = require('fs');

function from_contracts(file) {
    return path.join(path.join(path.resolve(), '../..'), file);
}

Portalize.get.setPortal(from_contracts('portal'));
Portalize.get.setModuleName('contracts');

console.log('Loading config ...');
try {
    const config = Portalize.get.get('network.json', {module: 'network'});

    console.log('Injecting following config:');
    console.log(`    Network Name: ${config.name}`);
    console.log(`    Network Type: ${config.type}`);
    console.log(`    Network ID: ${config.network_id}`);
    console.log(`    Node Host: ${config.host}`);
    console.log(`    Node Port: ${config.port}`);
    console.log(`    Node Protocol: ${config.protocol}`);

    const contract_artifacts = fs.readdirSync(from_contracts('portal/contracts'));

    const external_modules = {};

    for (const contract of contract_artifacts) {
        const module_name = contract.split('.').slice(0, -1).join('.');
        external_modules[module_name] = Portalize.get.get(contract, {module: 'contracts'});
    }

    module.exports = {
        networks: {
            [config.name]: {
                host: config.host,
                port: config.port,
                network_id: config.network_id
            }
        },
        extra_config: {
            external_modules
        }
    };

} catch (e) {
    console.error(e);
    throw new Error(e);
}
