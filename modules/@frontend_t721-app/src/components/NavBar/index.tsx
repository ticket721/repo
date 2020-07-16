import React               from 'react';
import { useSelector }     from 'react-redux';
import { T721AppState }    from '../../redux';
import { AnonymousNavbar } from './AnonymousNavbar';
import { LoginNavbar }     from './LoginNavbar';

export const T721Navbar: React.FC = (): JSX.Element => {
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));

    if (token) {
        return <LoginNavbar/>;
    } else {
        return <AnonymousNavbar/>;
    }
};
