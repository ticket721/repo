import React                              from 'react';
import { ActivitiesContainer, TitleText } from '@frontend/flib-react/lib/components';

const activities = ['notif0', 'notif1', 'notif2', 'notif3', 'notif4', 'notif5', 'notif6', 'notif7'];

const Activities: React.FC = () => {

    return (
        <ActivitiesContainer
        title='All activities'>
            {
                activities.map((e, i) => {
                      return (<TitleText text={e} key={e + i}/>);
                })
            }
        </ActivitiesContainer>
  );
};

export default Activities;
