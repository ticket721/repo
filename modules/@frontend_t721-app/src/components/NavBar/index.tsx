import React, { useContext } from 'react';
import { useSelector }       from 'react-redux';
import { T721AppState }      from '../../redux';
import { AnonymousNavbar }   from './AnonymousNavbar';
import { LoginNavbar }       from './LoginNavbar';
import { UserContext }       from '@frontend/core/lib/utils/UserContext';

interface T721NavbarProps {
    visible: boolean;
}

export const T721Navbar: React.FC<T721NavbarProps> = (props: T721NavbarProps): JSX.Element => {
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const user = useContext(UserContext);

    if (token && user && user.valid) {
        return <LoginNavbar visible={props.visible}/>;
    } else {
        return <AnonymousNavbar visible={props.visible}/>;
    }
};
