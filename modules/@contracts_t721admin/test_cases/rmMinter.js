const { T721A_CONTRACT_NAME } = require('./constants');

module.exports = {
    rmMinter: async function rmMinter() {

        const {accounts, expect} = this;
        const T721Admin = this.contracts[T721A_CONTRACT_NAME];

        expect((await T721Admin.minterCount()).toNumber()).to.equal(1);
        expect(await T721Admin.isMinter(accounts[1])).to.equal(false);

        await T721Admin.addMinter(accounts[1]);

        expect((await T721Admin.minterCount()).toNumber()).to.equal(2);
        expect(await T721Admin.isMinter(accounts[1])).to.equal(true);

        await T721Admin.rmMinter(accounts[1]);

        expect((await T721Admin.minterCount()).toNumber()).to.equal(1);
        expect(await T721Admin.isMinter(accounts[1])).to.equal(false);
    }
};
