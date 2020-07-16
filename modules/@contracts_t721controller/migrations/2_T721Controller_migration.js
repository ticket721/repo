const T721Controller_v0 = artifacts.require('T721Controller_v0');
const DaiMock_v0 = artifacts.require("DaiMock_v0");
const ERC20Mock_v0 = artifacts.require("ERC20Mock_v0");
const ERC721Mock_v0 = artifacts.require("ERC721Mock_v0");
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
    if (['test', 'soliditycoverage'].indexOf(networkName) === -1) {

        if (hasArtifact('ticketforge')) {

            const network_id = await web3.eth.net.getId();
            const TicketForge = getArtifact('ticketforge').TicketForge;

            await deployer.deploy(T721Controller_v0, TicketForge.networks[network_id].address, network_id);

        } else {
            throw new Error('Deployment requires Ticket721 repo setup to inject daiplus & ticketforge configuration');
        }

    } else {

        const network_id = await web3.eth.net.getId();

        await deployer.deploy(ERC721Mock_v0);
        await deployer.deploy(ERC20Mock_v0);
        await deployer.deploy(DaiMock_v0);

        const ERC721Instance = await ERC721Mock_v0.deployed();
        await deployer.deploy(T721Controller_v0, ERC721Instance.address, network_id);

        const T721Controller_v0Instance = await T721Controller_v0.deployed();

        await ERC721Instance.createScope("t721_test", ZADDRESS, [], [T721Controller_v0Instance.address]);

    }
};

