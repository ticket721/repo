import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import Icon from '@frontend/flib-react/lib/components/icon';
import '../locales';

const tickets = ['Weekends', 'Mercredi', 'Super category'];

interface Props {
  type: 'information' | 'tickets';
}

const SubMenu = ({ type }: Props): JSX.Element => {
  const [ t ] = useTranslation(['event_side_menu']);
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
          <Title>{t('information_title')}</Title>
          <Icon icon='chevron' color='white' size='6px' />
        </Button>
        {
          (more === 'information'|| more === 'all') &&
          <InfoDetails/>
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
        <TicketList/>
      }
    </>
  );
};

const InfoDetails = () => {
  const [ t ] = useTranslation(['event_side_menu']);
  const history = useHistory();

  const handleClick = (page: string) => {
    const id = history.location.pathname.match(/^\/0x([a-zA-Z]|[0-9])+/);
    history.push(`${id[0]}/${page}`);
  };

  return (
    <SubContainer>
      <Subtitle onClick={() => handleClick('general')}>{t('general_info_title')}</Subtitle>
      <Subtitle onClick={() => handleClick('dates')}>{t('date_location_title')}</Subtitle>
    </SubContainer>
  )
};

const TicketList = () => {
  const history = useHistory();

  const handleClick = (page: string) => {
    const id = history.location.pathname.match(/^\/0x([a-zA-Z]|[0-9])+/);
    history.push(`${id[0]}/${page}`);
  };

  return (
    <SubContainer>
      {tickets.map((t, i) => <Subtitle onClick={() => handleClick('ticket')} key={`${t}-${i}`}>{t}</Subtitle>)}
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
