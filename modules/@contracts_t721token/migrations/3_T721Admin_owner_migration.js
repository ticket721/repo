const T721Token = artifacts.require('T721Token');
const config = require('../truffle-config');

const hasArtifact = (name) => {
    return (config && config.artifacts
        && config.artifacts[name]);
};

const getArtifact = (name) => {
    return config.artifacts[name];
};

module.exports = async function(deployer, networkName) {

    if (['test', 'soliditycoverage'].indexOf(networkName) === -1) {
        if (hasArtifact('t721admin')) {

            const network_id = await web3.eth.net.getId();
            const T721Admin = getArtifact('t721admin').T721Admin;

            const T721AdminAddress = T721Admin.networks[network_id].address;

            const T721TokenInstance = await T721Token.deployed();

            await T721TokenInstance.addOwner(T721AdminAddress);

        } else {
            throw new Error(`Cannot find t721admin artifacts to add T721Admin as t721token owner`);
        }
    }

};

