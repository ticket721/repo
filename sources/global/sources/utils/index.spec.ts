import { leftPad, toB32, uuidEq } from './index';

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

});
