import React                from 'react';
import { useDispatch }      from 'react-redux';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';
import EventSideMenu from "../../components/EventSideMenu";
import EventSideDates from "../../components/EventSideDates";

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

const Home: React.FC = () => {
    const dispatch = useDispatch();
    const [currentDate, setCurrentDate] = React.useState<string>(
      `${dates[0].date.toDateString()} - ${dates[0].date.getHours()}:${dates[0].date.getMinutes()}`
    );

    return (
      <>
        <EventSideMenu currentDate={currentDate} setCurrentDate={setCurrentDate}/>
        <div className='Home' style={{ color: 'white', marginLeft: '280px' }}>
          Home
          <div onClick={() => dispatch(PushNotification('success message', 'success'))}>Success</div>
          <div onClick={() => dispatch(PushNotification('error message', 'error'))}>Error</div>
          <div onClick={() => dispatch(PushNotification('warning message', 'warning'))}>Warning</div>
          <div onClick={() => dispatch(PushNotification('info message', 'info'))}>Info</div>
        </div>
        <EventSideDates currentDate={currentDate} setCurrentDate={setCurrentDate}/>
      </>
    )
};

export default Home;
