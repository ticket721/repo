const T721Admin = artifacts.require('T721Admin');
const Dummy = artifacts.require('Dummy');
const T721TokenMock = artifacts.require('T721TokenMock');
const config = require('../truffle-config');

const ZADDRESS = '0x0000000000000000000000000000000000000000';

const hasArtifact = (name) => {
    return (config && config.artifacts
        && config.artifacts[name]);
};

const getArtifact = (name) => {
    return config.artifacts[name];
}

module.exports = async function(deployer, networkName, accounts) {

    let tokenAddress;
    const network_id = await web3.eth.net.getId();

    if (['test', 'soliditycoverage'].indexOf(networkName) !== -1) {
        await deployer.deploy(Dummy);
        await deployer.deploy(T721TokenMock);
        tokenAddress = (await T721TokenMock.deployed()).address;
    } else {

        if (hasArtifact('t721token')) {

            const T721Token = getArtifact('t721token').T721Token;

            tokenAddress = T721Token.networks[network_id].address;

        } else {
            throw new Error('T721Admin deployment requires T721Token');
        }

    }

    if (
        ['test', 'soliditycoverage'].indexOf(networkName) === -1 &&
        !hasArtifact('minter_management')
    ) {
        throw new Error(`Cannot deploy in live network without minter config`);
    }


    let initialAdmins = [];
    let initialMinters = [];

    if (hasArtifact('minter_management')) {
        initialMinters = getArtifact('minter_management').minters;
    }

    if (config.args) {
        initialAdmins = config.args.initialAdmins;
    }

    if (['test', 'soliditycoverage'].indexOf(networkName) !== -1) {
        await deployer.deploy(T721Admin, [accounts[0]], [accounts[0]], tokenAddress, network_id);
    } else {
        console.log('Deploying T721 Admin with admins:', [accounts[0], ...initialAdmins]);
        console.log('Deploying T721 Admin with minters:', initialMinters);
        await deployer.deploy(T721Admin, [accounts[0], ...initialAdmins], initialMinters, tokenAddress, network_id);
    }

    if (['test', 'soliditycoverage'].indexOf(networkName) !== -1) {

        const t721Admin = await T721Admin.deployed();
        const t721token = await T721TokenMock.deployed();
        await t721token.addOwner(t721Admin.address);

    }

};

