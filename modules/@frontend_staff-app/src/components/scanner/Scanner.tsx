import React                                                from 'react';
import QrReader                                             from 'react-qr-reader';

export interface ScannerProps {
    onScan: (data: string | null) => void;
    onError: (err: Error) => void;
    onLoad: () => void;
    delay: number;
    facingMode: 'user' | 'environment';
    width: number | string;
    height: number | string;
}

export const Scanner: React.FC<ScannerProps> = (props: ScannerProps): React.ReactElement => {
    return (
        <div>
            <QrReader
            onScan={props.onScan}
            onError={props.onError}
            onLoad={props.onLoad}
            delay={props.delay}
            facingMode={props.facingMode}
            style={{
                'width': props.width,
                'heigth': props.height
            }}
            showViewFinder={false} />
        </div>

    );
};
