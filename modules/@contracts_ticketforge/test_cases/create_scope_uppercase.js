const { ZERO } = require('./utils');

module.exports = {
    create_scope_uppercase: async function create_scope_uppercase(accounts, expect) {

        const TicketForgeArtifact = artifacts.require('TicketForge');
        const TicketForge = await TicketForgeArtifact.deployed();

        await expect(TicketForge.createScope('T721', ZERO, [], [], true)).to.eventually.be.rejectedWith('TicketForge::createScope | name empty or with invalid characters');

    }
}

