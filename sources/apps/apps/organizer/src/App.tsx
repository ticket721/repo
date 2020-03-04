import React from 'react';
import './App.css';
import { Scanner } from './components/scanner';

export function App() {
    return (
      <div className='App'>
          <header className='App-header'>
              <p>
                  Organizer
              </p>
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
    );
}

export default App;
