const { T721A_CONTRACT_NAME } = require('./constants');

module.exports = {
    addAdmin_not_admin_sender: async function addAdmin_not_admin_sender() {

        const {accounts, expect} = this;

        const T721Admin = this.contracts[T721A_CONTRACT_NAME];

        await expect(T721Admin.isAdmin(accounts[1])).to.eventually.equal(false);

        await expect(T721Admin.addAdmin(accounts[1], {from: accounts[1]})).to.eventually.be.rejectedWith('T721Admin::onlyAdmin | sender is not admin');

    }
};
