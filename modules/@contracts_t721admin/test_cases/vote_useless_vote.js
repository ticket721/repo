const { T721A_CONTRACT_NAME } = require('./constants');

module.exports = {
    vote_useless_vote: async function vote_useless_vote() {

        const {accounts, expect} = this;

        const T721Admin = this.contracts[T721A_CONTRACT_NAME];

        await expect(T721Admin.isAdmin(accounts[1])).to.eventually.equal(false);

        const res = await T721Admin.addAdmin(accounts[1]);

        const voteEvent = res.logs[0];
        const voteIdx = voteEvent.args.idx.toNumber();

        await T721Admin.vote(voteIdx, true);

        await T721Admin.addAdmin(accounts[2]);
        await T721Admin.vote(voteIdx + 1, true);

        await T721Admin.addAdmin(accounts[3]);
        await T721Admin.vote(voteIdx + 2, true);
        await expect(T721Admin.vote(voteIdx + 2, true)).to.eventually.be.rejectedWith('T721Admin::vote | useless vote');

    }
};
