import React                from 'react';
import { useDispatch }      from 'react-redux';
import { PushNotification } from '@frontend/core/lib/redux/ducks/notifications';
import SideMenu from "../../components/SideMenu";

const Home: React.FC = () => {
    const dispatch = useDispatch();
    return (
      <>
        <SideMenu />
        <div className='Home' style={{ color: 'white', marginLeft: '280px' }}>
          Home
          <div onClick={() => dispatch(PushNotification('success message', 'success'))}>Success</div>
          <div onClick={() => dispatch(PushNotification('error message', 'error'))}>Error</div>
          <div onClick={() => dispatch(PushNotification('warning message', 'warning'))}>Warning</div>
          <div onClick={() => dispatch(PushNotification('info message', 'info'))}>Info</div>
        </div>
      </>
    )
};

export default Home;
