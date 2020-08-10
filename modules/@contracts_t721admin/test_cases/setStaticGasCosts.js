const { T721A_CONTRACT_NAME } = require('./constants');

module.exports = {
    setStaticGasCosts: async function setStaticGasCosts() {

        const {accounts, expect} = this;

        const T721Admin = this.contracts[T721A_CONTRACT_NAME];

        await T721Admin.setStaticGasCosts(1, 2);

        expect((await T721Admin.staticGasCost()).toNumber()).to.equal(1);
        expect((await T721Admin.deployStaticGasCost()).toNumber()).to.equal(2);

    }
};
