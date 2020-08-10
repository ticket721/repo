const { ZERO } = require('./utils');
const BN = require('bn.js');

module.exports = {
    create_scope: async function create_scope(accounts, expect) {

        const TicketForgeArtifact = artifacts.require('TicketForge');
        const TicketForge = await TicketForgeArtifact.deployed();

        await TicketForge.createScope('t721', ZERO, [accounts[1]], [], true);

        const res = await TicketForge.getScope('t721');

        expect(res.exists).to.equal(true);
        expect(res.tokenuri_provider).to.equal(ZERO);
        expect(res.scope_index.toNumber()).to.equal(0);

        await expect(TicketForge.isScopeAdmin('t721', accounts[1])).to.eventually.equal(true);
        await expect(TicketForge.isScopeAdmin('t721', accounts[0])).to.eventually.equal(false);
        await expect(TicketForge.isScopeAdmin('t721', ZERO)).to.eventually.equal(false);

    }
}

