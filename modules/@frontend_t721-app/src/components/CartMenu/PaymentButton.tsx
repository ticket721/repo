import styled   from 'styled-components';
import { Icon } from '@frontend/flib-react/lib/components';

export interface PaymentButtonDivProps {
    color: string;
    textColor: string;
    disabled: boolean;
}

export const PaymentButtonDiv = styled.div<PaymentButtonDivProps>`
  opacity: ${props => props.disabled ? '0.1' : '1'};
  width: 80%;
  margin: ${props => props.theme.regularSpacing};
  border-radius: ${props => props.theme.defaultRadius};
  background-color: ${props => props.color};
  padding: ${props => props.theme.regularSpacing};
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  cursor: pointer;

  & span {
    color: ${props => props.textColor};
  }
`;

export interface PaymentButtonIconProps {
    loading?: boolean;
}

export const PaymentButtonIcon = styled(Icon)<PaymentButtonIconProps>`

  @keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
  }

  ${props => props.loading

    ?
    `animation: rotate 1s infinite;`

    :
    ``
}
  margin-left: ${props => props.theme.smallSpacing};
  display: inline;
`;
