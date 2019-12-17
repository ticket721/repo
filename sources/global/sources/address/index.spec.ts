import {use, expect} from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
use(chaiAsPromised);

import { isAddress, toAcceptedAddressFormat } from './index';
import {setVerbosity}                         from '../log';

setVerbosity(true);

const perfect = '0x2a65Aca4D5fC5B5C859090a6c34d164135398226';

describe('Address', function() {

    describe('isAddress', function() {

        it('Checking valid prefixed + checksummed address', function() {
            expect(isAddress(perfect)).to.be.true;
        });

        it('Checking valid checksummed address', function() {
            expect(isAddress(perfect.slice(2))).to.be.true;
        });

        it('Checking valid prefixed address', function() {
            expect(isAddress(perfect.toLowerCase())).to.be.true;
        });

        it('Checking valid address', function() {
            expect(isAddress(perfect.slice(2).toLowerCase())).to.be.true;
        });

        it('Checking invalid address', function() {
            expect(isAddress(perfect.slice(4))).to.be.false;
        });

    });

    describe('toAcceptedAddressFormat', function() {

        it('Should not change the address', function() {
            expect(perfect).to.equal(toAcceptedAddressFormat(perfect));
        });

        it('Should recapitalize', function() {
            expect(toAcceptedAddressFormat(perfect.toLowerCase())).to.equal(perfect);
        });

        it('Should add prefix', function() {
            expect(toAcceptedAddressFormat(perfect.slice(2))).to.equal(perfect);
        });

        it('Should return null', function() {
            expect(toAcceptedAddressFormat(perfect.slice(4))).to.equal(null);
        });

    });

});
