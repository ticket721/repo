import { DAY, HALF, HOUR, MINUTE, QUARTER, SIXHOUR, TWELVEHOUR } from './time';

export const add = (mode: string, value: number): number => {
    switch (mode) {
        case 'minutes': return value + MINUTE;
        case '5minutes': return value + 5 * MINUTE;
        case 'quarters': return value + QUARTER;
        case 'halfs': return value + HALF;
        case 'hours': return value + HOUR;
        case 'sixhours': return value + SIXHOUR;
        case 'twelvehours': return value + TWELVEHOUR;
        case 'days': return value + DAY;
    }

}
