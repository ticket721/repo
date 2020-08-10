const { T721A_CONTRACT_NAME } = require('./constants');

module.exports = {
    addAdmin: async function addAdmin() {

        const {accounts, expect} = this;

        const T721Admin = this.contracts[T721A_CONTRACT_NAME];

        await expect(T721Admin.isAdmin(accounts[1])).to.eventually.equal(false);

        const res = await T721Admin.addAdmin(accounts[1]);

        const voteEvent = res.logs[0];
        const voteIdx = voteEvent.args.idx.toNumber();

        await expect(T721Admin.isAdmin(accounts[1])).to.eventually.equal(false);

        const addFinalRes = await T721Admin.vote(voteIdx, true);

        expect((await T721Admin.adminCount()).toNumber()).to.equal(2);

        expect(addFinalRes.logs[0].args).to.deep.equal({
            __length__: 1,
            '0': accounts[1],
            admin: accounts[1],
        });

        await expect(T721Admin.isAdmin(accounts[1])).to.eventually.equal(true);

    }
};
