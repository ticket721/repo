const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { revert, snapshot } = require('./utils');
chai.use(chaiAsPromised);
const expect = chai.expect;

const { setScopeIndex, CONTRACT_NAME, SCOPE_NAME, CHAIN_ID } = require('./constants');

const { getNonce } = require('../test_cases/getNonce');
const { sealSale } = require('../test_cases/sealSale');
const { sealSale_expired } = require('../test_cases/sealSale_expired');
const { sealSale_for_free } = require('../test_cases/sealSale_for_free');
const { sealSale_no_fees } = require('../test_cases/sealSale_no_fees');
const { sealSale_missing_actor_addresses } = require('../test_cases/sealSale_missing_actor_addresses');
const { sealSale_missing_currency_number } = require('../test_cases/sealSale_missing_currency_number');
const { sealSale_missing_addr_for_payment } = require('../test_cases/sealSale_missing_addr_for_payment');
const { sealSale_missing_uints_for_sale } = require('../test_cases/sealSale_missing_uints_for_sale');
const { sealSale_missing_uints_for_payment } = require('../test_cases/sealSale_missing_uints_for_payment');
const { sealSale_missing_signatures } = require('../test_cases/sealSale_missing_signatures');
const { sealSale_invalid_buyer_signature } = require('../test_cases/sealSale_invalid_buyer_signature');
const { sealSale_invalid_seller_signature } = require('../test_cases/sealSale_invalid_seller_signature');
const { sealSale_invalid_event_controller_signature } = require('../test_cases/sealSale_invalid_event_controller_signature');
const { sealSale_invalid_event_controller } = require('../test_cases/sealSale_invalid_event_controller');
const { sealSale_invalid_nonce } = require('../test_cases/sealSale_invalid_nonce');
const { sealSale_buyer_smart_wallet } = require('../test_cases/sealSale_buyer_smart_wallet');
const { sealSale_buyer_invalid_smart_wallet } = require('../test_cases/sealSale_buyer_invalid_smart_wallet');
const { sealSale_seller_smart_wallet } = require('../test_cases/sealSale_seller_smart_wallet');
const { sealSale_seller_invalid_smart_wallet } = require('../test_cases/sealSale_seller_invalid_smart_wallet');

contract('metamarketplace', (accounts) => {

    before(async function() {
        const ERC20MockArtifact = artifacts.require('ERC20Mock_v0');
        const DaiMockArtifact = artifacts.require('DaiMock_v0');
        const ERC721MockArtifact = artifacts.require('ERC721Mock_v0');
        const SmartWalletMockArtifact = artifacts.require('SmartWalletMock_v0');
        const MetaMarketplaceArtifact = artifacts.require(CONTRACT_NAME);
        const T721ControllerMockArtifact = artifacts.require('T721ControllerMock_v0');

        const ERC20Instance = await ERC20MockArtifact.deployed();
        const DaiInstance = await DaiMockArtifact.deployed();
        const ERC721Instance = await ERC721MockArtifact.deployed();
        const MetaMarketplaceInstance = await MetaMarketplaceArtifact.deployed();
        const T721ControllerMockInstance = await T721ControllerMockArtifact.deployed();

        await ERC721Instance.createScope(SCOPE_NAME, '0x0000000000000000000000000000000000000000', [MetaMarketplaceInstance.address], [accounts[8]], false);
        const scope = await ERC721Instance.getScope(SCOPE_NAME);
        setScopeIndex(scope.scope_index.toNumber());

        this.contracts = {
            [CONTRACT_NAME]: MetaMarketplaceInstance,
            ERC20: ERC20Instance,
            Dai: DaiInstance,
            ERC721: ERC721Instance,
            SmartWalletMockArtifact: SmartWalletMockArtifact,
            T721ControllerMock: T721ControllerMockInstance
        };

        this.snap_id = await snapshot();
        this.accounts = accounts;
        this.expect = expect;
        this.network_id = await web3.eth.net.getId();
    });

    beforeEach(async function() {
        const status = await revert(this.snap_id);
        expect(status).to.be.true;
        this.snap_id = await snapshot();
    });

    describe('MarketplaceOffer', function() {

        describe('Utility', function() {

            it('getNonce', getNonce);

        });

        describe('sealSale', function() {

            it('sealSale', sealSale);
            it('sealSale for free', sealSale_for_free);
            it('sealSale no fees', sealSale_no_fees);
            it('sealSale expired', sealSale_expired);
            it('sealSale missing actor addresses', sealSale_missing_actor_addresses);
            it('sealSale missing currency number', sealSale_missing_currency_number);
            it('sealSale missing addr for payment', sealSale_missing_addr_for_payment);
            it('sealSale missing uints for sale', sealSale_missing_uints_for_sale);
            it('sealSale missing uints for payment', sealSale_missing_uints_for_payment);
            it('sealSale missing signatures', sealSale_missing_signatures);
            it('sealSale invalid buyer signature', sealSale_invalid_buyer_signature);
            it('sealSale invalid seller signature', sealSale_invalid_seller_signature);
            it('sealSale invalid event controller signature', sealSale_invalid_event_controller_signature);
            it('sealSale invalid event controller', sealSale_invalid_event_controller);
            it('sealSale invalid nonce', sealSale_invalid_nonce);
            it('sealSale buyer smart wallet', sealSale_buyer_smart_wallet);
            it('sealSale buyer invalid smart wallet', sealSale_buyer_invalid_smart_wallet);
            it('sealSale seller smart wallet', sealSale_seller_smart_wallet);
            it('sealSale seller invalid smart wallet', sealSale_seller_invalid_smart_wallet);

        });

    });

});
