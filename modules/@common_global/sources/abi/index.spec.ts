import { encode, getT721ControllerGroupID } from './index';

describe('ABI', function() {

    describe('encode', function() {

        it('should encode string and uint', function() {

            expect(encode(['string', 'uint256'], ['hi', 123])).toEqual('0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000007b00000000000000000000000000000000000000000000000000000000000000026869000000000000000000000000000000000000000000000000000000000000');

        });

    });

    describe('getT721ControllerGroupID', function() {

        it('should get group id', function() {

            const uuid = '116de99a-2cd0-4071-bd2a-4c1ab2b32d24';
            const address = '0x0618A298E7a1d15d251fb2a00056E4db74869d8A';

            expect(getT721ControllerGroupID(uuid, address)).toEqual('0x7ed6592bcb17629ae5b9de488e1b8b543347a8e653843da8ccce812ebb9132f7')

        });

    });

});
