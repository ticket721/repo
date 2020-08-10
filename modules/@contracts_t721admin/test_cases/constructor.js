const { T721A_CONTRACT_NAME } = require('./constants');

module.exports = {
    constructor: async function constructor() {

        const {accounts, expect} = this;

        const T721Admin = this.contracts[T721A_CONTRACT_NAME];

        await expect(T721Admin.isAdmin(accounts[0])).to.eventually.equal(true);
        await expect(T721Admin.isAdmin(accounts[1])).to.eventually.equal(false);

        await expect(T721Admin.isMinter(accounts[0])).to.eventually.equal(true);
        await expect(T721Admin.isMinter(accounts[1])).to.eventually.equal(false);
    }
};
