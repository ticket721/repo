import React from 'react';
import styled from 'styled-components';
import Icon from "@frontend/flib-react/lib/components/icon";

import { formatDateForDisplay } from "../../utils/functions";
import { Events } from "../../types/UserEvents";

interface Props {
  setCurrentDate: (startDate: string) => void;
  setName: (name: string) => void;
  name: string;
  userEvents: Events[];
}

const HomeSideMenu = ({ setCurrentDate, setName, name, userEvents }: Props) => {
  const category = userEvents.find((e) => e.name === name);

  return (
    <Container>
      { category && (
        <>
          <BackIcon onClick={() => setName(undefined)}>
            <Icon
              icon={'back-arrow'}
              size={'14px'}
              color={'rgba(255, 255, 255, 0.9)'}
            />
          </BackIcon>
          <Title>{category.name}</Title>
          { name && category.dates.map((e, i) => {
              const date = e.startDate ? formatDateForDisplay(e.startDate) : 'Global';

              return (
                <SubTitle
                  key={`side-dates-${e.id}-${date}-${i}`}
                  onClick={() => {
                    setCurrentDate(date);
                    setName(e.name);
                  }}
                >
                  {date}
                </SubTitle>
              )
            }
          )}
        </>
      )}
      { !category && (userEvents.map((e, i) =>
        <Title
          clickable
          key={`${e.id}-${i}`}
          onClick={() => setName(e.name)}
        >
          {e.name}
        </Title>
      ))}
    </Container>
  )
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 280px;
  height: calc(100vh - 80px);
  position: fixed;
  left: 0;
  top: 81px;
  background-color: ${(props) => props.theme.darkerBg};
  overflow: auto;
`;

const Title = styled.span<{ clickable?: boolean }>`
  width: 85%;
  margin: 20px 12px 10px 12px;
  font-weight: 500;
  font-size: 16px;
  color: ${(props) => props.theme.textColor};
  cursor: ${({ clickable }) => clickable ? 'pointer' : 'auto'};
`;

const SubTitle = styled.span<{focus?: boolean}>`
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  margin: 12px 20px;
  color: ${({ theme }) => theme.textColorDarker};
`;

const BackIcon = styled.div`
  padding: 20px 12px 10px;
  cursor: pointer;
`;

export default HomeSideMenu;
