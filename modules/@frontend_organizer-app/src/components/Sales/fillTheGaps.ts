import { Transaction }                                           from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSalesResponse.dto';
import { DAY, HALF, HOUR, MINUTE, QUARTER, SIXHOUR, TWELVEHOUR } from './time';

export const fillTheGapsByValue = (transactions: Transaction[], end: Date, value: number): Transaction[] => {
    if (transactions.length === 0) {
        return transactions;
    }

    const startVal = transactions[0].date.getTime();
    const status = transactions[0].status;
    const endVal = end.getTime();

    const ret: Transaction[] = [];

    for (let minute = startVal; minute <= endVal; minute += value) {
        const foundIndex = transactions.findIndex((transaction: Transaction): boolean => transaction.date.getTime() === minute);

        if (foundIndex === -1) {
            ret.push({
                date: new Date(minute),
                price: 0,
                currency: null,
                status,
                quantity: 0
            });
        } else {
            ret.push(transactions[foundIndex]);
        }
    }

    return ret;

}

export const fillTheGaps = (mode: string, transactions: Transaction[], end: Date): Transaction[] => {
    switch (mode) {
        case 'minutes': return fillTheGapsByValue(transactions, end, MINUTE);
        case 'quarters': return fillTheGapsByValue(transactions, end, QUARTER);
        case 'halfs': return fillTheGapsByValue(transactions, end, HALF);
        case 'hours': return fillTheGapsByValue(transactions, end, HOUR);
        case 'sixhours': return fillTheGapsByValue(transactions, end, SIXHOUR);
        case 'twelvehours': return fillTheGapsByValue(transactions, end, TWELVEHOUR);
        case 'days': return fillTheGapsByValue(transactions, end, DAY);
    }
}
