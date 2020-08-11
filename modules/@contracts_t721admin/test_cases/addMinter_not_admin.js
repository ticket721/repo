const { T721A_CONTRACT_NAME } = require('./constants');

module.exports = {
    addMinter_not_admin: async function addMinter_not_admin() {

        const {accounts, expect} = this;
        const T721Admin = this.contracts[T721A_CONTRACT_NAME];

        expect((await T721Admin.minterCount()).toNumber()).to.equal(1);
        expect(await T721Admin.isMinter(accounts[1])).to.equal(false);

        await expect(T721Admin.addMinter(accounts[1], {from: accounts[4]})).to.eventually.be.rejectedWith('T721Admin::onlyAdmin | sender is not admin');

    }
};
