import React from 'react';
import './App.css';
import './App.css';
import { AppState, configureStore }        from '@frontend/core/lib/redux/store';
import { Store }           from 'redux';

import { Route, Link, Switch } from 'react-router-dom';
import { Home }                                         from './screens/Home';
import { SecondPage }                           from './screens/SecondPage';

const store: Store<AppState> = configureStore();

export const App = () => {
    return (
        <div id='App'>
            <nav>
                <Link to='/'>Home</Link>
                <Link to='/second'>Second</Link>
            </nav>
            <Switch>
                <Route path='/second' component={SecondPage} />
                <Route component={Home} />
            </Switch>
        </div>
    );
};

export default App;
