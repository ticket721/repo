import { Route } from 'react-router-dom';
import React, { PropsWithChildren, useState } from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../redux/ducks';
import { Login } from '../Login';
import { Register } from '../Register';

export interface ProtectedRouteProps {
    path: string;
    exact?: boolean;
}

interface ProtectedRouteRState {
    authenticated: boolean;
    validated: boolean;
}

type MergedProps = ProtectedRouteProps & ProtectedRouteRState;

const ProtectedRoute: React.FC<PropsWithChildren<MergedProps>> = (props: PropsWithChildren<MergedProps>) => {
    const { path, authenticated, validated, exact } = props;

    const [login, setLogin] = useState(true);

    return (
        <Route path={path} exact={exact}>
            {!authenticated || (validated !== undefined && !validated) ? (
                login ? (
                    <Login onRegister={() => setLogin(false)} />
                ) : (
                    <Register onLogin={() => setLogin(true)} />
                )
            ) : (
                props.children
            )}
        </Route>
    );
};

const mapStateToProps = (state: AppState): ProtectedRouteRState => ({
    authenticated: !!state.auth.token,
    validated: state.auth.user?.validated,
});

export default connect(mapStateToProps)(ProtectedRoute);
