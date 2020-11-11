import React                     from 'react';
import styled                    from 'styled-components';
import { TicketHeader }          from '@frontend/flib-react/lib/components/ticket';
import { useTranslation }        from 'react-i18next';
import './locales';
import { useHistory }            from 'react-router';
import { CategoryEntity }        from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { TicketEntity }          from '@common/sdk/lib/@backend_nest/libs/common/src/tickets/entities/Ticket.entity';
import { DateEntity }            from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { EventEntity }           from '@common/sdk/lib/@backend_nest/libs/common/src/events/entities/Event.entity';
import TicketPreview             from '@frontend/flib-react/lib/components/ticket/infos';
import { useIncrement }          from '../../../utils/useIncrement';
import { formatDay, formatHour } from '@frontend/core/lib/utils/date';

interface TicketCardProps {
    ticket: Omit<TicketEntity, 'category'>;
    category: Omit<CategoryEntity, 'dates'>;
    dates: DateEntity[];
    event: EventEntity;
}

const TicketCard = ({ ticket, category, dates, event }: TicketCardProps) => {
    const history = useHistory();
    const [t] = useTranslation('ticket');
    const idx = useIncrement(7000);

    return (
        <Container onClick={() => history.push(`/ticket/${ticket.id}`)}>
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
                    ticket={{
                        name: dates[idx % dates.length].metadata.name,
                        mainColor: dates[idx % dates.length].metadata.signature_colors[0],
                        location: dates[idx % dates.length].location?.location_label,
                        categoryName: category.display_name,
                        startDate: formatDay(dates[idx % dates.length].timestamps.event_begin),
                        gradients: dates[idx % dates.length].metadata.signature_colors,
                        startTime: formatHour(dates[idx % dates.length].timestamps.event_begin),
                        endDate: formatDay(dates[idx % dates.length].timestamps.event_end),
                        endTime: formatHour(dates[idx % dates.length].timestamps.event_end),
                        ticketId: ticket.id,
                    } as any}
                    addonsPurchased={t('no_addons')}
                />
            </PullUp>
        </Container>
    );
};

const Container = styled.div`
    border-bottom-left-radius: ${props => props.theme.smallSpacing};
    border-bottom-right-radius: ${props => props.theme.smallSpacing};
    overflow: hidden;
    width: calc(100vw - ${props => props.theme.biggerSpacing} * 3 - ${props => props.theme.smallSpacing});
`;

const PullUp = styled.div`
    position: relative;
    top: -${props => props.theme.doubleSpacing};
    margin-bottom: -${props => props.theme.doubleSpacing};
`;

export default TicketCard;
