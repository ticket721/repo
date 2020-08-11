const { ZERO } = require('./utils');

module.exports = {
    create_scope_empty: async function create_scope_empty(accounts, expect) {

        const TicketForgeArtifact = artifacts.require('TicketForge');
        const TicketForge = await TicketForgeArtifact.deployed();

        await expect(TicketForge.createScope('', ZERO, [], [], true)).to.eventually.be.rejectedWith('TicketForge::createScope | name empty or with invalid characters');

    }
}

