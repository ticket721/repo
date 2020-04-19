import * as React from 'react';
import styled from '../../../config/styled';

export interface QrCodeProps extends React.ComponentProps<any> {
  label: string;
}

const Button = styled.button`
  align-items: center;
  appearance: none;
  background-color: ${props => props.theme.textColor};
  backdrop-filter: blur(4px);
  border-radius: ${props => props.theme.defaultRadius};
  color: #1B1725;
  display: inline-flex;
  margin: 0 auto;
  padding: ${props => props.theme.smallSpacing};
  font-size: 15px;
  font-weight: 500;
  width: 100%;

  img {
    box-shadow: 0px 2px 28px rgba(0, 0, 0, 0.2);
    margin-right: ${props => props.theme.doubleSpacing};
  }
`

export const QrCode: React.FunctionComponent<QrCodeProps> = (props:QrCodeProps): JSX.Element => {

  return <Button>
          <img src="assets/images/qr-code.jpg" />
          <p>{props.label}</p>
        </Button>
};

export default QrCode;
