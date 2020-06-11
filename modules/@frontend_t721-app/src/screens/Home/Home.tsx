import React from 'react';
import { default as Test } from '../../components/Test';

const Home: React.FC = () => {

    console.log(process.env);

    return (
        <div className='Home' style={{ color: 'white' }}>
            Home
            <Test title='Test' />
        </div>
    )
};

export default Home;
