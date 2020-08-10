const { getEthersERC20Contract, getCurrencies, getArguments } = require('../test/utils');
const ethers = require('ethers');
const {SCOPE_INDEX, CONTRACT_NAME} = require('../test/constants');

module.exports = {
    getNonce: async function getNonce() {

        const {accounts, expect, network_id} = this;

        const MetaMarketplace = this.contracts[CONTRACT_NAME];

        const nonce = await MetaMarketplace.getNonce(721);

        expect(nonce.toNumber()).to.equal(0);

    }
}
