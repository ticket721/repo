import { Route, Redirect } from 'react-router-dom';
import React, { PropsWithChildren } from 'react';
import { connect } from 'react-redux';
import { AppState } from '../../redux/ducks';

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
    const { path, key, authenticated, validated, exact } = props;

    return (
        <Route key={key} path={path} exact={exact}>
            {!authenticated || (validated !== undefined && !validated) ? (
                <Redirect
                    to={{
                        pathname: '/login',
                        state: {
                            from: path,
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
    validated: state.auth.user?.validated,
});

export default connect(mapStateToProps)(ProtectedRoute);
