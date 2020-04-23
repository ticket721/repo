import React        from 'react';
import styled       from 'styled-components';
import { Button }   from '@frontend/flib-react/lib/components';
import { Icon }     from '@frontend/flib-react/lib/components';

import { truncate } from '../../utils/style';

const NavBar: React.FC = () => (
  <Container>
    <Icon icon='t721' fill='#fff' width='60px' height='25px'/>
    <ActionContainer>
      <Button title='Create Event' onClick={() => console.log('Create event')} type='custom'/>
      <Profile>
        <ProfilePicture>PL</ProfilePicture>
        <Informations>
          <Name type='button' onClick={() => console.log('Show profile drawer')}>
            <span>Pierre-Luc AvecUnLongNom</span>
            <Icon icon='chevron' fill='#fff' width='7px' height='12px'/>
          </Name>
          <Amount>
            <span className='currency'>€&nbsp;</span>
            <span>350</span>
          </Amount>
        </Informations>
      </Profile>
    </ActionContainer>
  </Container>
);

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 25px;
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 400px;
  && button {
    outline: none;
    font-size: 13px;
  }
`;

const Profile = styled.div`
  display: flex;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.06);
  border-radius: ${(props) => props.theme.defaultRadius};
  padding: 8px 16px;
`;

const ProfilePicture = styled.div`
  border-radius: 72px;
  padding: 10px;
  background-color: #4d5555;
  text-align: center;
`;

const Informations = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 100px;
  padding-left: 10px;
  font-size: 13px;
`;

const Name = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  span {
    ${ truncate('100px') };
    padding-right: 10px;
  }
  svg {
    transform: rotate(90deg);
  }
  cursor: pointer;
  color: ${(props) => props.theme.textColor};
`;

const Amount = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  .currency {
    color: #11A869;
  }
`;

export default NavBar;
