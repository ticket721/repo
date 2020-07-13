import React            from 'react';
import { Icon, Navbar } from '@frontend/flib-react/lib/components';
import { NavLink }      from 'react-router-dom';

export const AnonymousNavbar: React.FC = (): JSX.Element => {
    return <Navbar>
        <NavLink exact={true} to={'/home'}>
            <Icon icon={'home'} color='#FFFFFF' size={'22px'}/>
        </NavLink>

        <NavLink exact={true} to={'/search'}>
            <Icon icon={'search'} color='#FFFFFF' size={'22px'}/>
        </NavLink>

        <NavLink exact={true} to={'/'}>
            <Icon icon={'t721'} color='#FFFFFF' size={'22px'}/>
        </NavLink>

        <NavLink exact={true} to={'/tags'}>
            <Icon icon={'tags'} color='#FFFFFF' size={'22px'}/>
        </NavLink>

        <NavLink exact={true} to={'/profile'}>
            <Icon icon={'profile'} color='#FFFFFF' size={'22px'}/>
        </NavLink>

    </Navbar>
};
