const { ZERO } = require('./utils');
const config = require('../truffle-config');

module.exports = {
    name: async function name(accounts, expect) {

        const TicketForgeArtifact = artifacts.require('TicketForge');
        const TicketForge = await TicketForgeArtifact.deployed();

        let expected_name = 'Test Ticket Forge';

        if (config &&
            config.extra_config &&
            config.extra_config.external_modules &&
            config.extra_config.external_modules.ticketforge &&
            config.extra_config.external_modules.ticketforge.arguments) {
            expected_name = config.extra_config.external_modules.ticketforge.arguments[0];
        }

        expect(TicketForge.name()).to.eventually.equal(expected_name);


    }
}
