import React                     from 'react';
import styled                    from 'styled-components';
import { TicketHeader }          from '@frontend/flib-react/lib/components/ticket';
import { useTranslation }        from 'react-i18next';
import './locales';
import { useHistory }            from 'react-router';
import { DateEntity }            from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { EventEntity }           from '@common/sdk/lib/@backend_nest/libs/common/src/events/entities/Event.entity';
import TicketPreview             from '@frontend/flib-react/lib/components/ticket/infos';
import { useIncrement }          from '../../../hooks/useIncrement';
import { formatDay, formatHour }          from '@frontend/core/lib/utils/date';
import { HapticsImpactStyle, useHaptics } from '@frontend/core/lib/hooks/useHaptics';

interface TicketCardProps {
    ticketId: string;
    categoryName: string;
    dates: DateEntity[];
    event: EventEntity;
    width?: string;
    isInvitation?: boolean;
}

export const TicketCard = ({ ticketId, categoryName, dates, event, width, isInvitation }: TicketCardProps) => {
    const history = useHistory();
    const [t] = useTranslation('ticket');
    const idx = useIncrement(7000);
    const haptics = useHaptics();

    return (
        <Container
            customWidth={width}
            onClick={() => {
                history.push(`/ticket/${ticketId}${isInvitation ? '/invitation' : ''}`)
                haptics.impact({
                    style: HapticsImpactStyle.Heavy
                });
            }}
        >
            <TicketHeader
                cover={dates[idx % dates.length].metadata.avatar}
                datesCount={dates.length}
                datesIdx={idx}
                mainColors={dates[idx % dates.length].metadata.signature_colors}
            />
            <PullUp>
                <TicketPreview
                    gradient={dates[idx % dates.length].metadata.signature_colors}
                    event_name={event.name}
                    online={dates[idx % dates.length].online}
                    location_label={t('get_directions')}
                    online_label={t('online')}
                    online_sublabel={dates[idx % dates.length].online && dates[idx % dates.length].online_link ? t('click_to_online') : t('online_link_soon')}
                    banner={
                        isInvitation ?
                        {
                            label: categoryName,
                            colors: dates[idx % dates.length].metadata.signature_colors
                        } :
                        null
                    }
                    ticket={{
                        name: dates[idx % dates.length].metadata.name,
                        mainColor: dates[idx % dates.length].metadata.signature_colors[0],
                        location: dates[idx % dates.length].location?.location_label,
                        categoryName,
                        startDate: formatDay(dates[idx % dates.length].timestamps.event_begin),
                        gradients: dates[idx % dates.length].metadata.signature_colors,
                        startTime: formatHour(dates[idx % dates.length].timestamps.event_begin),
                        endDate: formatDay(dates[idx % dates.length].timestamps.event_end),
                        endTime: formatHour(dates[idx % dates.length].timestamps.event_end),
                        ticketId,
                    } as any}
                    addonsPurchased={t('no_addons')}
                />
            </PullUp>
        </Container>
    );
};

const Container = styled.div<{ customWidth?: string }>`
    border-bottom-left-radius: ${props => props.theme.smallSpacing};
    border-bottom-right-radius: ${props => props.theme.smallSpacing};
    width: ${props => props.customWidth || '100%'};
`;

const PullUp = styled.div`
    position: relative;
    top: calc(${props => props.theme.biggerSpacing} * -2);
    margin-bottom: calc(${props => props.theme.biggerSpacing} * -2);
`;
