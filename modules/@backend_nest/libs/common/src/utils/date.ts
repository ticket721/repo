import parseISO from 'date-fns/parseISO';

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
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

const DTFormatHour = new Intl.DateTimeFormat('default', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
});

export const format = (date: Date | string): string => DTFormat.format(checkFormatDate(date));
export const formatShort = (date: Date | string): string => DTFormatShort.format(checkFormatDate(date));
export const formatDay = (date: Date | string): string => DTFormatDay.format(checkFormatDate(date));
export const formatHour = (date: Date | string): string => DTFormatHour.format(checkFormatDate(date));

export const checkFormatDate = (date: Date | string): Date => (typeof date === 'string' ? parseISO(date) : date);
