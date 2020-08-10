const { T721T_CONTRACT_NAME } = require('./constants');

module.exports = {
    burn_insufficient_funds: async function burn_insufficient_funds() {

        const {accounts, expect} = this;

        const T721Token = this.contracts[T721T_CONTRACT_NAME];

        const credited = accounts[1];

        await expect(T721Token.burn(10, {from: credited})).to.eventually.be.rejectedWith('T721Token::burn | insufficient balance for burn');

    }
};
