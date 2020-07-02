import { decimalToHex, isFutureDateRange, isValidDateRange, leftPad, log2, serialize, toB32, toHex, uuidEq } from './index';

describe('Utils', function () {

    describe('uuidEq', function () {

        it('should eq uuids', function() {

            const uuid1 = '4feaffbb-d786-4f8c-9c73-c38250681eb0';
            const uuid2 = '4feaffbb-d786-4f8c-9c73-c38250681eb0'.toUpperCase();

            expect(uuidEq(uuid1, uuid2)).toBeTruthy();

        });

        it('should not eq uuids', function() {

            const uuid1 = '4feaffbb-d786-4f8c-9c73-c38250681eb0';
            const uuid2 = '4feaffbb-d786-4f8d-9c73-c38250681eb0'.toUpperCase();

            expect(uuidEq(uuid1, uuid2)).toBeFalsy();

        });

    });

    describe('toB32', function() {

        it('should convert Ticket721 to B32 hex', function() {

            const b32t721 = toB32('Ticket721');

            expect(b32t721).toEqual('0x5469636b65743732310000000000000000000000000000000000000000000000');

        })

    });

    describe('leftPad', function() {

        it('should left pad to 16 characters', function() {

            expect(leftPad('hi', 16)).toEqual('00000000000000hi');

        });

        it('should do nothing', function() {

            expect(leftPad('hihihi', 2)).toEqual('hihihi');

        });

    });

    describe('serialize', function() {

        it('should serialize an already serialized string', function() {

            expect(serialize('vip')).toEqual('vip');

        });

        it('should serialize a string with uppercase letters', function() {

            expect(serialize('Vip')).toEqual('vip');

        });

        it('should serialize a string with withespaces', function() {

            expect(serialize('Vip Ticket')).toEqual('vip_ticket');

        });

    });

    describe('isValidDateRange', function() {

        it('null date begin', function() {

            const end = new Date(Date.now() + 1000 * 120);

            expect(isValidDateRange(null, end)).toBeFalsy();

        });

        it('null date end', function() {

            const begin = new Date(Date.now() + 1000 * 60);

            expect(isValidDateRange(begin, null)).toBeFalsy();

        });

        it('null dates', function() {

            expect(isValidDateRange(null, null)).toBeFalsy();

        });
        
        it('is indeed valid date range', function() {

            const begin = new Date(Date.now() + 1000 * 60);
            const end = new Date(Date.now() + 1000 * 120);

            expect(isValidDateRange(begin, end)).toBeTruthy();

        });

        it('end before begin error', function() {

            const begin = new Date(Date.now() + 1000 * 120);
            const end = new Date(Date.now() + 1000 * 60);

            expect(isValidDateRange(begin, end)).toBeFalsy();

        });

        it('past dates', function() {

            const begin = new Date(Date.now() - 1000 * 120);
            const end = new Date(Date.now() - 1000 * 60);

            expect(isValidDateRange(begin, end)).toBeTruthy();

        });

    });
    describe('isFutureDateRange', function() {

        it('null date begin', function() {

            const end = new Date(Date.now() + 1000 * 120);

            expect(isFutureDateRange(null, end)).toBeFalsy();

        });

        it('null date end', function() {

            const begin = new Date(Date.now() + 1000 * 60);

            expect(isFutureDateRange(begin, null)).toBeFalsy();

        });

        it('null dates', function() {

            expect(isFutureDateRange(null, null)).toBeFalsy();

        });

        it('is indeed future date range', function() {

            const begin = new Date(Date.now() + 1000 * 60);
            const end = new Date(Date.now() + 1000 * 120);

            expect(isFutureDateRange(begin, end)).toBeTruthy();

        });

        it('end before begin error', function() {

            const begin = new Date(Date.now() + 1000 * 120);
            const end = new Date(Date.now() + 1000 * 60);

            expect(isFutureDateRange(begin, end)).toBeFalsy();

        });

        it('past dates', function() {

            const begin = new Date(Date.now() - 1000 * 60);
            const end = new Date(Date.now() - 1000 * 120);

            expect(isFutureDateRange(begin, end)).toBeFalsy();

        });

    });

    describe('toHex', function() {

        it('should properly convert to hex', function () {
            const input = 'test';

            expect(toHex(input)).toEqual('0x74657374');
        })

    });

    describe('decimalToHex', function() {

        it('should properly convert 15 to 0x0f', function () {

            const input = '15';

            expect(decimalToHex(input)).toEqual('0x0f');

        });

        it('should properly convert 16 to 0x10', function () {

            const input = '16';

            expect(decimalToHex(input)).toEqual('0x10');

        });

        it('should properly convert 256 to 0xff', function () {

            const input = '255';

            expect(decimalToHex(input)).toEqual('0xff');

        });

    });

    describe('log2', function() {

        it('should properly compute log of 1', function() {
            const input = '1';

            expect(log2(input)).toEqual(0);
        })

        it('should properly compute log of 0', function() {
            const input = '0';

            expect(log2(input)).toEqual(-1);
        })

    });

});
