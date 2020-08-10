const { ZERO } = require('./utils');

module.exports = {
    transferFrom_unapproved: async function transferFrom_unapproved(accounts, expect) {

        const TicketForgeArtifact = artifacts.require('TicketForge');
        const TicketForge = await TicketForgeArtifact.deployed();
        await TicketForge.createScope('t721', ZERO, [accounts[1]], [], true);

        const scope_infos = await TicketForge.getScope('t721');

        const mint_nonce = await TicketForge.getMintNonce(accounts[0]);
        const ticketId = await TicketForge.getTokenID(accounts[0], mint_nonce);
        await TicketForge.methods['mint(address,uint256)'](accounts[0], scope_infos.scope_index.toNumber());

        await expect(TicketForge.transferFrom(accounts[0], accounts[1], ticketId, {from: accounts[2]})).to.eventually.be.rejectedWith('ERC721: transfer caller is not owner nor approved');

    }
}
