const { ZERO } = require('./utils');

module.exports = {
    mint_valid_minter: async function mint_valid_minter(accounts, expect) {

        const TicketForgeArtifact = artifacts.require('TicketForge');
        const TicketForge = await TicketForgeArtifact.deployed();
        await TicketForge.createScope('t721', ZERO, [accounts[1]], [accounts[0]], true);

        const scope_infos = await TicketForge.getScope('t721');

        await TicketForge.methods['mint(address,uint256)'](accounts[0], scope_infos.scope_index.toNumber());

        expect((await TicketForge.balanceOf(accounts[0])).toNumber()).to.equal(1);

    }
}
