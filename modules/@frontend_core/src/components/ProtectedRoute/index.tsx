import { Redirect, Route, useLocation } from 'react-router-dom';
import React, { PropsWithChildren } from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../redux/ducks';

export interface ProtectedRouteProps {
    path: string;
    exact?: boolean;
}

interface ProtectedRouteRState {
    authenticated: boolean;
    expired: boolean;
    validated: boolean;
}

type MergedProps = ProtectedRouteProps & ProtectedRouteRState;

const ProtectedRoute: React.FC<PropsWithChildren<MergedProps>> = (props: PropsWithChildren<MergedProps>) => {
    const { path, authenticated, expired, validated, exact } = props;

    const location = useLocation();

    return (
        <Route path={path} exact={exact}>
            {!authenticated || expired || (validated !== undefined && !validated) ? (
                <Redirect
                    to={{
                        pathname: '/login',
                        state: {
                            from: `${location.pathname}${location.search}`,
                        },
                    }}
                />
            ) : (
                props.children
            )}
        </Route>
    );
};

const mapStateToProps = (state: AppState): ProtectedRouteRState => ({
    authenticated: !!state.auth.token,
    expired: state.auth.token?.expiration.getTime() < Date.now(),
    validated: state.auth.user?.validated,
});

export default connect(mapStateToProps)(ProtectedRoute);
