import React, { useContext } from 'react';
import { Icon, Navbar }               from '@frontend/flib-react/lib/components';
import { Link, useLocation } from 'react-router-dom';
import { UserContext }                from '@frontend/core/lib/utils/UserContext';
import { isNavItemActive }   from '@frontend/core/lib/utils/isNavItemActive';

interface StaffNavbarProps {
    visible: boolean;
}

const AuthStaffNavbar: React.FC<StaffNavbarProps> = (props: StaffNavbarProps): JSX.Element => {

    const location = useLocation();

    return <Navbar visible={props.visible} iconHeight={'22px'}>
        <Link replace={true} to={'/stats'} className={isNavItemActive('/stats', location)}>
            <Icon icon={'stats'} color='#FFFFFF' size={'22px'}/>
        </Link>

        <Link replace={true} to={'/ticket/scanner'} className={isNavItemActive('/ticket/scanner', location)}>
            <Icon icon={'scan'} color='#FFFFFF' size={'22px'}/>
        </Link>

        <Link replace={true} to={'/list'} className={isNavItemActive('/list', location)}>
            <Icon icon={'attendees'} color='#FFFFFF' size={'22px'}/>
        </Link>
    </Navbar>
};

export const StaffNavbar: React.FC<StaffNavbarProps> = (props: StaffNavbarProps) => {
    const user = useContext(UserContext);

    if (user?.valid) {
        return <AuthStaffNavbar visible={props.visible}/>;
    } else {
        return null
    }
};
