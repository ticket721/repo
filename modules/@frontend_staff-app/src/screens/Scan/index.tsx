import React, { useState } from 'react';
import QrReader            from 'react-qr-reader';
import styled              from 'styled-components';
import { TopNav }              from './TopNavbar';

const Scan: React.FC = () => {
    const [ loaded, setLoaded ] = useState<boolean>(false);

    return (
        <ScannerWrapper>
            <TopNav/>
            {
                !loaded ?
                <p>loading</p> :
                    null
            }
            <QrReader
                onScan={(data) => console.log(data)}
                onError={(err) => console.log(err)}
                onLoad={() => setLoaded(true)}
                delay={100}
                facingMode={'environment'}
                style={{
                    'width': '100vw',
                    'height': '100vh'
                }}
                showViewFinder={false} />
        </ScannerWrapper>
    );
};

const ScannerWrapper = styled.div`
    section > section {
        padding-top: 100vh !important;
    }
`;

export default Scan;
