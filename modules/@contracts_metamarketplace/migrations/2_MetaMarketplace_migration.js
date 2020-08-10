const config = require('../truffle-config');
const MetaMarketplace_v0 = artifacts.require("MetaMarketplace_v0");
const ERC20Mock_v0 = artifacts.require("ERC20Mock_v0");
const ERC721Mock_v0 = artifacts.require("ERC721Mock_v0");
const DaiMock_v0 = artifacts.require("DaiMock_v0");
const T721ControllerMock_v0 = artifacts.require('T721ControllerMock_v0');

const hasArtifact = (name) => {
    return (config && config.artifacts
        && config.artifacts[name]);
};

const getArtifact = (name) => {
    return config.artifacts[name];
}

module.exports = async function(deployer, networkName, accounts) {
    if (['test', 'soliditycoverage'].indexOf(networkName) === -1) {

        if (hasArtifact('ticketforge') && hasArtifact('t721controller')) {
            const network_id = await web3.eth.net.getId();

            const TicketforgeArtifact = getArtifact('ticketforge').TicketForge;
            const TicketForgeAddress = TicketforgeArtifact.networks[network_id].address;

            const T721Controller_v0Artifact = getArtifact('t721controller').T721Controller_v0;
            const T721Controller_v0Address = T721Controller_v0Artifact.networks[network_id].address;

            console.log(`Ticketforge Address: ${TicketForgeAddress}`);
            console.log(`T721Controller Address: ${T721Controller_v0Address}`);

            await deployer.deploy(MetaMarketplace_v0, network_id, TicketForgeAddress, T721Controller_v0Address);

        } else {
            throw new Error('Deployment requires Ticket721 repo setup to inject daiplus & ticketforge configuration');
        }

    } else {

        const network_id = await web3.eth.net.getId();

        await deployer.deploy(ERC20Mock_v0);
        await deployer.deploy(DaiMock_v0);
        await deployer.deploy(ERC721Mock_v0);
        await deployer.deploy(T721ControllerMock_v0);
        const ERC721Instance = await ERC721Mock_v0.deployed();
        const T721ControllerMockInstance = await T721ControllerMock_v0.deployed();

        await deployer.deploy(MetaMarketplace_v0, network_id, ERC721Instance.address, T721ControllerMockInstance.address);

        await ERC721Instance.createScope

    }
};

