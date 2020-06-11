import React from 'react';
import styled from 'styled-components';

const dates = [
  {
    name: 'VIP',
    date: new Date(),
  },
  {
    name: 'VIP',
    date: new Date('2020-05-17T10:30:00'),
  },
  {
    name: 'VIP',
    date: new Date('2020-05-20T10:30:00'),
  },
  {
    name: 'VIP',
    date: new Date('2020-05-23T10:30:00'),
  },
  {
    name: 'VIP',
    date: new Date('2020-06-02T10:30:00'),
  },
  {
    name: 'VIP',
    date: new Date('2020-06-16T10:30:00'),
  },
];

interface Props {
  currentDate: string | undefined;
  setCurrentDate: (date: string) => void;
}

const HomeSideMenu = ({ currentDate, setCurrentDate }: Props) => {
  return (
    <Container>
      <Title>{dates[0].name}</Title>
      {
        dates.map((e, i) => {
            const date = `${e.date.toDateString()} - ${e.date.getHours()}:${e.date.getMinutes()}`;

            return (
              <SubTitle
                key={`side-dates-${e.name}-${date}-${i}`}
                focus={currentDate === date}
                onClick={() => setCurrentDate(date)}
              >
                {date}
              </SubTitle>
            );
          }
        )
      }
    </Container>
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
`;

const Separator = styled.div`
  height: 2px;
  width: 100%;
  margin: 12px 0;
  background: rgba(10, 8, 18, 0.3);
`;

const Title = styled.span`
  width: 85%;
  margin: 20px 12px 10px 12px;
  font-weight: 500;
  font-size: 16px;
  color: ${(props) => props.theme.textColor};
`;

const SubTitle = styled.span<{focus?: boolean}>`
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  margin: 12px 20px;
  color: ${({ theme, focus }) => focus ? theme.textColor : theme.textColorDarker};
`;
export default HomeSideMenu;
