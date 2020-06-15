import React                  from 'react';
import {
  ActivitiesContainer,
  TitleText,
  FundsCard,
  LinksContainer,
  ArrowLink
}                             from '@frontend/flib-react/lib/components';
import { useHistory }         from 'react-router';
import { computeProfilePath } from '@frontend/core/lib/utils/computeProfilePath';

const user = {
    firstName: 'Pierre',
    lastName: 'Paul',
    profilePicture: '/public/favicon.ico',
    creditBalance: 3500,
    creditCard: 5234,
    currentLocation: 'Paris, France',
};

const notif = ['notif0', 'notif1', 'notif2', 'notif3', 'notif4', 'notif5', 'notif6', 'notif7'];

const DrawerMenu = (): JSX.Element => {
  const history = useHistory();

  const displayedNotif = notif.slice(0, 3);

  return (
      <>
          <ActivitiesContainer
          title='Recent activities'
          viewAllAction={
              () => history.push(computeProfilePath(history.location.pathname, '/activities'))
          }
          viewAllLabel='View all'>
              {displayedNotif.map((e, i) => {
                  return (<TitleText text={e} key={e + i}/>);
              })}
          </ActivitiesContainer>
          <FundsCard
          title={'Funds'}
          bankAccountLabel={'Bank account'}
          currentBalanceLabel={'Current balance'}
          onClick={
              () => history.push(computeProfilePath(history.location.pathname, '/fundsandpaymentmethod'))
          }
          user={user}
          icon='euro'
          />
          <LinksContainer title='Account'>
              <ArrowLink to='#todo' label='General information'/>
              <ArrowLink to='#todo' label='Main city' location='Paris, France' />
          </LinksContainer>
      </>
  );
};

export default DrawerMenu;
