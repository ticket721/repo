import React from 'react';
import styled from 'styled-components';

import { useHistory } from 'react-router';
import Icon from '@frontend/flib-react/lib/components/icon';

const tickets = ['Weekends', 'Mercredi', 'Super category'];

const SubMenu = (): JSX.Element => {
  const [more, setMore] = React.useState(false);
  const history = useHistory();

  const handleClick = (page: string) => {
    const id = history.location.pathname.match(/^\/0x([a-zA-Z]|[0-9])+/);
    history.push(`${id[0]}/${page}`);
  };

  return (
    <>
      <Button onClick={() => setMore(!more)}>
        <Title>Tickets</Title>
        <Icon icon='chevron' color='white' size='6px' />
      </Button>
      <SubContainer>
        {tickets.map((t, i) => <Subtitle onClick={() => handleClick('ticket')} key={`${t}-${i}`}>{t}</Subtitle>)}
      </SubContainer>
    </>
  );
};

const SubContainer = styled.div`
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 12px 0;
  margin-bottom: 12px;
`;

const Title = styled.span`
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  margin: 12px 0 12px 24px;
  color: rgba(255, 255, 255, 0.9);
`;

const Subtitle = styled.span`
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  margin: 8px 0 8px 40px;
  color: ${(props) => props.theme.textColorDarker};
`;

const Button = styled.button`
  outline: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-right: 24px;
`;

export default SubMenu;
