import { DAY, HALF, HOUR, MINUTE, QUARTER, SIXHOUR, TWELVEHOUR } from './time';

export const trimByValue = (val: Date, value: number): Date => {
    return new Date((val.getTime()) - (val.getTime() % value))
}

export const trim = (mode: string, date: Date): Date => {
    switch (mode) {
        case 'minutes': return trimByValue(date, MINUTE);
        case 'quarters': return trimByValue(date, QUARTER);
        case 'halfs': return trimByValue(date, HALF);
        case 'hours': return trimByValue(date, HOUR);
        case 'sixhours': return trimByValue(date, SIXHOUR);
        case 'twelvehours': return trimByValue(date, TWELVEHOUR);
        case 'days': return trimByValue(date, DAY)
    }
}

