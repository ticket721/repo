import React from 'react';
import './App.css';
import { Scanner } from './components/scanner';

function App() {
  return (
      <div className="App">
          <header className="App-header">
              <p>
                Organizer T721 Application
              </p>
              <div className="caca">
                <Scanner
                onError={console.log}
                onLoad={console.log}
                onScan={console.log}
                delay={1000}
                facingMode={'environment'}
                width={'100%'}
                heigth={'100%'}/>
              </div>
          </header>
      </div>
  );
}

export default App;
