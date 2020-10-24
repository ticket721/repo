import './locales';
import React            from 'react';
import { useParams }    from 'react-router';
import { EventDetails } from './EventDetails';

const Event: React.FC = () => {

    const { id } = useParams();

    return (
        <EventDetails id={id}/>
    );
};

export default Event;
