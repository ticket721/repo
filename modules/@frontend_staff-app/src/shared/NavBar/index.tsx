import React     from 'react';
import { Icon, Navbar }             from '@frontend/flib-react/lib/components';
import { NavLink }                  from 'react-router-dom';

export const StaffNavbar: React.FC = (): JSX.Element => {
    return <Navbar>
        <NavLink exact={true} to={'/stats'}>
            <Icon icon={'stats'} color='#FFFFFF' size={'22px'}/>
        </NavLink>

        <NavLink exact={true} to={'/ticket/scanner'}>
            <Icon icon={'scan'} color='#FFFFFF' size={'22px'}/>
        </NavLink>

        <NavLink exact={true} to={'/list'}>
            <Icon icon={'attendees'} color='#FFFFFF' size={'22px'}/>
        </NavLink>
    </Navbar>
};
