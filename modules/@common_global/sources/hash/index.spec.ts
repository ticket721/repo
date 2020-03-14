import {setVerbosity}                                        from '../log';
import { isKeccak256, keccak256, toAcceptedKeccak256Format } from './index';

setVerbosity(true);

const ticket721 = '0xd8283ec13b28c9220077721a2c20aaae180a38c82ac58da608be0527f26d7ab6';

describe('Hash', function() {

    describe('keccak256', function() {

        test('Should perform keccak256 hash', async function() {
            expect(keccak256('ticket721')).toEqual(ticket721);
        });

    });

    describe('isKeccak256', function() {

        test('Should find given hash valid', async function() {
            expect(isKeccak256(ticket721)).toEqual(true);
        });

        test('Should find given unprefixed hash valid', async function() {
            expect(isKeccak256(ticket721.slice(2))).toEqual(true);
        });

        test('Should find given short hash invalid', async function() {
            expect(isKeccak256(ticket721.slice(3))).toEqual(false);
        });

        test('Should find given invalid characters invalid', async function() {
            expect(isKeccak256('+'.repeat(128))).toEqual(false);
        });

    });

    describe('toAcceptedKeccak256Format', function() {

        test('Should not change format', async function() {
            expect(toAcceptedKeccak256Format(ticket721)).toEqual(ticket721);
        });

        test('Should lowercase', async function() {
            expect(toAcceptedKeccak256Format(ticket721.toUpperCase())).toEqual(ticket721);
        });

        test('Should add prefix', async function() {
            expect(toAcceptedKeccak256Format(ticket721.slice(2))).toEqual(ticket721);
        });

        test('Should return null', async function() {
            expect(toAcceptedKeccak256Format(ticket721.slice(3))).toEqual(null);
        });

    });

});
