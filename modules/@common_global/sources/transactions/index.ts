import { log }       from '../log';

/**
 * Transaction Hash Reguar Expression
 */
const txHashRegExp: RegExp = /^0x[abcdefABCDEF0123456789]{64}$/;

const trackingIdRegExp: RegExp = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/;

export const toAcceptedTransactionHashFormat = (transactionHash: string): string => {
    log(`transactions::toAcceptedTransactionHash | formatting ${transactionHash}`);
    if (!isTransactionHash(transactionHash)) {
        return null;
    }

    return transactionHash.toLowerCase();
};

export const isTransactionHash = (transactionHash: string): boolean => {
    log(`transactions::isTransactionHash | verifying ${transactionHash}`);
    return txHashRegExp.test(transactionHash);
};

export const isTrackingId = (trackingId: string): boolean => {
    log(`transactions::isTrackingId | verifying ${trackingId}`);
    return trackingIdRegExp.test(trackingId);
}
