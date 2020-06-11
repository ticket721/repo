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
  currentDate: string;
  setCurrentDate: (date: string) => void;
}

const EventSideDates = ({ currentDate, setCurrentDate }: Props) => {
  return (
    <Container>
      {
        dates.map((e, i) => {
            const date = `${e.date.toDateString()} - ${e.date.getHours()}:${e.date.getMinutes()}`;

            return (
              <Title
                key={`side-dates-${e.name}-${date}-${i}`}
                focus={currentDate === date}
                onClick={() => setCurrentDate(date)}
              >
                {date}
              </Title>
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
  padding: 16px 16px;
  border-radius: 8px;
  position: absolute;
  right: 20px;
  top: 104px;  background-color: ${(props) => props.theme.darkerBg};

  button {
    outline: none;
  }
`;

const Title = styled.span<{focus?: boolean}>`
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  margin: 12px 20px;
  color: ${({ theme, focus }) => focus ? theme.textColor : theme.textColorDarker};
`;

export default EventSideDates;
