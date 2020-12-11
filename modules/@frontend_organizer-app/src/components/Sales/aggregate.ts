import { Transaction } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSalesResponse.dto';
import { trimByValue }                                           from './trim';
import { DAY, HALF, HOUR, MINUTE, QUARTER, SIXHOUR, TWELVEHOUR } from './time';

export const aggregateByValue = (transactions: Transaction[], value: number): Transaction[] => {
    const trimmedTransactions = transactions.map((tx: Transaction): Transaction => ({
        ...tx,
        date: trimByValue(new Date(tx.date), value)
    }))

    const aggregatedValues: Transaction[] = [];

    for (const trimmedTransaction of trimmedTransactions) {
        const index = aggregatedValues.findIndex((tx: Transaction) => tx.date.getTime() === trimmedTransaction.date.getTime());

        if (index !== -1) {
            aggregatedValues[index].price += trimmedTransaction.price;
            aggregatedValues[index].quantity += trimmedTransaction.quantity;
        } else {
            aggregatedValues.push(trimmedTransaction)
        }

    }

    return aggregatedValues;
}

export const aggregate = (mode: string, transactions: Transaction[]): Transaction[] => {
    switch (mode) {
        case 'minutes': return aggregateByValue(transactions, MINUTE);
        case 'quarters': return aggregateByValue(transactions, QUARTER);
        case 'halfs': return aggregateByValue(transactions, HALF);
        case 'hours': return aggregateByValue(transactions, HOUR);
        case 'sixhours': return aggregateByValue(transactions, SIXHOUR);
        case 'twelvehours': return aggregateByValue(transactions, TWELVEHOUR);
        case 'days': return aggregateByValue(transactions, DAY);
    }
}
