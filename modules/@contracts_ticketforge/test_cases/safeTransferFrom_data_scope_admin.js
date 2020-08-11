const { ZERO } = require('./utils');

module.exports = {
    safeTransferFrom_data_scope_admin: async function safeTransferFrom_data_scope_admin(accounts, expect) {

        const TicketForgeArtifact = artifacts.require('TicketForge');
        const TicketForge = await TicketForgeArtifact.deployed();
        await TicketForge.createScope('t721', ZERO, [accounts[2]], [], true);

        const ValidERC721ReceiverArtifact = artifacts.require('ValidERC721Receiver');
        const ValidERC721Receiver = await ValidERC721ReceiverArtifact.new();

        const scope_infos = await TicketForge.getScope('t721');

        const mint_nonce = await TicketForge.getMintNonce(accounts[0]);
        const ticketId = await TicketForge.getTokenID(accounts[0], mint_nonce);
        await TicketForge.methods['mint(address,uint256)'](accounts[0], scope_infos.scope_index.toNumber());

        await TicketForge.methods['safeTransferFrom(address,address,uint256,bytes)'](accounts[0], ValidERC721Receiver.address, ticketId, '0xabcd', {from: accounts[2]});

        expect((await TicketForge.balanceOf(ValidERC721Receiver.address)).toNumber()).to.equal(1);
        expect((await TicketForge.balanceOf(accounts[0])).toNumber()).to.equal(0);


    }
}
