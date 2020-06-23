export const seconde: number = 1000;
export const minute: number = 60 * seconde;
export const hour: number = 60 * minute;
export const day: number = 24 * hour;
export const week: number = 7 * day;
export const year: number = 365 * day;

export const displayTime = (date: Date): string => {
    const timeArray = date.toLocaleTimeString().split(':');
    const pm: boolean = parseInt(timeArray[0], 0) > 12;
    return `${pm ? parseInt(timeArray[0], 0) - 12 : timeArray[0]}:
            ${timeArray[1]}${pm ? 'pm' : 'am'}`;
};

export const displayDate = (date: Date): string => {
    const dateArray = date.toDateString().split(' ');
    return `${dateArray[0]}, ${dateArray[1]} ${dateArray[2]}, ${dateArray[3]}`;
};

export const displayCompleteDate = (date: Date): string => {
    return `${displayDate(date)} - ${displayTime(date)}`;
};

export const checkFormatDate = (date: string | Date): Date => {
    if (typeof date === 'string') {
        return new Date(date);
    }

    return date;
};

const DTFormat = new Intl.DateTimeFormat('default', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
});

const DTFormatShort = new Intl.DateTimeFormat('default', {
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
});

export const format = (date: Date): string => DTFormat.format(date);
export const formatShort = (date: Date): string => DTFormatShort.format(date);
