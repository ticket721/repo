const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { revert, snapshot } = require('../test_cases/utils');
chai.use(chaiAsPromised);
const expect = chai.expect;

const { T721T_CONTRACT_NAME }  = require('../test_cases/constants');

const {mint} = require('../test_cases/mint');
const {mint_unauthorized} = require('../test_cases/mint_unauthorized');

const {burn} = require('../test_cases/burn');
const {burn_insufficient_funds} = require('../test_cases/burn_insufficient_funds');

const {addOwner} = require('../test_cases/addOwner');
const {addOwner_already_owner} = require('../test_cases/addOwner_already_owner');

contract('T721Token', (accounts) => {

    before(async function () {

        const T721TokenArtifact = artifacts.require(T721T_CONTRACT_NAME);
        const T721TokenInstance = await T721TokenArtifact.deployed();

        this.contracts = {
            [T721T_CONTRACT_NAME]: T721TokenInstance,
        };

        this.snap_id = await snapshot();
        this.accounts = accounts;
        this.expect = expect;
    });

    beforeEach(async function () {
        const status = await revert(this.snap_id);
        expect(status).to.be.true;
        this.snap_id = await snapshot();
    });

    describe('Owners', function() {

        it('should add an owner', addOwner);
        it('should add an owner that already is an owner', addOwner_already_owner);

    });

    describe('Mint & Burn', function () {

        it('should mint from admin', mint);
        it('should mint from credited account and revert', mint_unauthorized);

        it('should burn from credited account', burn);
        it('should burn from credited account and revert for insufficient funds', burn_insufficient_funds);

    });

});
