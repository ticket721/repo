const { T721T_CONTRACT_NAME } = require('./constants');

module.exports = {

    addOwner_already_owner: async function addOwner_already_owner() {

        const {accounts, expect} = this;

        const T721Token = this.contracts[T721T_CONTRACT_NAME];

        await expect(T721Token.addOwner(accounts[0], {from: accounts[0]})).to.eventually.be.rejectedWith('Ownable::add | address is already owner');
    }

};
