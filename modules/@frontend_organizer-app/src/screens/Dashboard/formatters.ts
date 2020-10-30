import { EventEntity }     from '@common/sdk/lib/@backend_nest/libs/common/src/events/entities/Event.entity';
import { DateEntity }      from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { CategoryEntity }  from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';

import { checkFormatDate } from '@frontend/core/lib/utils/date';
import { getImgPath }      from '@frontend/core/lib/utils/images';

export interface EventDashboard {
    groupId: string;
    name: string;
    pastEvent: boolean;
    covers: string[];
    colors: string[];
    defaultDateId: string;
    datesRange: Date[];
    startPrice: string;
    totalSeats: number;
}

const formatEventName = (events: EventEntity[]): EventDashboard[] => (
    events?.map((event: EventEntity) => ({
        groupId: event.group_id,
        name: event.name,
        pastEvent: null,
        covers: null,
        colors: null,
        defaultDateId: null,
        datesRange: null,
        startPrice: null,
        currencies: null,
        totalSeats: null,
    }))
);

const formatDatesAndCovers = (dates: DateEntity[], events: EventDashboard[]): EventDashboard[] => (
    events?.map((event) => {
        const filteredDates = dates.filter((date) => date.group_id === event.groupId);
        if (filteredDates.length === 0) {
          return event;
        }
        const startDate: Date = checkFormatDate(
            filteredDates.sort((dateA, dateB) =>
                checkFormatDate(dateA.timestamps.event_begin).getTime() - checkFormatDate(dateB.timestamps.event_begin).getTime()
            )[0].timestamps.event_begin
        );

        const endDate: Date = checkFormatDate(
            filteredDates.sort((dateA, dateB) =>
                new Date(dateB.timestamps.event_end).getTime() - new Date(dateA.timestamps.event_end).getTime()
            )[0].timestamps.event_begin
        );

        return {
            ...event,
            datesRange: [startDate, endDate],
            defaultDateId: filteredDates[0].id,
            covers: filteredDates.map((date) => getImgPath(date.metadata.avatar)),
            colors: filteredDates.map((date) => date.metadata.signature_colors[0]),
            pastEvent: endDate < new Date(),
        }
    })
);

const formatPricesAndSeats = (categories: CategoryEntity[], events: EventDashboard[]): EventDashboard[] => (
    events?.map((event) => {
        const filteredCategories = categories.filter((category) => category.group_id === event.groupId);
        if (filteredCategories.length === 0) {
            return event;
        }
        const seatsCount: number = filteredCategories
            .map((category) => category.seats)
            .reduce((acc, seats) => acc + seats);
        // console.log(filteredCategories);
        const sortedPrices: string[] = filteredCategories
            .map((category) => {
                const T721TokenPrice = category.prices.filter((price) => price.currency === 'T721Token');
                return T721TokenPrice[0].value;
            }).sort((priceA: string, priceB: string) => parseInt(priceA, 10) - parseInt(priceB, 10));
        // console.log(sortedPrices);
        return {
            ...event,
            startPrice: sortedPrices[0],
            totalSeats: seatsCount,
        }
    })
);

export { formatEventName, formatDatesAndCovers, formatPricesAndSeats };
