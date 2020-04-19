import React, { Suspense } from 'react';
import Foo                 from '../components/foo';
import { Scanner }         from '../components/scanner';

export const Home: React.FC = () => (
  <Suspense fallback='loading'>
    <div className='App'>
      <header className='App-header'>
        <p>
          Organizer
        </p>
        <Foo foo={true} />
      </header>
      <Scanner
        onScan={(data: string) => console.log(data)}
        onError={console.log}
        onLoad={console.log}
        delay={1000}
        facingMode={'environment'}
        width={'100%'}
        height={'100%'} />
    </div>
  </Suspense>
);
