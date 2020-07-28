import React                          from 'react';
import { Icon, Navbar }               from '@frontend/flib-react/lib/components';
import { Link, useLocation } from 'react-router-dom';
import { isNavItemActive }            from '@frontend/core/lib/utils/isNavItemActive';

interface AnonymousNavbarProps {
    visible: boolean;
}

export const AnonymousNavbar: React.FC<AnonymousNavbarProps> = (props: AnonymousNavbarProps): JSX.Element => {

    const location = useLocation();

    return <Navbar iconHeight={'22px'} visible={props.visible}>
        <Link replace={true} to={'/'} className={isNavItemActive('/', location)}>
            <Icon icon={'home'} color='#FFFFFF' size={'22px'}/>
        </Link>

        <Link replace={true} to={'/search'} className={isNavItemActive('/search', location)}>
            <Icon icon={'search'} color='#FFFFFF' size={'22px'}/>
        </Link>

        <Link replace={true} to={'/wallet'} className={isNavItemActive('/wallet', location)}>
            <Icon icon={'t721'} color='#FFFFFF' size={'22px'}/>
        </Link>

        <Link replace={true} to={'/tags'} className={isNavItemActive('/tags', location)}>
            <Icon icon={'tags'} color='#FFFFFF' size={'22px'}/>
        </Link>

        <Link replace={true} to={'/profile'} className={isNavItemActive('/profile', location)}>
            <Icon icon={'profile'} color='#FFFFFF' size={'22px'}/>
        </Link>

    </Navbar>
};
