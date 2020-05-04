import React, { useState } from 'react';
import styled              from 'styled-components';
import { Button, Icon, WalletHeader }   from '@frontend/flib-react/lib/components';

import DrawerAccount from '../DrawerAccount';
import { truncate }  from '@frontend/core/lib/utils';

const user = {
  firstName: 'Pierre',
  lastName: 'Paul',
  profilePicture: '/favicon.ico',
  creditBalance: 3500,
  creditCard: 5234,
  currentLocation: 'Paris, France',
};

const NavBar: React.FC = () => {
  const [drawer, setDrawer] = useState(false);
  return (
    <Container>
      <Icon icon='t721' fill='#fff' width='70px' height='24px'/>
      <ActionContainer>
        <Button title='Create Event' onClick={() => console.log('Create event')} variant='custom'/>
        <Profile onClick={() => setDrawer(true)}>
          <UserHeader user={user}/>
          <Chevron icon='chevron' fill='#fff' width='12px' height='12px'/>
        </Profile>
      </ActionContainer>
      <DrawerAccount open={drawer} onClose={() => setDrawer(false)}/>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 24px;
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
  padding: 12px 16px;
`;

const UserHeader = styled(WalletHeader)`
  padding: 0;
  cursor: pointer;
  img {
    width: 40px;
    height: 40px;
  }
  h3 {
    ${ truncate('80px') };
    font-size: 13px;
  }
`;

const Chevron = styled(Icon)`
  transform: rotate(90deg);
`;
export default NavBar;
