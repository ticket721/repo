const { encodeAndHash } = require('../test/utils');
const { T721C_CONTRACT_NAME } = require('../test/constants');

module.exports = {
    getGroupID: async function getGroupID() {

        const {accounts, expect} = this;

        const T721Controller = this.contracts[T721C_CONTRACT_NAME];

        const uuid = 'c4758045-fe85-4935-8e2e-fab04966907d'.toLowerCase();
        const result = encodeAndHash(['address', 'string'], [accounts[0], uuid]);

        const groupId = await T721Controller.getGroupID(accounts[0], uuid);

        expect(groupId).to.equal(result);
    }
};
