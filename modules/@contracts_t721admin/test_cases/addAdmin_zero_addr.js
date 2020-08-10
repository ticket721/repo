const { T721A_CONTRACT_NAME, ZADDRESS } = require('./constants');

module.exports = {
    addAdmin_zero_addr: async function addAdmin_zero_addr() {

        const {accounts, expect} = this;

        const T721Admin = this.contracts[T721A_CONTRACT_NAME];

        await expect(T721Admin.isAdmin(accounts[1])).to.eventually.equal(false);

        await expect(T721Admin.addAdmin(ZADDRESS)).to.eventually.be.rejectedWith('T721Admin::addAdmin | cannot add 0 addr');

    }
};
