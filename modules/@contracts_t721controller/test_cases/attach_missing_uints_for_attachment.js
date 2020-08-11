const { Authorizer, generateMintPayload, strToB32, generateAttachPayload } = require('../test/utils');
const { T721C_CONTRACT_NAME } = require('../test/constants');
const { Wallet } = require('ethers');

// Mint 5 tickets, with 2 currencies
module.exports = {
    attach_missing_uints_for_attachment: async function attach_missing_uints_for_attachment() {

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
            {
                owner: accounts[0],
                category: 'regular',
                code: 1,
            },
            {
                owner: accounts[1],
                category: 'vip',
                code: 2,
            },
            {
                owner: accounts[2],
                category: 'regular',
                code: 3,
            },
            {
                owner: accounts[3],
                category: 'vip',
                code: 4,
            },
            {
                owner: accounts[4],
                category: 'regular',
                code: 5,
            },
        ];

        const uuid = 'c4758045-fe85-4935-8e2e-fab04966907d'.toLowerCase();
        const network_id = await web3.eth.net.getId();
        const signer = new Authorizer(network_id, T721Controller.address);

        await Dai.mint(accounts[0], 1000);
        await ERC20.mint(accounts[0], 1000);

        await Dai.approve(T721Controller.address, 1000);
        await ERC20.approve(T721Controller.address, 1000);
        {
            const expiration = new Date(Date.now() + 60000);
            const [id, b32, uints, addr, bs] = await generateMintPayload(uuid, payments, tickets, expiration, eventControllerWallet, accounts[9], signer);

            expect((await ERC721.balanceOf(accounts[0])).toNumber()).to.equal(0);
            expect((await ERC721.balanceOf(accounts[1])).toNumber()).to.equal(0);
            expect((await ERC721.balanceOf(accounts[2])).toNumber()).to.equal(0);
            expect((await ERC721.balanceOf(accounts[3])).toNumber()).to.equal(0);
            expect((await ERC721.balanceOf(accounts[4])).toNumber()).to.equal(0);

            const tx = await T721Controller.mint(id, b32, uints, addr, bs);

            for (let idx = 0; idx < tx.logs.length; ++idx) {

                expect(tx.logs[idx].args.owner).to.equal(tickets[idx].owner);

            }
        }

        expect((await ERC721.balanceOf(accounts[0])).toNumber()).to.equal(1);
        expect((await ERC721.balanceOf(accounts[1])).toNumber()).to.equal(1);
        expect((await ERC721.balanceOf(accounts[2])).toNumber()).to.equal(1);
        expect((await ERC721.balanceOf(accounts[3])).toNumber()).to.equal(1);
        expect((await ERC721.balanceOf(accounts[4])).toNumber()).to.equal(1);

        expect((await Dai.balanceOf(accounts[9])).toNumber()).to.equal(100);
        expect((await ERC20.balanceOf(accounts[9])).toNumber()).to.equal(100);

        const ticket_id = await ERC721.tokenOfOwnerByIndex(accounts[0], 0);

        const attachments = [
            {
                attachment: 'beer',
                amount: 5,
                ticket_id,
                ticket_owner: accounts[0],
                code: 6
            },
            {
                attachment: 'fries',
                amount: 2,
                ticket_id,
                ticket_owner: accounts[0],
                code: 7
            }
        ];

        await Dai.mint(accounts[0], 1000);
        await ERC20.mint(accounts[0], 1000);

        await Dai.approve(T721Controller.address, 1000);
        await ERC20.approve(T721Controller.address, 1000);

        const expiration = new Date(Date.now() + 60000);
        const [id, b32, uints, addr, bs] = await generateAttachPayload(uuid, payments, attachments, expiration, eventControllerWallet, accounts[9], signer);

        await expect(T721Controller.attach(id, b32, uints.slice(0, 3 + (payments.length * 2)), addr, bs)).to.eventually.be.rejectedWith('T721C::attach | not enough space on uints (2)');

    },
};
