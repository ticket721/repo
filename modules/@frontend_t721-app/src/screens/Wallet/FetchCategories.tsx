import React                    from 'react';
import Flicking                 from '@egjs/react-flicking';
import { useTranslation }       from 'react-i18next';
import styled                   from 'styled-components';
import {
  Error,
  FullPageLoading,
}                               from '@frontend/flib-react/lib/components';
import FetchDates               from './FetchDates';
import './locales';

const userCategories = [
  {
    id: 'ticket1',
    parent_id: 'dateOrEventId1',
    parent_type: 'date',
    display_name: 'Classic'
  },
  {
    id: 'ticket2',
    parent_id: 'dateOrEventId2',
    parent_type: 'event',
    display_name: 'Gold'
  },
  {
    id: 'ticket3',
    parent_id: 'dateOrEventId3',
    parent_type: 'date',
    display_name: 'VIP'
  },
  {
    id: 'ticket4',
    parent_id: 'dateOrEventId4',
    parent_type: 'date',
    display_name: 'Regular'
  },
  {
    id: 'ticket4Bis',
    parent_id: 'dateOrEventId4',
    parent_type: 'date',
    display_name: 'Regular'
  },
  {
    id: 'ticket5',
    parent_id: 'dateOrEventId5',
    parent_type: 'date',
    display_name: '2 Days Pass'
  },
  {
    id: 'ticket6',
    parent_id: 'dateOrEventIdSame',
    parent_type: 'event',
    display_name: 'Gold'
  },
  {
    id: 'ticket7',
    parent_id: 'dateOrEventIdSsame',
    parent_type: 'event',
    display_name: 'Gold'
  }
];

const FetchCategories = () => {
    const { t } = useTranslation('wallet');
    const response = {
        data:  { categories: userCategories },
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
      return (<Error message={t('error')}/>);
    }

    const currentCategories = response.data.categories.filter(ticket => ticket.parent_type !== 'event');

    return (
        <Container>
            { currentCategories.length > 0 &&
                <Flicking
                    collectStatistics={false}
                    gap={24}
                >
                    {
                        currentCategories.map(c =>
                            <FetchDates key={c.id} parentId={c.parent_id} ticketType={c.display_name}/>
                        )
                    }
                </Flicking>
            }
            { currentCategories.length === 0 ? <span>{t('no_dates_ticket')}</span> : null }
        </Container>
    );
};

const Container = styled.div`
  .eg-flick-viewport {
    overflow: unset;
    height: calc(100vh - 200px);
  }

  .eg-flick-camera {
    display: flex;
    align-items: center;
  }
`;

export default FetchCategories;
