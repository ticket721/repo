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

export const displayTime = (date: Date): string => {
    const timeArray = date.toLocaleTimeString().split(':');
    return `${timeArray[0]}:${timeArray[1]}`;
};

export const displayDate = (date: Date): string => {
    return date.toLocaleDateString();
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
