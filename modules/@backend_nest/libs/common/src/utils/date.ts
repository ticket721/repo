/**
 * Date formatter
 * @param date
 */
export const format = (timestamp: number, locale?: string, timezone?: string): string =>
    new Intl.DateTimeFormat(locale || 'default', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: timezone,
    }).format(timestamp);

/**
 * Date formatter without year
 * @param date
 */
export const formatShort = (timestamp: number, locale?: string, timezone?: string): string =>
    new Intl.DateTimeFormat(locale || 'default', {
        month: 'short',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
        timeZone: timezone,
    }).format(timestamp);

/**
 * Date formatter without time
 * @param date
 */
export const formatDay = (timestamp: number, locale?: string, timezone?: string): string =>
    new Intl.DateTimeFormat(locale || 'default', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: timezone,
    }).format(timestamp);

/**
 * Time formatter
 * @param date
 */
export const formatHour = (timestamp: number, locale?: string, timezone?: string): string =>
    new Intl.DateTimeFormat(locale || 'default', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone,
    }).format(timestamp);
