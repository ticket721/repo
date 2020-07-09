import React                    from 'react';
import styled                   from 'styled-components';
import { useTranslation }       from 'react-i18next';
import {
  Error,
  FullPageLoading,
}                               from '@frontend/flib-react/lib/components';
import FetchCategories from './FetchCategories';
import './locales';

const userTickets = [
  {
    id: 'ticket1',
    category: 'categoryId',
    status: 'minting'
  },
  {
    id: 'ticket2',
    category: 'categoryId',
    status: 'ready'
  },
  {
    id: 'ticket3',
    category: 'categoryId',
    status: 'canceled'
  },
  {
    id: 'ticket4',
    category: 'categoryId',
    status: 'minting'
  },
  {
    id: 'ticket5',
    category: 'categoryId',
    status: 'ready'
  },
  {
    id: 'ticket6',
    category: 'categoryId',
    status: 'canceled'
  },
  {
    id: 'ticket7',
    category: 'categoryId',
    status: 'minting'
  }
];
const Wallet: React.FC = () => {
    const { t } = useTranslation('wallet');
    const response = {
        data:  { tickets: userTickets },
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

    const currentTickets = response.data.tickets.filter(ticket => ticket.status !== 'canceled');
    return (
        <div className='Wallet'>
            <Title>{t('my_tickets')}</Title>
            { currentTickets.length > 0 ? <FetchCategories /> : null }
            { currentTickets.length === 0 ? <span>{t('no_ticket')}</span> : null}
        </div>
    );
}

const Title = styled.h1`
  font-weight: bold;
  color: ${props => props.theme.textColor};
  font-family: ${props => props.theme.fontStack};
  margin-top: 56px;
  margin-left: ${props => props.theme.biggerSpacing};
`;


export default Wallet;
