const { Authorizer, generateSealSalePayload } = require('../test/utils');
const ethers = require('ethers');
const { SCOPE_INDEX, CONTRACT_NAME } = require('../test/constants');

module.exports = {
    sealSale_buyer_invalid_smart_wallet: async function sealSale_buyer_invalid_smart_wallet() {

        const { accounts, expect, network_id } = this;

        const MetaMarketplace = this.contracts[CONTRACT_NAME];
        const { ERC721, Dai, ERC20, SmartWalletMockArtifact } = this.contracts;

        const seller = ethers.Wallet.createRandom();
        const buyerWallet = ethers.Wallet.createRandom();
        const buyerInstance = await SmartWalletMockArtifact.new(seller.address);
        const buyer = {
            privateKey: buyerWallet.privateKey,
            address: buyerInstance.address
        };
        const fee_collector = accounts[2];
        const eventControllerWallet = ethers.Wallet.createRandom();
        const uuid = 'c4758045-fe85-4935-8e2e-fab04966907d'.toLowerCase();

        const payments = [{
            currency: ERC20.address,
            amount: 1000,
            fee: 100
        }, {
            currency: Dai.address,
            amount: 1000,
            fee: 100
        }];

        await ERC721.mint(seller.address, SCOPE_INDEX, {from: accounts[8]});
        const ticket_id = await ERC721.tokenOfOwnerByIndex(seller.address, 0);
        const nonce = await MetaMarketplace.getNonce(ticket_id);

        await Dai.mintApprove(buyer.address, 1100, MetaMarketplace.address, 1100);
        await ERC20.mintApprove(buyer.address, 1100, MetaMarketplace.address, 1100);

        expect((await Dai.balanceOf(buyer.address)).toNumber()).to.equal(1100);
        expect((await ERC20.balanceOf(buyer.address)).toNumber()).to.equal(1100);
        expect((await Dai.balanceOf(seller.address)).toNumber()).to.equal(0);
        expect((await ERC20.balanceOf(seller.address)).toNumber()).to.equal(0);
        expect((await Dai.balanceOf(fee_collector)).toNumber()).to.equal(0);
        expect((await ERC20.balanceOf(fee_collector)).toNumber()).to.equal(0);
        expect((await ERC721.balanceOf(buyer.address)).toNumber()).to.equal(0);
        expect((await ERC721.balanceOf(seller.address)).toNumber()).to.equal(1);

        const signer = new Authorizer(network_id, MetaMarketplace.address);
        const expiration = new Date(Date.now() + 60000);

        const [id, uints, addr, bs] = await generateSealSalePayload(uuid, payments, ticket_id, nonce, expiration, buyer, seller, eventControllerWallet, fee_collector, signer, MetaMarketplace.address);

        await expect(MetaMarketplace.sealSale(id, uints, addr, bs)).to.eventually.be.rejectedWith('MM::sealSale | invalid buyer signature');

    },
};
