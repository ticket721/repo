export const second: number = 1000;
export const minute: number = 60 * second;
export const hour: number = 60 * minute;
export const day: number = 24 * hour;
export const week: number = 7 * day;
export const year: number = 365 * day;

export enum TimeScale {
    second,
    minute,
    hour,
    day,
    month,
    year,
}

export const displayTime = (date: Date | string): string => {
    let dateToFormat: Date;
    if (typeof date === 'string') {
        dateToFormat = new Date(date);
    } else {
        dateToFormat = date;
    }
    const timeArray = dateToFormat.toLocaleTimeString().split(':');
    return `${timeArray[0]}:${timeArray[1]}`;
};

export const displayDate = (date: Date | string): string => {
    let dateToFormat: Date;
    if (typeof date === 'string') {
        dateToFormat = new Date(date);
    } else {
        dateToFormat = date;
    }
    return dateToFormat.toLocaleDateString();
};

export const displayCompleteDate = (date: Date | string): string => {
    return `${displayDate(date)} - ${displayTime(date)}`;
};

export const checkFormatDate = (date: string | Date): Date => {
    if (typeof date === 'string') {
        return new Date(date);
    }

    return date;
};

export const compareDates = (dateA: Date | string, dateB: Date | string, precision?: TimeScale): boolean => {
    dateA = checkFormatDate(dateA);
    dateB = checkFormatDate(dateB);
    switch (precision) {
        case TimeScale.year:
            return dateA.getFullYear() === dateB.getFullYear();
        case TimeScale.month:
            return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth();
        case TimeScale.day:
            return (
                dateA.getFullYear() === dateB.getFullYear() &&
                dateA.getMonth() === dateB.getMonth() &&
                dateA.getDate() === dateB.getDate()
            );
        case TimeScale.hour:
            return (
                dateA.getFullYear() === dateB.getFullYear() &&
                dateA.getMonth() === dateB.getMonth() &&
                dateA.getDate() === dateB.getDate() &&
                dateA.getHours() === dateB.getHours()
            );
        case TimeScale.minute:
            return (
                dateA.getFullYear() === dateB.getFullYear() &&
                dateA.getMonth() === dateB.getMonth() &&
                dateA.getDate() === dateB.getDate() &&
                dateA.getHours() === dateB.getHours() &&
                dateA.getMinutes() === dateB.getMinutes()
            );
        case TimeScale.second:
            return (
                dateA.getFullYear() === dateB.getFullYear() &&
                dateA.getMonth() === dateB.getMonth() &&
                dateA.getDate() === dateB.getDate() &&
                dateA.getHours() === dateB.getHours() &&
                dateA.getMinutes() === dateB.getMinutes() &&
                dateA.getSeconds() === dateB.getSeconds()
            );
        default:
            return dateA.getTime() === dateB.getTime();
    }
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

const DTFormatDay = new Intl.DateTimeFormat('default', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
});

const DTFormatHour = new Intl.DateTimeFormat('default', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
});

export const format = (date: Date): string => DTFormat.format(date);
export const formatShort = (date: Date): string => DTFormatShort.format(date);
export const formatDay = (date: Date): string => DTFormatDay.format(date);
export const formatHour = (date: Date): string => DTFormatHour.format(date);
