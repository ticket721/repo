const { ZERO } = require('./utils');
const config = require('../truffle-config');

module.exports = {
    symbol: async function symbol(accounts, expect) {

        const TicketForgeArtifact = artifacts.require('TicketForge');
        const TicketForge = await TicketForgeArtifact.deployed();

        let expected_symbol = 'TTKT';

        if (config &&
            config.extra_config &&
            config.extra_config.external_modules &&
            config.extra_config.external_modules.ticketforge &&
            config.extra_config.external_modules.ticketforge.arguments) {
            expected_symbol = config.extra_config.external_modules.ticketforge.arguments[1];
        }

        expect(await TicketForge.symbol()).to.equal(expected_symbol);

    }
}
