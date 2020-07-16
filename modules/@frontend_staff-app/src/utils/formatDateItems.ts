import { DateEntity }  from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { DateItem }    from '../components/EventSelection';

export const formatDateItems = (dates: DateEntity[]): DateItem[] =>
    dates.map(date => ({
        eventId: date.parent_id,
        dateId: date.id,
        dateName: date.metadata.name,
        timestamps: {
            start: date.timestamps.event_begin,
            end: date.timestamps.event_end,
        }
    }));
