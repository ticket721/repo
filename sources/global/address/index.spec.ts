import {use, expect} from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
use(chaiAsPromised);

import { isAddress }  from './index';
import {setVerbosity} from '../log';

setVerbosity(true);

const perfect = '0x2a65Aca4D5fC5B5C859090a6c34d164135398226';

describe('Address', function() {

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
