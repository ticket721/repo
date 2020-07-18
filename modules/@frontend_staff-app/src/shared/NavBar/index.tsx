import React     from 'react';
import { Icon, Navbar }             from '@frontend/flib-react/lib/components';
import { NavLink }                  from 'react-router-dom';

interface StaffNavbarProps {
    visible: boolean;
}

export const StaffNavbar: React.FC<StaffNavbarProps> = (props: StaffNavbarProps): JSX.Element => {
    return <Navbar visible={props.visible} iconHeight={'22px'}>
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
