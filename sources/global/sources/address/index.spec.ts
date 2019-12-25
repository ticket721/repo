import { isAddress, toAcceptedAddressFormat } from './index';
import {setVerbosity}                         from '../log';

setVerbosity(true);

const perfect = '0x2a65Aca4D5fC5B5C859090a6c34d164135398226';

describe('Address', function() {

    describe('isAddress', function() {

        test('Checking valid prefixed + checksummed address', async function() {
            expect(isAddress(perfect)).toBeTruthy();
        });

        test('Checking valid checksummed address', async function() {
            expect(isAddress(perfect.slice(2))).toBeTruthy();
        });

        test('Checking valid prefixed address', async function() {
            expect(isAddress(perfect.toLowerCase())).toBeTruthy();
        });

        test('Checking valid address', async function() {
            expect(isAddress(perfect.slice(2).toLowerCase())).toBeTruthy();
        });

        test('Checking invalid address', async function() {
            expect(isAddress(perfect.slice(4))).toBeFalsy();
        });

    });

    describe('toAcceptedAddressFormat', function() {

        test('Should not change the address', async function() {
            expect(perfect).toEqual(toAcceptedAddressFormat(perfect));
        });

        test('Should recapitalize', async function() {
            expect(toAcceptedAddressFormat(perfect.toLowerCase())).toEqual(perfect);
        });

        test('Should add prefix', async function() {
            expect(toAcceptedAddressFormat(perfect.slice(2))).toEqual(perfect);
        });

        test('Should return null', async function() {
            expect(toAcceptedAddressFormat(perfect.slice(4))).toEqual(null);
        });

    });

});
