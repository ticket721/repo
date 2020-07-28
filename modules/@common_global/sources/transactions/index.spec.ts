import { isTrackingId, isTransactionHash, toAcceptedTransactionHashFormat } from './index';

describe('Transactions', function() {

    describe('isTransactionHash', function() {

        it('should verify valid hash', function() {
            expect(isTransactionHash('0x0cbc91fb4e6618e61072f537cf34934efa4fbc231c8549208856bb08c59f9a33')).toBeTruthy();
        });

        it('should detect invalid hash', function() {
            expect(isTransactionHash('0xbc91fb4e6618e61072f537cf34934efa4fbc231c8549208856bb08c59f9a33')).toBeFalsy();
        });

    });

    describe('isTrackingId', function() {

        it('should verify valid tracking id', function() {
            expect(isTrackingId('01E9ZSDHMYYFMW3E1CVQ9ADVHK')).toBeTruthy();
        });

        it('should detect invalid tracking id', function() {
            expect(isTrackingId('01AA01AAAAAAA01AA01AAAAAAx')).toBeFalsy();
        });

    });
    describe('toAcceptedTransactionHashFormat', function() {

        it('converts to accepted hash', function() {
            expect(toAcceptedTransactionHashFormat('0x0cbc91fb4e6618e61072f537cf34934efa4fbc231c8549208856bb08c59f9a33')).toEqual('0x0cbc91fb4e6618e61072f537cf34934efa4fbc231c8549208856bb08c59f9a33');
        });

        it('converts to accepted hash and lowercases characters', function() {
            expect(toAcceptedTransactionHashFormat('0x0CBc91fb4e6618e61072f537cf34934efa4fbc231c8549208856bb08c59f9a33')).toEqual('0x0cbc91fb4e6618e61072f537cf34934efa4fbc231c8549208856bb08c59f9a33');
        });

        it('error while converting', function() {
            expect(toAcceptedTransactionHashFormat('0xBc91fb4e6618e61072f537cf34934efa4fbc231c8549208856bb08c59f9a33')).toEqual(null);
        });

    });

});
