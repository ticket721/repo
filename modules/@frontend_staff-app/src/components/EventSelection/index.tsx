import React, { useState }              from 'react';
import { SelectInput }                  from '@frontend/flib-react/lib/components';
import { useDispatch, useSelector }     from 'react-redux';
import styled                           from 'styled-components';
import { formatOptions }                from './utils/formatOptions';
import { useDeepEffect }                from '@frontend/core/lib/hooks/useDeepEffect';
import { SetDate, SetEventId }          from '../../redux/ducks/current_event';
import { StaffAppState }                from '../../redux';
import { checkFormatDate, formatShort } from '@frontend/core/lib/utils/date';
import { Icon }                            from '@frontend/flib-react/lib/components';

interface Option extends DateItem {
    label: string;
    value: string;
}

export interface SelectOption {
    label: string;
    options: Option[];
}

export interface DateItem {
    eventId: string;
    dateId: string;
    dateName: string;
    timestamps: {
        start: Date;
        end: Date;
    }
}

interface EventSelectionProps {
    events: {
        id: string;
        name: string;
    }[];
    dates: DateItem[];
    hideCalendar?: boolean;
}

export const EventSelection: React.FC<EventSelectionProps> = ({ events, dates, hideCalendar }: EventSelectionProps) => {
    const dispatch = useDispatch();
    const [ currentDateId, currentDateName ] = useSelector((state: StaffAppState) =>
        [state.currentEvent.dateId, state.currentEvent.dateName]);
    const [ selectOptions, setSelectOptions ] = useState<SelectOption[]>([]);
    const [ defaultOpt, setDefaultOpt ] = useState<Option | string>(null);

    useDeepEffect(() => {
        if (dates.length > 0 && currentDateId) {
            const currentDate = dates.find(date => date.dateId === currentDateId);
            if (currentDate) {
                if (currentDate.dateName !== currentDateName) {
                    dispatch(SetDate(currentDateId, currentDate.dateName));
                }
                setDefaultOpt({
                    ...currentDate,
                    label: formatShort(checkFormatDate(currentDate.timestamps.start)) +
                        ' - ' +
                        formatShort(checkFormatDate(currentDate.timestamps.end)),
                    value: currentDate.eventId + '/' + currentDate.dateId,
                })
            } else {
                dispatch(SetDate('', ''));
                setDefaultOpt('none');
            }
        }
    }, [dates, currentDateId]);

    useDeepEffect(() => {
        const dateOpts = formatOptions(events, dates);
        setSelectOptions(dateOpts);
    }, [events, dates]);

    return <DropdownWrapper hideCalendar={hideCalendar}>
        {
            selectOptions.length > 0 ?
                <>
                    {
                        !hideCalendar ?
                          <Calendar icon={'calendar'} size={'16px'}/> :
                          null
                    }
                    <SelectInput
                        defaultValue={typeof defaultOpt !== 'string' && defaultOpt}
                        grouped={true}
                        searchable={true}
                        options={selectOptions}
                        onChange={(option) => {
                            dispatch(SetEventId(option.eventId));
                            dispatch(SetDate(option.dateId, option.dateName));
                        }}/>
                </> :
                null
        }
    </DropdownWrapper>;
};

const DropdownWrapper = styled.div<{ hideCalendar: boolean }>`
    display: flex;
    justify-content: space-between;
    align-items: center;

    & > div {
        width: calc(100% - ${props => props.hideCalendar ? '0px' : props.theme.smallSpacing});
        background-color: transparent;
    }

    [class$=SingleValue] {
        width: calc(100% - 2px);
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
`;

const Calendar = styled(Icon)`
    padding-bottom: 4px;
`;
