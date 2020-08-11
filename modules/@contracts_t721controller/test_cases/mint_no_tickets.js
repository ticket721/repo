const { Authorizer, generateMintPayload } = require('../test/utils');
const { T721C_CONTRACT_NAME } = require('../test/constants');
const { Wallet } = require('ethers');

// Mint 5 tickets, with 2 currencies
module.exports = {
    mint_no_tickets: async function mint_no_tickets() {

        const { accounts, expect } = this;

        const T721Controller = this.contracts[T721C_CONTRACT_NAME];
        const Dai = this.contracts.Dai;
        const ERC20 = this.contracts.ERC20;
        const ERC721 = this.contracts.ERC721;

        const eventControllerWallet = Wallet.createRandom();

        const payments = [
            {
                currency: Dai.address,
                amount: 900,
                fee: 100,
            },
            {
                currency: ERC20.address,
                amount: 900,
                fee: 100,
            },
        ];

        const tickets = [
        ];

        const uuid = 'c4758045-fe85-4935-8e2e-fab04966907d'.toLowerCase();
        const network_id = await web3.eth.net.getId();
        const signer = new Authorizer(network_id, T721Controller.address);

        await Dai.mint(accounts[0], 1000);
        await ERC20.mint(accounts[0], 1000);

        await Dai.approve(T721Controller.address, 1000);
        await ERC20.approve(T721Controller.address, 1000);

        const expiration = new Date(Date.now() + 60000);
        const [id, b32, uints, addr, bs] = await generateMintPayload(uuid, payments, tickets, expiration, eventControllerWallet, accounts[9], signer);

        expect((await ERC721.balanceOf(accounts[0])).toNumber()).to.equal(0);
        expect((await ERC721.balanceOf(accounts[1])).toNumber()).to.equal(0);
        expect((await ERC721.balanceOf(accounts[2])).toNumber()).to.equal(0);
        expect((await ERC721.balanceOf(accounts[3])).toNumber()).to.equal(0);
        expect((await ERC721.balanceOf(accounts[4])).toNumber()).to.equal(0);

        await expect(T721Controller.mint(id, b32, uints, addr, bs)).to.eventually.be.rejectedWith('T721C::mint | why would you mint 0 tickets ?');

    },
};
