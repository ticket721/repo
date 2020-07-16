const TicketForge = artifacts.require("TicketForge");
const config = require('../truffle-config');

const hasArtifact = (name) => {
    return (config && config.artifacts
        && config.artifacts[name]);
};

const getArtifact = (name) => {
    return config.artifacts[name];
}

const ZADDRESS = '0x0000000000000000000000000000000000000000';

module.exports = async function(deployer, networkName) {
    if (['test', 'soliditycoverage'].indexOf(networkName) === -1) {

        if (hasArtifact('t721controller') && hasArtifact('metamarketplace')) {

            const TicketForgeInstance = await TicketForge.deployed();
            const network_id = await web3.eth.net.getId();

            const T721Controller = getArtifact('t721controller').T721Controller_v0;
            const MetaMarketplace = getArtifact('metamarketplace').MetaMarketplace_v0;

            const T721Controller_address = T721Controller.networks[network_id].address;
            const MetaMarketplace_address = MetaMarketplace.networks[network_id].address;

            await TicketForgeInstance.createScope("ticket721_0",
                ZADDRESS,
                [
                    MetaMarketplace_address
                ],
                [
                    T721Controller_address
                ],
                false
            );


        } else {
            throw new Error(`Missing t721controller and metamarketplace artifacts for scope creation (ticket721_0)`)
        }

    } else {

    }



};
