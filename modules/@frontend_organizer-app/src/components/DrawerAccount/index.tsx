import React, { useState }                                    from 'react';
import styled                                                 from 'styled-components';
import { Drawer as MUIDrawer, DrawerProps as MUIDrawerProps } from '@material-ui/core';
import { Button, Icon, CardContainer, CardContainerProps }    from '@frontend/flib-react/lib/components';
// import { blurAndDarkenBackground }                            from '@frontend/core/lib/utils/style';
import { detect }                                             from 'detect-browser';

const fakeData = {
  activity: [
    {
      content: 'Donec tempus massa quis enim molestie finibus 0',
    },
    {
      content: 'Donec tempus massa quis enim molestie finibus 1',
    },
    {
      content: 'Donec tempus massa quis enim molestie finibus 2',
    },
    {
      content: 'Donec tempus massa quis enim molestie finibus 3',
    },
    {
      content: 'Donec tempus massa quis enim molestie finibus 4',
    },
  ],
  balance: 35000,
  currency: '€',
  bankAccount: '**** **** **** 3636',
  location: 'Paris, France'
}

const categories = [
  {
    title: 'About',
    content: [
      {
        title: 'Privacy Policy',
        icon: 'arrow'
      },
      {
        title: 'Terms & Conditions',
        icon: 'arrow'
      },
      {
        title: 'Refund Policy',
        icon: 'arrow'
      },
      {
        title: 'Partners',
        icon: 'arrow'
      }
    ]
  }
];

const DrawerAccount = (): JSX.Element => {
  const [displayDrawer, setDisplayDrawer] = useState(false);
  const browser = detect();

  return (
    <>
      <Button onClick={() => setDisplayDrawer(true)} title='Click me!' type='primary'/>
      <Drawer anchor='right' open={displayDrawer} onClose={(): void => setDisplayDrawer(false)} browserName={browser?.name}>
        {categories.map((c) => {
          return (
            <React.Fragment key={c.title}>
              <Title>{c.title}</Title>
              {c.content.map((e, idx) => DescriptionLink(e.title, idx === c.content.length - 1, idx === 0, e.icon))}
            </React.Fragment>
          );
        })}
      </Drawer>
    </>
  );
};

interface DrawerProps extends MUIDrawerProps {
  browserName: string | undefined;
}

const Drawer = styled(MUIDrawer)<DrawerProps>`
  .MuiPaper-root {
    background: linear-gradient(91.44deg,#0A0812 0.31%,#120F1A 99.41%);
    width: 300px;
    color: ${props => props.theme.textColor};
  }
  .MuiBackdrop-root {
  }
`;


const Title = styled.p`
  font-weight: bold;
  font-size: 18px;
  padding: 48px 24px 16px 24px;
`;

const Text = styled.p`
  color: ${props => props.theme.textColorDark};
  width: 100%;
`

const Location = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  p {
    padding: 0 8px;
    color: ${props => props.theme.textColor};
  }
`;

interface DescriptionCardContainerProps extends CardContainerProps {
  isLast: boolean;
  isFirst: boolean;
}

const DescriptionCardContainer = styled(CardContainer)<DescriptionCardContainerProps>`
  border-bottom: ${({ isLast }): string => isLast ? 'none' : '1px solid rgba(255, 255, 255, 0.05)'};
  justify-content: space-between;
  align-items: center;
`;

const DescriptionLink = (text: string, last: boolean, first: boolean, icon: string | undefined): JSX.Element => {
  return (
    <DescriptionCardContainer key={text} isLast={last} isFirst={first}>
      <div>
        <Text>{text}</Text>
      </div>
      {icon && <Icon icon={icon} height='16' width='16' fill='#fff'/>}
    </DescriptionCardContainer>
  )
};
export default DrawerAccount;
