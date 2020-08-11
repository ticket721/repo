const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { revert, snapshot } = require('./utils');
chai.use(chaiAsPromised);
const expect = chai.expect;

const { T721C_CONTRACT_NAME } = require('./constants');

const { getGroupID } = require('../test_cases/getGroupID');
const { balanceOf } = require('../test_cases/balanceOf');
const { getTicketAffiliation } = require('../test_cases/getTicketAffiliation');
const { isCodeConsummable } = require('../test_cases/isCodeConsummable');

const { mint } = require('../test_cases/mint');
const { mint_for_free } = require('../test_cases/mint_for_free');
const { mint_expired_authorization } = require('../test_cases/mint_expired_authorization');
const { mint_invalid_signature } = require('../test_cases/mint_invalid_signature');
const { mint_missing_addr_for_minting } = require('../test_cases/mint_missing_addr_for_minting');
const { mint_missing_addr_for_payment } = require('../test_cases/mint_missing_addr_for_payment');
const { mint_missing_b32_for_minting } = require('../test_cases/mint_missing_b32_for_minting');
const { mint_missing_controller_address } = require('../test_cases/mint_missing_controller_address');
const { mint_missing_currency_number } = require('../test_cases/mint_missing_currency_number');
const { mint_missing_signature_for_minting } = require('../test_cases/mint_missing_signature_for_minting');
const { mint_missing_ticket_count } = require('../test_cases/mint_missing_ticket_count');
const { mint_missing_uints_for_minting } = require('../test_cases/mint_missing_uints_for_minting');
const { mint_missing_uints_for_payment } = require('../test_cases/mint_missing_uints_for_payment');
const { mint_no_tickets } = require('../test_cases/mint_no_tickets');

const { withdraw } = require('../test_cases/withdraw');
const { withdraw_expired_authorization } = require('../test_cases/withdraw_expired_authorization');
const { withdraw_invalid_signature } = require('../test_cases/withdraw_invalid_signature');
const { withdraw_balance_too_low } = require('../test_cases/withdraw_balance_too_low');
const { withdraw_duplicate_code } = require('../test_cases/withdraw_duplicate_code');

const { attach } = require('../test_cases/attach');
const { attach_no_fees } = require('../test_cases/attach_no_fees');
const { attach_expired_authorization } = require('../test_cases/attach_expired_authorization');
const { attach_missing_controller_address } = require('../test_cases/attach_missing_controller_address');
const { attach_missing_currency_number } = require('../test_cases/attach_missing_currency_number');
const { attach_for_free } = require('../test_cases/attach_for_free');
const { attach_missing_uints_for_payment } = require('../test_cases/attach_missing_uints_for_payment');
const { attach_missing_uints_for_attachment } = require('../test_cases/attach_missing_uints_for_attachment');
const { attach_missing_addr_for_payment } = require('../test_cases/attach_missing_addr_for_payment');
const { attach_missing_b32_for_attachment } = require('../test_cases/attach_missing_b32_for_attachment');
const { attach_missing_attachment_count } = require('../test_cases/attach_missing_attachment_count');
const { attach_missing_signature_for_attachment } = require('../test_cases/attach_missing_signature_for_attachment');
const { attach_no_attachment } = require('../test_cases/attach_no_attachments');
const { attach_invalid_signature } = require('../test_cases/attach_invalid_signature');

contract('T721Controller_v0', (accounts) => {

    before(async function() {
        const T721ControllerArtifact = artifacts.require(T721C_CONTRACT_NAME);
        const T721ControllerInstance = await T721ControllerArtifact.deployed();

        const ERC20MockArtifact = artifacts.require('ERC20Mock_v0');
        const DaiMockArtifact = artifacts.require('DaiMock_v0');
        const ERC721MockArtifact = artifacts.require('ERC721Mock_v0');

        const ERC20Instance = await ERC20MockArtifact.deployed();
        const DaiInstance = await DaiMockArtifact.deployed();
        const ERC721Instance = await ERC721MockArtifact.deployed();

        this.contracts = {
            [T721C_CONTRACT_NAME]: T721ControllerInstance,
            Dai: DaiInstance,
            ERC721: ERC721Instance,
            ERC20: ERC20Instance,
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

    describe('Utils', function() {

        it('getGroupID', getGroupID);
        it('balanceOf', balanceOf);
        it('getTicketAffiliation', getTicketAffiliation);
        it('isCodeConsummable', isCodeConsummable);

    });

    describe('Mint', function() {

        it('should mint 5 tickets with 2 payments', mint);
        it('mint for free', mint_for_free);
        it('mint expired authorization', mint_expired_authorization);
        it('mint invalid signature', mint_invalid_signature);
        it('mint missing addr for minting', mint_missing_addr_for_minting);
        it('mint missing addr for payment', mint_missing_addr_for_payment);
        it('mint missing b32 for minting', mint_missing_b32_for_minting);
        it('mint missing controller address', mint_missing_controller_address);
        it('mint missing currency number', mint_missing_currency_number);
        it('mint missing signature for minting', mint_missing_signature_for_minting);
        it('mint missing ticket count', mint_missing_ticket_count);
        it('mint missing uints for minting', mint_missing_uints_for_minting);
        it('mint missing uints for payment', mint_missing_uints_for_payment);
        it('mint no tickets', mint_no_tickets);

    });

    describe('Attach', function() {

        it('should attach 5 beers and 2 fries', attach);
        it('should with no fees', attach_no_fees);
        it('attach missing controller address', attach_missing_controller_address);
        it('attach expired authorization', attach_expired_authorization);
        it('attach missing currency number', attach_missing_currency_number);
        it('attach for free', attach_for_free);
        it('attach missing uints for payment', attach_missing_uints_for_payment);
        it('attach missing uints for attachment', attach_missing_uints_for_attachment);
        it('attach missing addr for payment', attach_missing_addr_for_payment);
        it('attach missing b32 for attachment', attach_missing_b32_for_attachment);
        it('attach missing attachment count', attach_missing_attachment_count);
        it('attach missing signature for attachment', attach_missing_signature_for_attachment);
        it('attach no attachment', attach_no_attachment);
        it('attach invalid signature', attach_invalid_signature);

    });

    describe('Withdraw', function() {

        it('withdraw everything', withdraw);
        it('withdraw expired authorization', withdraw_expired_authorization);
        it('withdraw with invalid signature', withdraw_invalid_signature);
        it('withdraw balance too low', withdraw_balance_too_low);
        it('withdraw duplicate code', withdraw_duplicate_code);

    });


});
