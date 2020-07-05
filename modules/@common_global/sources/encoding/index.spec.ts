import { b64Decode, b64Encode } from './index';

describe('encoding', function() {

    describe('b64', function() {

        it('should properly encode and decode string', function() {

            const input = 'mortimr';

            const encoded = b64Encode(input);

            expect(encoded).not.toEqual(input);

            expect(b64Decode(encoded)).toEqual(input);

        });

    });

});
