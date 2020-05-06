import React from 'react';
import styled              from 'styled-components';
import { Icon, WalletHeader }   from '@frontend/flib-react/lib/components';

import DrawerAccount                         from '../DrawerAccount';
import { blurAndDarkenBackground, truncate } from '@frontend/core/lib/utils';
import { useHistory }                        from 'react-router';
import { NavLink }                           from 'react-router-dom';
import { computeDrawerPath } from '../DrawerAccount/drawerRoutes';

const user = {
  firstName: 'Pierre',
  lastName: 'Paulololo',
  profilePicture: '/public/favicon.ico',
  creditBalance: 3500,
  creditCard: 5234,
  currentLocation: 'Paris, France',
};

const NavBar: React.FC = () => {
  const history = useHistory();

  const drawerOnClose = () => {
      if (computeDrawerPath(history.location.pathname).startsWith('/drawer')) {
          history.push('/');
      } else {
          const computedDrawerPath = computeDrawerPath(history.location.pathname);
          history.push(computedDrawerPath.substr(0, computedDrawerPath.length - 7));
      }
  };

  return (
    <Container>
      <NavLink
        to='/'>
        <Icon icon='t721' fill='#fff' width='70px' height='24px'/>
      </NavLink>
      <ActionContainer>
        <NavLink
          to='/createevent'>
          Create Event
        </NavLink>
        <Profile
        onClick={
          () => history.push((history.location.pathname === '/' ? '' : history.location.pathname) + '/drawer')
        }>
          <UserHeader user={user}/>
          <Chevron icon='chevron' fill='#fff'/>
        </Profile>
      </ActionContainer>
      <DrawerAccount
      open={computeDrawerPath(history.location.pathname) !== '/'}
      onClose={drawerOnClose} />
    </Container>
  );
};

const Container = styled.div`
  position: fixed;
  width: 100%;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 24px;
  ${(props): string => blurAndDarkenBackground('chrome')};
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 335px;
  && button {
    outline: none;
    font-size: 13px;
    width: 150px;
  }
`;

const Profile = styled.div`
  display: flex;
  width: 170px;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(255, 255, 255, 0.06);
  border-radius: ${(props) => props.theme.defaultRadius};
  padding: 12px 0 12px 16px;
`;

const UserHeader = styled(WalletHeader)`
  h3 {
    ${ truncate('80px') };
    padding-right: 8px;
    font-size: 13px;
  }
`;

const Chevron = styled(Icon)`
    transform: rotate(90deg);
`;
export default NavBar;
