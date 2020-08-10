const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { revert, snapshot } = require('../test_cases/utils');
chai.use(chaiAsPromised);
const expect = chai.expect;

const { T721A_CONTRACT_NAME, T721T_CONTRACT_NAME } = require('../test_cases/constants');

const { constructor } = require('../test_cases/constructor');

const { addAdmin } = require('../test_cases/addAdmin');
const { rmAdmin } = require('../test_cases/rmAdmin');
const { vote_invalid_index } = require('../test_cases/vote_invalid_index');
const { vote_outdated_vote } = require('../test_cases/vote_outdated_vote');
const { vote_useless_vote } = require('../test_cases/vote_useless_vote');
const { addAdmin_already_admin } = require('../test_cases/addAdmin_already_admin');
const { rmAdmin_not_admin } = require('../test_cases/rmAdmin_not_admin');
const { addAdmin_zero_addr } = require('../test_cases/addAdmin_zero_addr');
const { addAdmin_vote_false } = require('../test_cases/addAdmin_vote_false');
const { addAdmin_not_admin_sender } = require('../test_cases/addAdmin_not_admin_sender');

const { addMinter } = require('../test_cases/addMinter');
const { addMinter_already_minter } = require('../test_cases/addMinter_already_minter');
const { addMinter_not_admin } = require('../test_cases/addMinter_not_admin');
const { rmMinter } = require('../test_cases/rmMinter');
const { rmMinter_not_minter } = require('../test_cases/rmMinter_not_minter');
const { rmMinter_not_admin } = require('../test_cases/rmMinter_not_admin');

const { redeemTokens } = require('../test_cases/redeemTokens');
const { redeemTokens_signature_not_minter } = require('../test_cases/redeemTokens_signature_not_minter');
const { redeemTokens_invalid_signature } = require('../test_cases/redeemTokens_invalid_signature');
const { redeemTokens_invalid_code } = require('../test_cases/redeemTokens_invalid_code');

contract('T721Admin', (accounts) => {

    before(async function() {

        const T721AdminArtifact = artifacts.require(T721A_CONTRACT_NAME);
        const T721AdminInstance = await T721AdminArtifact.deployed();
        const T721TokenArtifact = artifacts.require(T721T_CONTRACT_NAME);
        const T721TokenInstance = await T721TokenArtifact.deployed();

        const DummyArtifact = artifacts.require('Dummy');
        const DummyInstance = await DummyArtifact.deployed();

        this.contracts = {
            [T721A_CONTRACT_NAME]: T721AdminInstance,
            [T721T_CONTRACT_NAME]: T721TokenInstance,
            'Dummy': DummyInstance,
            'DummyArtifact': DummyArtifact,
        };

        this.snap_id = await snapshot();
        this.accounts = accounts;
        this.expect = expect;
    });

    beforeEach(async function() {
        const status = await revert(this.snap_id);
        expect(status).to.be.true;
        this.snap_id = await snapshot();
    });

    describe('Membership', function() {

        it('initial admins & minters', constructor);

        it('add admin', addAdmin);
        it('rm admin', rmAdmin);
        it('vote on invalid idx', vote_invalid_index);
        it('vote on outdated vote', vote_outdated_vote);
        it('vote useless vote', vote_useless_vote);
        it('add admin that is already admin', addAdmin_already_admin);
        it('rm admin that is not admin', rmAdmin_not_admin);
        it('add zero addr', addAdmin_zero_addr);
        it('vote false', addAdmin_vote_false);
        it('modifier owner check', addAdmin_not_admin_sender);

        it('add minter', addMinter);
        it('add minter not admin', addMinter_not_admin);
        it('add minter that is already minter', addMinter_already_minter);
        it('rm minter', rmMinter);
        it('rm minter not admin', rmMinter_not_admin);
        it('rm minter not minter', rmMinter_not_minter);
    });

    describe('Redeem', function() {

        it('should properly mint with valid signature', redeemTokens);
        it('should fail minting with signature from non minter', redeemTokens_signature_not_minter);
        it('should fail for invalid signature', redeemTokens_invalid_signature);
        it('should fail minting with invalid code', redeemTokens_invalid_code);

    });

});
