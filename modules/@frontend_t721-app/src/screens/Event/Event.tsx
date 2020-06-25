import './locales';
import React             from 'react';
import { useRouteMatch } from 'react-router';
import { EventDetails }  from './EventDetails';

const Event: React.FC = () => {

    const match = useRouteMatch();

    const eventId = (match.params as any).id;

    return (
        <EventDetails id={eventId}/>
    );
};

export default Event;
