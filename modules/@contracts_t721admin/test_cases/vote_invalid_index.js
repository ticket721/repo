const { T721A_CONTRACT_NAME } = require('./constants');

module.exports = {
    vote_invalid_index: async function vote_invalid_index() {

        const {accounts, expect} = this;

        const T721Admin = this.contracts[T721A_CONTRACT_NAME];

        await expect(T721Admin.isAdmin(accounts[1])).to.eventually.equal(false);

        const res = await T721Admin.addAdmin(accounts[1]);

        const voteEvent = res.logs[0];
        const voteIdx = voteEvent.args.idx.toNumber();

        await expect(T721Admin.isAdmin(accounts[1])).to.eventually.equal(false);

        await expect(T721Admin.vote(voteIdx + 1, true)).to.eventually.be.rejectedWith('T721Admin::vote | invalid vote index');


    }
};
