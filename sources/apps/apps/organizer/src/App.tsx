import React, { Suspense } from 'react';
import './App.css';
import { Scanner }         from './components/scanner';
import Foo                     from './components/foo';

export const App = () => {
    return (
      <Suspense fallback='loading'>
        <div className='App'>
          <header className='App-header'>
            <p>
              Organizer
            </p>
            <Foo foo={true} />
            <Scanner
              onScan={console.log}
              onError={console.log}
              onLoad={console.log}
              delay={1000}
              facingMode={'environment'}
              width={'100%'}
              height={'100%'} />
          </header>
        </div>
      </Suspense>
    );
};

export default App;
