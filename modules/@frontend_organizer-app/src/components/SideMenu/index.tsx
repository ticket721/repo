import React from 'react';
import styled from 'styled-components';
import Button from "@frontend/flib-react/lib/components/button";
import Icon from "@frontend/flib-react/lib/components/icon";

const tickets = ['Weekends', 'Mercredi', 'Super category'];

const SideMenu = () => {
  const [more, setMore] = React.useState<
    'information' | 'all' | 'tickets' | 'none'
    >('none');
  const onChangeMore = (state: 'tickets' | 'information'): void => {
    if (more === 'none') {
      setMore(state);
    } else if (more === 'tickets') {
      if (state === 'tickets') {
        setMore('none');
      } else if (state === 'information') {
        setMore('all');
      } else if (state === 'all') {
        setMore('information');
      }
    } else if (more === 'information') {
      if (state === 'information') {
        setMore('none');
      } else if (state === 'tickets') {
        setMore('all');
      } else if (state === 'all') {
        setMore('tickets');
      }
    } else {
      if (state === 'tickets') {
        setMore('information');
      } else if (state === 'information') {
        setMore('tickets');
      }
    }
  }

  return (
    <Container>
      <Actions>
        <Button
          className="top"
          variant="primary"
          title="Publish Event"
          onClick={() => console.log('publish')}
        />
        <Button
          variant="secondary"
          title="Preview Event"
          onClick={() => console.log('publish')}
        />
      </Actions>
      <Separator />
      <button onClick={() => onChangeMore('information')} className='more'>
        <Title>Information</Title>
        <Icon icon='chevron' color='white' size='6px' />
      </button>
      {
        (more === 'information'|| more === 'all') &&
        <InfoDetails />
      }
      <button onClick={() => onChangeMore('tickets')} className='more'>
        <Title>Tickets</Title>
      </button>
      {
        (more === 'tickets'|| more === 'all') &&
        <TicketList />
      }
      <Title>Presentation</Title>
      <Separator />
    </Container>
  )
};

const InfoDetails = () => {
  return (
    <SubContainer>
      <Subtitle>General Information</Subtitle>
      <Subtitle>Dates</Subtitle>
      <Subtitle>Location</Subtitle>
    </SubContainer>
  )
};

const TicketList = () => {
  return (
    <SubContainer>
      {tickets.map((t, i) => <Subtitle key={`${t}-${i}`}>{t}</Subtitle>)}
    </SubContainer>
  )
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 280px;
  height: calc(100vh - 80px);
  position: absolute;
  left: 0;
  background-color: ${(props) => props.theme.darkerBg};

  button {
    outline: none;
  }
  .more {
    outline: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-right: 24px;
  }
`;

const SubContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Separator = styled.div`
  height: 2px;
  width: 100%;
  margin: 12px 0;
  background: rgba(10, 8, 18, 0.3);
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  height: 152px;
  align-items: center;
  padding: 24px 0 12px 0;

  .top {
    margin-bottom: 8px;
  }
  button {
    margin: 0;
    width: calc(100% - 48px);
    span {
      margin: 0;
    }
  }
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
  color: rgba(255, 255, 255, 0.38);
`;

export default SideMenu;
