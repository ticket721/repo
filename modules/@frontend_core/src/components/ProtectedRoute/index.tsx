import { Route, Redirect }            from 'react-router-dom';
import React from 'react';
import { connect }       from 'react-redux';
import { AppState }                   from '../../redux/ducks';

export interface ProtectedRouteProps {
    path: string;
    key: number;
    page: any;
}

interface ProtectedRouteRState {
    authenticated: boolean;
    validated: boolean;
}

type MergedProps = ProtectedRouteProps & ProtectedRouteRState;

const ProtectedRoute: React.FC<MergedProps> = (props: MergedProps) => {
    const { path, key, page, authenticated, validated } = props;

    return (
        <Route key={key} path={path}>
            {
                !authenticated || ( validated !== undefined && !validated) ?
                <Redirect to={{
                    pathname: '/login',
                    state: {
                        from: path
                    }}} /> :
                  page
            }
        </Route>
    );
};

const mapStateToProps = (state: AppState): ProtectedRouteRState => ({
    authenticated: !!state.auth.token,
    validated: state.auth.user?.validated,
});

export default connect(mapStateToProps)(ProtectedRoute);
