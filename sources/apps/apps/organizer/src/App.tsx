import React from 'react';
import './App.css';
import { AppState }        from '@libs/redux/store';
import { configureStore }  from '@libs/redux/store';
import { Store }           from 'redux';
import { Provider } from 'react-redux';

import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import { Home }                                         from '@apps/organizer/src/pages/Home';
import { SecondPage }                           from '@apps/organizer/src/pages/SecondPage';

const store: Store<AppState> = configureStore();

export const App = () => {
    return (
      <Provider store={store}>
          <Router>
              <nav>
                  <Link to='/'>Home</Link>
                  <Link to='/second'>Second</Link>
              </nav>
              <Switch>
                  <Route path='/second' component={SecondPage} />
                  <Route component={Home} />
              </Switch>
          </Router>
      </Provider>
    );
};

export default App;
