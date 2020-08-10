const { Authorizer, generateMintPayload, generateWithdrawPayload } = require('../test/utils');
const { T721C_CONTRACT_NAME } = require('../test/constants');
const { Wallet } = require('ethers');

// Mint 5 tickets, with 2 currencies
module.exports = {
    withdraw_duplicate_code: async function withdraw_duplicate_code() {

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

            expect((await ERC721.balanceOf(accounts[0])).toNumber()).to.equal(1);
            expect((await ERC721.balanceOf(accounts[1])).toNumber()).to.equal(1);
            expect((await ERC721.balanceOf(accounts[2])).toNumber()).to.equal(1);
            expect((await ERC721.balanceOf(accounts[3])).toNumber()).to.equal(1);
            expect((await ERC721.balanceOf(accounts[4])).toNumber()).to.equal(1);

            expect((await Dai.balanceOf(accounts[9])).toNumber()).to.equal(100);
            expect((await ERC20.balanceOf(accounts[9])).toNumber()).to.equal(100);

        }

        const daiWithdrawCode = 5;
        const expiration = new Date(Date.now() + 60000);

        {
            const [event_controller, id, currency, amount, target, code, expiration_final, signature] = await generateWithdrawPayload(eventControllerWallet, uuid, Dai.address, 900, accounts[8], daiWithdrawCode, expiration, signer);

            await expect(T721Controller.withdraw(event_controller, id, currency, amount, target, code, expiration_final, signature)).to.eventually.be.rejectedWith('T721C::consumeCode | code already used');
        }

    },
};
