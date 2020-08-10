const { T721T_CONTRACT_NAME } = require('./constants');

module.exports = {
    mint_unauthorized: async function mint_unauthorized() {

        const {accounts, expect} = this;

        const T721Token = this.contracts[T721T_CONTRACT_NAME];

        const credited = accounts[1];

        await expect(T721Token.mintFor(credited, 10, {from: credited})).to.eventually.be.rejectedWith('Ownable::onlyOwner | Only owners allowed to call method');

    }
};
