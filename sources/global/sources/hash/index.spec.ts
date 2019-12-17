import {use, expect} from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
use(chaiAsPromised);

import {setVerbosity}                                        from '../log';
import { isKeccak256, keccak256, toAcceptedKeccak256Format } from './index';

setVerbosity(true);

const ticket721 = '0xd8283ec13b28c9220077721a2c20aaae180a38c82ac58da608be0527f26d7ab6';

describe('Hash', function() {

    describe('keccak256', function() {

        it('Should perform keccak256 hash', function() {
            expect(keccak256('ticket721')).to.equal(ticket721);
        });

    });

    describe('isKeccak256', function() {

        it('Should find given hash valid', function() {
            expect(isKeccak256(ticket721)).to.equal(true);
        });

        it('Should find given unprefixed hash valid', function() {
            expect(isKeccak256(ticket721.slice(2))).to.equal(true);
        });

        it('Should find given short hash invalid', function() {
            expect(isKeccak256(ticket721.slice(3))).to.equal(false);
        });

        it('Should find given invalid characters invalid', function() {
            expect(isKeccak256('+'.repeat(128))).to.equal(false);
        });

    });

    describe('toAcceptedKeccak256Format', function() {

        it('Should not change format', function() {
            expect(toAcceptedKeccak256Format(ticket721)).to.equal(ticket721);
        });

        it('Should lowercase', function() {
            expect(toAcceptedKeccak256Format(ticket721.toUpperCase())).to.equal(ticket721);
        });

        it('Should add prefix', function() {
            expect(toAcceptedKeccak256Format(ticket721.slice(2))).to.equal(ticket721);
        });

        it('Should return null', function() {
            expect(toAcceptedKeccak256Format(ticket721.slice(3))).to.equal(null);
        });

    });

});
