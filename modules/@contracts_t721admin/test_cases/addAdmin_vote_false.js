const { T721A_CONTRACT_NAME } = require('./constants');

module.exports = {
    addAdmin_vote_false: async function addAdmin_vote_false() {

        const {accounts, expect} = this;

        const T721Admin = this.contracts[T721A_CONTRACT_NAME];

        await expect(T721Admin.isAdmin(accounts[1])).to.eventually.equal(false);

        const res = await T721Admin.addAdmin(accounts[1]);

        const voteEvent = res.logs[0];
        const voteIdx = voteEvent.args.idx.toNumber();

        await expect(T721Admin.isAdmin(accounts[1])).to.eventually.equal(false);

        const addFinalRes = await T721Admin.vote(voteIdx, false);

        expect((await T721Admin.adminCount()).toNumber()).to.equal(1);

        await expect(T721Admin.isAdmin(accounts[1])).to.eventually.equal(false);

    }
};
