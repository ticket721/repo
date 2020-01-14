import { uuidEq } from './index';

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

});
