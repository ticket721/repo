import React from 'react';
import styled from 'styled-components';

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
      { !category && (userEvents.map((e, i) =>
        <Title
          clickable
          key={`home-side-menu-${e.group_id}-${i}`}
          onClick={() => {
            const first = formatDateForDisplay(e.dates[0].startDate);
            setName(e.name);
            setCurrentDate(first);
          }}
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

export default HomeSideMenu;
