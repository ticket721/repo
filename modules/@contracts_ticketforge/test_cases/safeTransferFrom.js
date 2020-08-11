const { ZERO } = require('./utils');

module.exports = {
    safeTransferFrom: async function safeTransferFrom(accounts, expect) {

        const TicketForgeArtifact = artifacts.require('TicketForge');
        const TicketForge = await TicketForgeArtifact.deployed();
        await TicketForge.createScope('t721', ZERO, [accounts[1]], [], true);

        const scope_infos = await TicketForge.getScope('t721');

        const mint_nonce = await TicketForge.getMintNonce(accounts[0]);
        const ticketId = await TicketForge.getTokenID(accounts[0], mint_nonce);
        await TicketForge.methods['mint(address,uint256)'](accounts[0], scope_infos.scope_index.toNumber());

        await TicketForge.methods['safeTransferFrom(address,address,uint256)'](accounts[0], accounts[1], ticketId);

        expect((await TicketForge.balanceOf(accounts[1])).toNumber()).to.equal(1);
        expect((await TicketForge.balanceOf(accounts[0])).toNumber()).to.equal(0);


    }
}
