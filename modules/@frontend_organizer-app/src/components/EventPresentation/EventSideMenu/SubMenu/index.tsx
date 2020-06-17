import React from 'react';
import styled from 'styled-components';
import Icon from "@frontend/flib-react/lib/components/icon";

const tickets = ['Weekends', 'Mercredi', 'Super category'];

interface Props {
  type: 'information' | 'tickets';
  setPage: (page: string) => void;
}

const SubMenu = ({ type, setPage }: Props): JSX.Element => {
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

  if (type === 'information') {
    return (
      <>
        <Button onClick={() => onChangeMore('information')}>
          <Title>Information</Title>
          <Icon icon='chevron' color='white' size='6px' />
        </Button>
        {
          (more === 'information'|| more === 'all') &&
          <InfoDetails setPage={setPage}/>
        }
    </>
    )
  }
  return (
    <>
      <Button onClick={() => onChangeMore('tickets')}>
        <Title>Tickets</Title>
        <Icon icon='chevron' color='white' size='6px' />
      </Button>
      {
        (more === 'tickets'|| more === 'all') &&
        <TicketList setPage={setPage}/>
      }
    </>
  );
};

const InfoDetails = ({ setPage }: { setPage: (page: string) => void}) => {
  return (
    <SubContainer>
      <Subtitle onClick={() => setPage('general')}>General Information</Subtitle>
      <Subtitle onClick={() => setPage('dates')}>Dates</Subtitle>
      <Subtitle onClick={() => setPage('location')}>Location</Subtitle>
    </SubContainer>
  )
};

const TicketList = ({ setPage }: { setPage: (page: string) => void}) => {
  return (
    <SubContainer>
      {tickets.map((t, i) => <Subtitle onClick={() => setPage('ticket')} key={`${t}-${i}`}>{t}</Subtitle>)}
    </SubContainer>
  )
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
