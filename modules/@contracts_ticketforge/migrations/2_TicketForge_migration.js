const TicketForge = artifacts.require("TicketForge");
const config = require('../truffle-config');

module.exports = async function(deployer) {

    let name = 'Test Ticket Forge';
    let symbol = 'TTKT';

    if (config.args) {
        name = config.args.ERC721.name;
        symbol = config.args.ERC721.symbol;
    }

    await deployer.deploy(TicketForge, name, symbol);
};
