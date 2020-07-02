import React, { useState, useEffect } from 'react';
import styled                         from 'styled-components';

import { useHistory, useParams } from 'react-router';

import { DateSelect } from './DateSelect';
import { useRequest }                   from '@frontend/core/lib/hooks/useRequest';
import { useLazyRequest }               from '@frontend/core/lib/hooks/useLazyRequest';
import { useSelector }                  from 'react-redux';
import { DatesSearchResponseDto }       from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { v4 }                           from 'uuid';
import { useDeepEffect }                from '@frontend/core/lib/hooks/useDeepEffect';
import { checkFormatDate, displayCompleteDate } from '@frontend/core/lib/utils/date';
import { DateEntity }                   from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';

import { EventsSearchResponseDto }     from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSearchResponse.dto';
import { MergedAppState }              from '../../../../index';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';

interface DateOption {
    label: string;
    value: string;
}

const formatDateLabel = (date: string | Date): string =>
    `${displayCompleteDate(checkFormatDate(date))}`;

export const Dropdown: React.FC = () => {
    const history = useHistory();
    const [uuid] = useState<string>(v4() + '@event-menu');
    const token = useSelector((state: MergedAppState) => state.auth.token.value);
    const { groupId, dateId, eventId } = useParams();

    const [ selectableDates, setSelectableDates ] = useState<DateOption[]>([]);
    const [ selectedItem, setSelectedItem ] = useState<DateOption>(null);
    const [ currentDate, setCurrentDate ] = useState<DateEntity>(null);

    const { response: eventResp } = useRequest<EventsSearchResponseDto>(
        {
            method: 'events.search',
            args: [
                token,
                {
                    group_id: {
                        $eq: groupId,
                    },
                },
            ],
            refreshRate: 1,
        },
        uuid
    );

    const { response: globalCategoriesResp } = useRequest<CategoriesSearchResponseDto>(
        {
            method: 'categories.search',
            args: [
                token,
                {
                    group_id: {
                        $eq: groupId,
                    },
                    parent_type: 'event',
                },
            ],
            refreshRate: 1,
        },
        uuid
    );

    const { lazyRequest, response: datesResp } = useLazyRequest<DatesSearchResponseDto>('dates.search', uuid);

    useEffect(() => {
        lazyRequest([token, { group_id: { $eq: groupId }}]);
    // eslint-disable-next-line
    }, []);

    useDeepEffect(() => {
        if (datesResp.data && dateId) {
            const dateItem = datesResp.data.dates.find((date) => date.id === dateId);
            if (!dateItem) {
                lazyRequest([token, { group_id: { $eq: groupId }}, { force: true }]);
            } else {
                setCurrentDate(dateItem);
                setSelectedItem({
                    label: formatDateLabel(dateItem.timestamps.event_begin),
                    value: dateItem?.id,
                });
            }
        } else if (eventId) {
            setSelectedItem({
                label: 'Global category',
                value: 'global',
            });
        } else {
            setSelectedItem({
                label: 'New Date',
                value: 'new-date',
            });
        }
    }, [datesResp, dateId, eventId]);

    useDeepEffect(() => {
        if (datesResp.data && datesResp.data.dates.length > 0) {
            setSelectableDates([
                ...datesResp.data.dates.filter(d => d.parent_type === 'event' || d.parent_type === 'date')
                    .map((date) => ({
                        label: formatDateLabel(date.timestamps.event_begin),
                        value: date.id,
                    })
                ),
                {
                    label: 'New Date',
                    value: 'new-date',
                },
                {
                    label: 'Global category',
                    value: 'global',
                },
            ]);
        }
    }, [datesResp.data]);

    return (
        <EntitiesDropdown>
            <Title>{dateId && currentDate ? currentDate.metadata.name : eventId ? 'Global Categories' : 'New Date'}</Title>
            {
                datesResp.data?.dates && eventResp.data?.events && globalCategoriesResp.data?.categories ?
                    <DateSelect
                        menuPosition={{
                            top: '-24px',
                            left: '250px'
                        }}
                        options={selectableDates}
                        value={[selectedItem]}
                        onChange={(dateOpt: DateOption) => {
                            if (dateOpt.value === 'global') {
                                if (globalCategoriesResp.data.categories.length > 0) {
                                    history.push(`/group/${groupId}/event/${eventResp.data.events[0].id}/category/${globalCategoriesResp.data.categories[0].id}`,
                                        {
                                            showingGlobalCategories: true,
                                        });
                                } else {
                                    history.push(`/group/${groupId}/event/${eventResp.data.events[0].id}/category`,
                                    {
                                            showingGlobalCategories: true,
                                        });
                                }
                            } else if (dateOpt.value === 'new-date') {
                                history.push(`/group/${groupId}/event/${eventId}/date`);
                            } else {
                                history.push(`/group/${groupId}/date/${dateOpt.value}`, {
                                    showingInfos: true,
                                })
                            }
                        }}/> :
                    null
            }
        </EntitiesDropdown>
    )
};

const EntitiesDropdown = styled.div`
    margin: 0 ${props => props.theme.biggerSpacing} ${props => props.theme.biggerSpacing};
    border-left: 2px solid ${(props) => props.theme.componentColorLighter};
    padding: 2px 0 2px ${props => props.theme.regularSpacing};

    & > button {
        margin: 0 0 ${props => props.theme.smallSpacing};
        width: 100%;
    }
`;

const Title = styled.span`
  font-weight: 500;
  font-size: 13px;
  display: block;
  margin-bottom: 4px;
  color: ${(props) => props.theme.textColorDarker};
`;
