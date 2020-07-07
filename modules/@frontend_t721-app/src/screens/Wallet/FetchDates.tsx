import React                         from 'react';
import styled                        from 'styled-components';
import { useTranslation }            from 'react-i18next';
import {
  Error,
  FullPageLoading,
}                                    from '@frontend/flib-react/lib/components';
import { getImgPath }                from '@frontend/core/lib/utils/images';
import { displayDate, displayTime }  from '@frontend/core/lib/utils/date';
import TicketCard                    from '../../components/Card';
import { Ticket }                    from '../../types/ticket';
import './locales';

const userDates = [
  {
    id: 'ticket1',
    location: {
      location: {
        lon: 0,
        lat: 0,
      },
      location_label: '221 avenue Jean Jaurès, Paris'
    },
    timestamps: {
      event_end: '2020-07-16T09:10:00.000Z',
      event_begin: '2020-07-17T08:40:00.000Z'
    },
    metadata: {
      name: 'Super Event Name',
      signature_colors: ['#ebbc16', '#db535b'],
      avatar: 'd4395803-c9bd-4cd7-861c-3740373a9d54'
    }
  }
];

interface Props {
    parentId: string;
    ticketType: string;
}

const formatTicket = (data: any, ticketType: string): Ticket => ({
    name: data.metadata.name,
    location: data.location.location_label,
    ticketType,
    startDate: displayDate(data.timestamps.event_begin),
    startTime: displayTime(data.timestamps.event_begin),
    endDate: displayDate(data.timestamps.event_end),
    endTime: displayTime(data.timestamps.event_end),
    ticketId: data.id,
    gradients: data.metadata.signature_colors,
    mainColor: data.metadata.signature_colors[0],
    image: getImgPath(data.metadata.avatar),
});

const FetchDates = ({ parentId, ticketType }: Props) => {
    const { t } = useTranslation('wallet');
    const response = {
        data:  { dates: userDates },
        loading: false,
        error: undefined
    };

    if (response.loading) {
        return (
            <FullPageLoading
                width={250}
                height={250}
            />
        );
    }
    if (response.error) {
        return (<Error message='Unable to get your tickets'/>);
    }

    const currentDate = response.data.dates[0];
    return (
        <>
            { currentDate && (
                <CardContainer onClick={() => console.log('this click will do some amazing stuff later')}>
                    <TicketCard ticket={formatTicket(currentDate, ticketType)} />
                </CardContainer>
            )}
            { !currentDate ? <span>{t('no_dates_ticket')}</span> : null }
        </>
    );
};

const CardContainer = styled.div`
  display: flex;
  align-items: center;
  max-width: 500px;
  width: 85%;
`;

export default FetchDates;
