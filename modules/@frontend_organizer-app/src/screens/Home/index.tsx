import React                from 'react';
import { useDispatch }      from 'react-redux';
import styled from 'styled-components';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';
import { SingleImage } from "@frontend/flib-react/lib/components";
import EventPresentation from "../../components/EventPresentation";
import HomeSideMenu from "../../components/HomeSideMenu";
import { dates } from '../../components/EventPresentation/fakeData';

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const [currentDate, setCurrentDate] = React.useState<string>();
  const [name, setName] = React.useState<string>();

  return (
    <>
      {currentDate && <EventPresentation name={name} currentDate={currentDate} setCurrentDate={setCurrentDate}/>}
      {!currentDate && <HomeSideMenu setName={setName} currentDate={currentDate} setCurrentDate={setCurrentDate} name={name}/>}
      <Container>
        {!currentDate && dates.map((event, i) =>
          <div key={`${event[0].name}-${i}`} className='card' onClick={() => setName(event[0].name)}>
            <SingleImage
              src={event[0].src}
              id={`${event[0].name}-${i}`}
              title={event[0].name}
              price={parseFloat(event[0].price)}
              text={`${event[0].startDate.toDateString()} - ${event[0].startDate.getHours()}:${event[0].startDate.getMinutes()}`}
            />
          </div>
        )}
      </Container>
    </>
  )
};

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  width: calc(100% - 280px);
  margin-left: 280px;

  .card {
    display: flex;
    width: 45%;
    cursor: pointer;
  }
`;

export default Home;
