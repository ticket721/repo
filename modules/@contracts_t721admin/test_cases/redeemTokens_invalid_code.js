const { T721A_CONTRACT_NAME , T721T_CONTRACT_NAME} = require('./constants');
const { Wallet } = require('ethers');
const { encodeAndHash, Authorizer } = require('./utils');

module.exports = {
    redeemTokens_invalid_code: async function redeemTokens_invalid_code() {

        const { accounts, expect } = this;
        const T721Admin = this.contracts[T721A_CONTRACT_NAME];
        const T721Token = this.contracts[T721T_CONTRACT_NAME];

        const minterWallet = Wallet.createRandom();
        const minter = minterWallet.address;

        await T721Admin.addMinter(minterWallet.address);

        const recipient = accounts[5];
        const code = 1;
        const amount = 1000;

        const hash = encodeAndHash(
            ['string', 'address', 'uint256', 'address', 'uint256'],
            ['mintTokens', recipient, amount, minter, code]
        );

        const chainId = await web3.eth.net.getId();

        const signer = new Authorizer(
            chainId,
            T721Admin.address
        );

        const payload = signer.generatePayload(
            {
                emitter: minter,
                grantee: recipient,
                hash,
            },
            'Authorization'
        );

        const signature = await signer.sign(minterWallet.privateKey, payload);

        expect((await T721Token.balanceOf(accounts[5])).toNumber()).to.equal(0);

        await T721Admin.redeemTokens(recipient, amount, minter, code, signature.hex, { from: accounts[5] });

        expect((await T721Token.balanceOf(accounts[5])).toNumber()).to.equal(1000);

        await expect(T721Admin.redeemTokens(recipient, amount, minter, code, signature.hex, { from: accounts[5] })).to.eventually.be.rejectedWith('T721Admin::consumeCode | code already used');
    },
};
