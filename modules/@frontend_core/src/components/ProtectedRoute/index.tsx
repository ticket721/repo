import { Redirect, Route, useLocation } from 'react-router-dom';
import React, { PropsWithChildren, useContext } from 'react';
import { UserContext } from '../../utils/UserContext';
import { ValidateEmail } from '../ValidateEmail';

export interface ProtectedRouteProps {
    path: string;
    exact?: boolean;
}

type MergedProps = ProtectedRouteProps;

const ProtectedRoute: React.FC<PropsWithChildren<MergedProps>> = (props: PropsWithChildren<MergedProps>) => {
    const { path, exact } = props;

    const user = useContext(UserContext);

    const location = useLocation();

    if (user === null) {
        return (
            <Route path={path} exact={exact}>
                <Redirect
                    to={{
                        pathname: '/login',
                        state: {
                            from: `${location.pathname}${location.search}`,
                        },
                    }}
                />
            </Route>
        );
    }

    if (user.valid === false) {
        return (
            <Route path={path} exact={exact}>
                <ValidateEmail />
            </Route>
        );
    }

    return (
        <Route path={path} exact={exact}>
            {props.children}
        </Route>
    );
};

export default ProtectedRoute;
