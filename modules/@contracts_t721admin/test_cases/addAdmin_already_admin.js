const { T721A_CONTRACT_NAME } = require('./constants');

module.exports = {
    addAdmin_already_admin: async function addAdmin_already_admin() {

        const {accounts, expect} = this;

        const T721Admin = this.contracts[T721A_CONTRACT_NAME];

        await expect(T721Admin.isAdmin(accounts[1])).to.eventually.equal(false);

        const res = await T721Admin.addAdmin(accounts[1]);

        const voteEvent = res.logs[0];
        const voteIdx = voteEvent.args.idx.toNumber();

        await expect(T721Admin.isAdmin(accounts[1])).to.eventually.equal(false);

        await T721Admin.vote(voteIdx, true);

        await expect(T721Admin.isAdmin(accounts[1])).to.eventually.equal(true);

        await expect(T721Admin.addAdmin(accounts[1])).to.eventually.be.rejectedWith('T721Admin::addAdmin | address is already admin');

    }
};
