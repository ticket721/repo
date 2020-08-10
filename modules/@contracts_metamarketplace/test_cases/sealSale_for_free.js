const { Authorizer, generateSealSalePayload } = require('../test/utils');
const ethers = require('ethers');
const { SCOPE_INDEX, CONTRACT_NAME } = require('../test/constants');

module.exports = {
    sealSale_for_free: async function sealSale_for_free() {

        const { accounts, expect, network_id } = this;

        const MetaMarketplace = this.contracts[CONTRACT_NAME];
        const { ERC721, Dai, ERC20 } = this.contracts;

        const buyer = ethers.Wallet.createRandom();
        const seller = ethers.Wallet.createRandom();
        const fee_collector = accounts[2];
        const eventControllerWallet = ethers.Wallet.createRandom();
        const uuid = 'c4758045-fe85-4935-8e2e-fab04966907d'.toLowerCase();

        const payments = [];

        await ERC721.mint(seller.address, SCOPE_INDEX, {from: accounts[8]});
        const ticket_id = await ERC721.tokenOfOwnerByIndex(seller.address, 0);
        const nonce = await MetaMarketplace.getNonce(ticket_id);

        expect((await Dai.balanceOf(buyer.address)).toNumber()).to.equal(0);
        expect((await ERC20.balanceOf(buyer.address)).toNumber()).to.equal(0);
        expect((await Dai.balanceOf(seller.address)).toNumber()).to.equal(0);
        expect((await ERC20.balanceOf(seller.address)).toNumber()).to.equal(0);
        expect((await Dai.balanceOf(fee_collector)).toNumber()).to.equal(0);
        expect((await ERC20.balanceOf(fee_collector)).toNumber()).to.equal(0);
        expect((await ERC721.balanceOf(buyer.address)).toNumber()).to.equal(0);
        expect((await ERC721.balanceOf(seller.address)).toNumber()).to.equal(1);

        const signer = new Authorizer(network_id, MetaMarketplace.address);
        const expiration = new Date(Date.now() + 60000);

        const [id, uints, addr, bs] = await generateSealSalePayload(uuid, payments, ticket_id, nonce, expiration, buyer, seller, eventControllerWallet, fee_collector, signer, MetaMarketplace.address);

        await MetaMarketplace.sealSale(id, uints, addr, bs);

        expect((await Dai.balanceOf(buyer.address)).toNumber()).to.equal(0);
        expect((await ERC20.balanceOf(buyer.address)).toNumber()).to.equal(0);
        expect((await Dai.balanceOf(seller.address)).toNumber()).to.equal(0);
        expect((await ERC20.balanceOf(seller.address)).toNumber()).to.equal(0);
        expect((await Dai.balanceOf(fee_collector)).toNumber()).to.equal(0);
        expect((await ERC20.balanceOf(fee_collector)).toNumber()).to.equal(0);
        expect((await ERC721.balanceOf(buyer.address)).toNumber()).to.equal(1);
        expect((await ERC721.balanceOf(seller.address)).toNumber()).to.equal(0);
    },
};
