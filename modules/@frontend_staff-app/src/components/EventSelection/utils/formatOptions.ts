import { DateItem, SelectOption } from '../index';
import { checkFormatDate, formatShort }        from '@frontend/core/lib/utils/date';

export const formatOptions = (events: { id: string, name: string }[], dates: DateItem[]): SelectOption[] => {
    const globalSortedDates = sortDates(dates);
    const sortedEventIds: string[] = [];
    globalSortedDates
        .forEach((date) => {
            if (sortedEventIds.findIndex(id => date.eventId === id) === -1) {
                sortedEventIds.push(date.eventId);
            }
    });

    return sortedEventIds.map(id => ({
        label: events.find(event => event.id === id).name,
        options: globalSortedDates
            .filter(date => date.eventId === id)
            .map(date => ({
                ...date,
                label: formatShort(checkFormatDate(date.timestamps.start)) +
                    ' - ' +
                    formatShort(checkFormatDate(date.timestamps.end)),
                value: date.dateId,
            })),
    }));
};

const sortDates = (dates: DateItem[]) => dates.sort((dateA, dateB) =>
    Math.abs(Date.now() - checkFormatDate(dateA.timestamps.end).getTime())
    - Math.abs((Date.now() - checkFormatDate(dateB.timestamps.end).getTime()))
);
