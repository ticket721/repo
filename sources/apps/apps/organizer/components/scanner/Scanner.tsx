import React from 'react';
import QrReader                    from 'react-qr-reader';

export interface ScannerProps {
  onError: (error: Error) => void;
  onLoad: () => void;
  onScan: (data: string | null) => void;
  delay: number;
  facingMode: 'user' | 'environment';
  width: string | number;
  heigth: string | number;
}

export const Scanner: React.FC<ScannerProps> = (props: ScannerProps): React.ReactElement => (
    <QrReader
      delay={props.delay}
      onError={props.onError}
      onScan={props.onScan}
      onLoad={props.onLoad}
      showViewFinder={false}
      style={{
        width: props.width,
        height: props.heigth
      }}
      facingMode={props.facingMode}
    />
);