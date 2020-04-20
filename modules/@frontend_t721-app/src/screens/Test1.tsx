 import React, { useEffect }                               from 'react';

export const TempoTopBar: React.ReactElement = (
    <div style={{
        color: 'white',
        height: '100%',
        fontSize: '2em',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '20px',
        backgroundColor: 'blue'
    }}>
        Test Header
    </div>
);

export const Test1: React.FC = () => {
    useEffect(() => {
        console.log('mount');

        return () => {
            console.log('unmount');
        }
    });

    return (
        <div className='Test1'>
            <p style={{ color: 'white'}}>
                Test1
            </p>
        </div>
    )
};
