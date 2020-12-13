import { Transaction }                                           from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSalesResponse.dto';
import { DAY, HALF, HOUR, MINUTE, QUARTER, SIXHOUR, TWELVEHOUR } from './time';
import { trimByValue }                                           from './trim';

export const fillTheGapsByValue = (transactions: Transaction[], end: Date, value: number, status: string, start?: Date): Transaction[] => {

    if (!start && transactions.length === 0) {
        return transactions;
    }

    const startVal = start ? trimByValue(start, value).getTime() : transactions[0].date.getTime();
    const endVal = end.getTime();

    const ret: Transaction[] = [];

    for (let minute = startVal; minute <= endVal; minute += value) {
        const foundIndex = transactions.findIndex((transaction: Transaction): boolean => transaction.date.getTime() === minute);

        if (foundIndex === -1) {
            ret.push({
                date: new Date(minute),
                price: 0,
                currency: null,
                status: status as 'waiting' | 'confirmed' | 'rejected',
                quantity: 0
            });
        } else {
            ret.push(transactions[foundIndex]);
        }
    }

    return ret;

}

export const fillTheGaps = (mode: string, transactions: Transaction[], end: Date, status: string, start?: Date): Transaction[] => {
    switch (mode) {
        case 'minutes': return fillTheGapsByValue(transactions, end, MINUTE, status, start);
        case '5minutes': return fillTheGapsByValue(transactions, end, 5 * MINUTE, status, start);
        case 'quarters': return fillTheGapsByValue(transactions, end, QUARTER, status, start);
        case 'halfs': return fillTheGapsByValue(transactions, end, HALF, status, start);
        case 'hours': return fillTheGapsByValue(transactions, end, HOUR, status, start);
        case 'sixhours': return fillTheGapsByValue(transactions, end, SIXHOUR, status, start);
        case 'twelvehours': return fillTheGapsByValue(transactions, end, TWELVEHOUR, status, start);
        case 'days': return fillTheGapsByValue(transactions, end, DAY, status, start);
    }
}
