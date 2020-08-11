const { T721A_CONTRACT_NAME } = require('./constants');

module.exports = {
    rmAdmin_not_admin: async function rmAdmin_not_admin() {

        const {accounts, expect} = this;

        const T721Admin = this.contracts[T721A_CONTRACT_NAME];

        await expect(T721Admin.isAdmin(accounts[1])).to.eventually.equal(false);

        await expect(T721Admin.rmAdmin(accounts[1])).to.eventually.be.rejectedWith('T721Admin::rmAdmin | address is not admin');

    }
};
