const { ZERO } = require('./utils');

module.exports = {
    mint_invalid_minter: async function mint_invalid_minter(accounts, expect) {

        const TicketForgeArtifact = artifacts.require('TicketForge');
        const TicketForge = await TicketForgeArtifact.deployed();
        await TicketForge.createScope('t721', ZERO, [accounts[1]], [accounts[1]], true);

        const scope_infos = await TicketForge.getScope('t721');

        await expect(TicketForge.methods['mint(address,uint256)'](accounts[0], scope_infos.scope_index.toNumber())).to.eventually.be.rejectedWith('TicketForge::mint | unauthorized minter')

    }
}
