import React                from 'react';
import { useDispatch }      from 'react-redux';
import styled from 'styled-components';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';
import { SingleImage } from "@frontend/flib-react/lib/components";
import EventPresentation from "../../components/EventPresentation";
import HomeSideMenu from "../../components/HomeSideMenu";

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

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const [currentDate, setCurrentDate] = React.useState<string>();
  const [name, setName] = React.useState<string>();

  return (
    <>
      {currentDate && <EventPresentation name={name} currentDate={currentDate} setCurrentDate={setCurrentDate}/>}
      {name && !currentDate && <HomeSideMenu setName={setName} currentDate={currentDate} setCurrentDate={setCurrentDate} name={name}/>}
      <Container isMenuOpen={(!!name || !!currentDate)}>
        {!currentDate && dates.map((event, i) =>
          <div key={`${event[0].name}-${i}`} className='card' onClick={() => setName(event[0].name)}>
            <SingleImage
              src={event[0].src}
              id={`${event[0].name}-${i}`}
              title={event[0].name}
              price={event[0].price}
              text={`${event[0].startDate.toDateString()} - ${event[0].startDate.getHours()}:${event[0].startDate.getMinutes()}`}
            />
          </div>
        )}
      </Container>
    </>
  )
};

const Container = styled.div<{isMenuOpen: boolean}>`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  width: ${({ isMenuOpen }) => isMenuOpen ? 'calc(100% - 280px)' : '100%'};
  margin-left: ${({ isMenuOpen }) => isMenuOpen ? '280px' : 'unset'};

  .card {
    display: flex;
    width: 45%;
    cursor: pointer;
  }
`;

export default Home;
