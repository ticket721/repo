import React                    from 'react';
import styled                   from 'styled-components';
import {
  Error,
  FullPageLoading,
}                               from '@frontend/flib-react/lib/components';
import FetchCategories from './FetchCategories';

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
  }
];
const Wallet: React.FC = () => {
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
        return (<Error message='Unable to get your tickets'/>);
    }

    const currentTickets = response.data.tickets.filter(t => t.status !== 'canceled');
    return (
        <div className='Wallet'>
            <Title>My Tickets</Title>
            { currentTickets.length > 0 && <FetchCategories />}
            { currentTickets.length === 0 && <span>You don't have any ticket</span>}
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
