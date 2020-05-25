import { toHeaderFormat } from '@lib/common/utils/toHeaderFormat';

describe('toHeaderFormat', function() {

    it('should properly handle single field object', function() {

        const headers = {
            Authorization: 'Bearer atoken'
        };

        const formattedHeaders = toHeaderFormat(headers);

        expect(formattedHeaders).toEqual([{
            name: 'Authorization',
            value: 'Bearer atoken'
        }]);

    });

    it('should properly handle multi field object', function() {

        const headers = {
            Authorization: 'Bearer atoken',
            AnotherField: 'Another Value',
            AgainAnotherField: 'Again Another Value'
        };

        const formattedHeaders = toHeaderFormat(headers);

        expect(formattedHeaders).toEqual([{
            name: 'Authorization',
            value: 'Bearer atoken'
        }, {
            name: 'AnotherField',
            value: 'Another Value'
        }, {
            name: 'AgainAnotherField',
            value: 'Again Another Value'
        }]);

    });

    it('should properly handle empty', function() {

        const headers = {
        };

        const formattedHeaders = toHeaderFormat(headers);

        expect(formattedHeaders).toEqual(undefined);

    });

});
