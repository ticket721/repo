const { T721T_CONTRACT_NAME } = require('./constants');

module.exports = {

    addOwner: async function addOwner() {

        const {accounts, expect} = this;

        const T721Token = this.contracts[T721T_CONTRACT_NAME];

        expect(await T721Token.owners(accounts[1])).to.equal(false);

        await T721Token.addOwner(accounts[1], {from: accounts[0]});

        expect(await T721Token.owners(accounts[1])).to.equal(true);
    }

};
