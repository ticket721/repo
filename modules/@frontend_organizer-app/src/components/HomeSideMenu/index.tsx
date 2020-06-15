import React from 'react';
import styled from 'styled-components';


const dates = [
  [
    {
      name: 'VIP',
      startDate: new Date(),
      src: 'superImage',
      price: 120,
    },
    {
      name: 'VIP',
      startDate: new Date('2020-05-17T10:30:00'),
    },
    {
      name: 'VIP',
      startDate: new Date('2020-05-20T10:30:00'),
    },
    {
      name: 'VIP',
      startDate: new Date('2020-05-23T10:30:00'),
    },
    {
      name: 'VIP',
      startDate: new Date('2020-06-02T10:30:00'),
    },
    {
      name: 'VIP',
      startDate: new Date('2020-06-16T10:30:00'),
    },
  ],
  [
    {
      name: 'Weekend',
      startDate: new Date(),
      src: 'superImage',
      price: 80,
    },
    {
      name: 'Weekend',
      startDate: new Date('2020-05-17T10:30:00'),
    },
    {
      name: 'Weekend',
      startDate: new Date('2020-05-20T10:30:00'),
    },
    {
      name: 'Weekend',
      startDate: new Date('2020-05-23T10:30:00'),
    },
  ],
  [
    {
      name: 'Early bird',
      startDate: new Date('2020-06-02T10:30:00'),
      src: 'superImage',
      price: 70,
    },
    {
      name: 'Early bird',
      startDate: new Date('2020-06-16T10:30:00'),
    },
  ],
  [
    {
      name: 'test',
      startDate: new Date('2020-06-02T10:30:00'),
      src: 'superImage',
      price: 12,
    },
    {
      name: 'test',
      startDate: new Date('2020-06-16T10:30:00'),
    },
  ],
];

interface Props {
  currentDate: string | undefined;
  setCurrentDate: (startDate: string) => void;
  setName: (name: string) => void;
  name: string;
}

const HomeSideMenu = ({ currentDate, setCurrentDate, setName, name }: Props) => {
  const category = dates.find((e) => e[0].name === name);

  return (
    <Container>
      <Title>{category[0].name}</Title>
      {category.map((e, i) => {
        const date = `${e.startDate.toDateString()} - ${e.startDate.getHours()}:${e.startDate.getMinutes()}`;

        return (
          <SubTitle
            key={`side-dates-${e.name}-${date}-${i}`}
            focus={currentDate === date}
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
  overflow: auto;
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
