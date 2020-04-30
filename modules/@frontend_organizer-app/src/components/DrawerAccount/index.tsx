import React, { useState } from 'react';
import styled              from 'styled-components';
import { detect }                                             from 'detect-browser';
import { Drawer as MUIDrawer, DrawerProps as MUIDrawerProps } from '@material-ui/core';
import { blurAndDarkenBackground }                            from '@frontend/core/lib/utils/style';
import {
  WalletHeader,
  ActivitiesContainer,
  TitleText,
  FundsCard,
  LinksContainer,
  ArrowLink
} from '@frontend/flib-react/lib/components';

interface Props {
  open: boolean,
  onClose: () => void;
}

const user = {
  firstName: 'Pierre',
  lastName: 'Paul',
  profilePicture: '/public/favicon.ico',
  creditBalance: 3500,
  creditCard: 5234,
  currentLocation: 'Paris, France',
};

const notif = ['notif0', 'notif1', 'notif2', 'notif3', 'notif4', 'notif5', 'notif6', 'notif7'];


const DrawerAccount = ({open, onClose}: Props): JSX.Element => {
  const [viewAll, setViewAll] = useState(false);
  const browser = detect();

  const displayedNotif = viewAll ? notif : notif.slice(0, 3);

  return (
    <Drawer anchor='right' open={open} onClose={onClose} browsername={browser?.name}>
      <>
        <WalletHeader user={user}/>
        <ActivitiesContainer title='Recent activities' viewAllAction={() => setViewAll(!viewAll)} viewAllLabel={viewAll ? 'Show less' : 'View all'}>
          {displayedNotif.map((e, i) => {
            return (<TitleText text={e} key={e + i}/>);
          })}
        </ActivitiesContainer>
        <FundsCard
          title={'My funds'}
          bankAccountLabel={'Bank account'}
          currentBalanceLabel={'Current balance'}
          onClick={() => console.log('FundsCard clicked')}
          user={user}
          icon='euro'
        />
        <LinksContainer title='Account'>
          <ArrowLink to='#todo' label='General information'/>
          <ArrowLink to='#todo' label='Payment information'/>
          <ArrowLink to='#todo' label='Main city' location='Paris, France' />
        </LinksContainer>
      </>
    </Drawer>
  );
};

interface DrawerProps extends MUIDrawerProps {
  browsername: string | undefined;
}

const Drawer = styled(MUIDrawer)<DrawerProps>`
  .MuiPaper-root {
    background: linear-gradient(91.44deg,#0A0812 0.31%,#120F1A 99.41%);
    width: 375px;
    color: ${props => props.theme.textColor};
  }
  .MuiBackdrop-root {
    ${(props): string => blurAndDarkenBackground(props.browsername)};
  }
`;

export default DrawerAccount;
