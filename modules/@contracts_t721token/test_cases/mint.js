const { T721T_CONTRACT_NAME } = require('./constants');

module.exports = {
    mint: async function mint() {

        const {accounts, expect} = this;

        const T721Token = this.contracts[T721T_CONTRACT_NAME];

        const credited = accounts[1];

        await T721Token.mintFor(credited, 10);

        expect((await T721Token.balanceOf(credited)).toNumber()).to.equal(10);

    }
};
