import React                    from 'react';
import Flicking                 from '@egjs/react-flicking';
import {
  Error,
  FullPageLoading,
}                               from '@frontend/flib-react/lib/components';
import FetchDates               from './FetchDates';


const userCategories = [
  {
    id: 'ticket1',
    parent_id: 'dateOrEventId',
    parent_type: 'date',
    display_name: 'Classic'
  },
  {
    id: 'ticket2',
    parent_id: 'dateOrEventId',
    parent_type: 'event',
    display_name: 'Gold'
  },
  {
    id: 'ticket3',
    parent_id: 'dateOrEventId',
    parent_type: 'date',
    display_name: 'VIP'
  },
  {
    id: 'ticket4',
    parent_id: 'dateOrEventId',
    parent_type: 'event',
    display_name: 'Regular'
  },
  {
    id: 'ticket5',
    parent_id: 'dateOrEventId',
    parent_type: 'date',
    display_name: '2 Days Pass'
  },
  {
    id: 'ticket6',
    parent_id: 'dateOrEventId',
    parent_type: 'event',
    display_name: 'Gold'
  }
];

const FetchCategories = () => {
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
      return (<Error message='Unable to get your tickets'/>);
    }

    const currentCategories = response.data.categories.filter(t => t.parent_type !== 'event');
    return (
        <>
            { currentCategories.length > 0 &&
                <Flicking
                    collectStatistics={false}
                    gap={8}
                >
                    {
                        currentCategories.map(c =>
                            <FetchDates key={c.id} parentId={c.parent_id} ticketType={c.display_name}/>
                        )
                    }
                </Flicking>
            }
            { currentCategories.length === 0 && <span>You don't have any date specific ticket</span>}
        </>
    );
};

export default FetchCategories;
