const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { revert, snapshot } = require('../test_cases/utils');
chai.use(chaiAsPromised);

const { create_scope } = require('../test_cases/create_scope');
const { create_scope_uppercase } = require('../test_cases/create_scope_uppercase');
const { create_scope_empty } = require('../test_cases/create_scope_empty');
const { create_scope_twice } = require('../test_cases/create_scope_twice');

const { mint } = require('../test_cases/mint');
const { mint_token_uri } = require('../test_cases/mint_token_uri');
const { mint_invalid_scope } = require('../test_cases/mint_invalid_scope');
const { mint_invalid_minter } = require('../test_cases/mint_invalid_minter');
const { mint_valid_minter } = require('../test_cases/mint_valid_minter');

const { transferFrom } = require('../test_cases/transferFrom');
const { transferFrom_approved } = require('../test_cases/transferFrom_approved');
const { transferFrom_scope_admin } = require('../test_cases/transferFrom_scope_admin');
const { transferFrom_unapproved } = require('../test_cases/transferFrom_unapproved');

const { safeTransferFrom } = require('../test_cases/safeTransferFrom');
const { safeTransferFrom_approved } = require('../test_cases/safeTransferFrom_approved');
const { safeTransferFrom_scope_admin } = require('../test_cases/safeTransferFrom_scope_admin');
const { safeTransferFrom_unapproved } = require('../test_cases/safeTransferFrom_unapproved');

const { safeTransferFrom_data } = require('../test_cases/safeTransferFrom_data');
const { safeTransferFrom_data_approved } = require('../test_cases/safeTransferFrom_data_approved');
const { safeTransferFrom_data_scope_admin } = require('../test_cases/safeTransferFrom_data_scope_admin');
const { safeTransferFrom_data_unapproved } = require('../test_cases/safeTransferFrom_data_unapproved');
const { safeTransferFrom_data_invalid_contract } = require('../test_cases/safeTransferFrom_data_invalid_contract');

const { tokenUriProvider } = require('../test_cases/tokenUriProvider');
const { name } = require('../test_cases/name');
const { symbol } = require('../test_cases/symbol');

const expect = chai.expect;
contract('ticketforge', (accounts) => {

    before(async () => {
        this.snap_id = await snapshot();
    });

    beforeEach(async () => {
        const status = await revert(this.snap_id);
        expect(status).to.be.true;
        this.snap_id = await snapshot();
    });

    describe('scope', () => {

        it('create scope', create_scope.bind(null, accounts, expect));
        it('create scope with uppercase letter', create_scope_uppercase.bind(null, accounts, expect));
        it('create scope with empty name', create_scope_empty.bind(null, accounts, expect));
        it('create scope twice', create_scope_twice.bind(null, accounts, expect));

    })

    describe('mint', () => {

        it('mint', mint.bind(null, accounts, expect));
        it('mint with token uri', mint_token_uri.bind(null, accounts, expect));
        it('mint with invalid scope', mint_invalid_scope.bind(null, accounts, expect));
        it('mint with invalid minter', mint_invalid_minter.bind(null, accounts, expect));
        it('mint with valid minter', mint_valid_minter.bind(null, accounts, expect));

    })

    describe('transferFrom', () => {

        it('transferFrom', transferFrom.bind(null, accounts, expect));
        it('transferFrom by approved account', transferFrom_approved.bind(null, accounts, expect));
        it('transferFrom by scope admin', transferFrom_scope_admin.bind(null, accounts, expect));
        it('transferFrom by unapproved', transferFrom_unapproved.bind(null, accounts, expect));

    })

    describe('safeTransferFrom (3 args)', () => {

        it('safeTransferFrom', safeTransferFrom.bind(null, accounts, expect));
        it('safeTransferFrom by approved account', safeTransferFrom_approved.bind(null, accounts, expect));
        it('safeTransferFrom by scope admin', safeTransferFrom_scope_admin.bind(null, accounts, expect));
        it('safeTransferFrom by unapproved', safeTransferFrom_unapproved.bind(null, accounts, expect));

    })

    describe('safeTransferFrom (4 args) to contract', () => {

        it('safeTransferFrom with data', safeTransferFrom_data.bind(null, accounts, expect));
        it('safeTransferFrom with data by approved account', safeTransferFrom_data_approved.bind(null, accounts, expect));
        it('safeTransferFrom with data by scope admin', safeTransferFrom_data_scope_admin.bind(null, accounts, expect));
        it('safeTransferFrom with data by unapproved', safeTransferFrom_data_unapproved.bind(null, accounts, expect));
        it('safeTransferFrom with data to invalid contract', safeTransferFrom_data_invalid_contract.bind(null, accounts, expect));

    })

    describe('ERC721 Metadata', () => {

        it('tokenUriProvider', tokenUriProvider.bind(null, accounts, expect));
        it('name', name.bind(null, accounts, expect));
        it('symbol', symbol.bind(null, accounts, expect));

    })

});
