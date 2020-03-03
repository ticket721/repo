import * as React from 'react';
import styled from '../../config/styled';

export interface ButtonProps extends React.ComponentProps<any> {
    /**
     * Title of the button
     */
    title: string;

    /**
     * Method called upon button click
     */
    onClick: () => void;

    /**
     * Type of the button
     */
    type: 'primary' | 'warning' | 'error';
}

const StyledButton = styled.button`
  background: linear-gradient(
    259.17deg,
    ${props => props.theme.primaryColor} 0%,
    ${props => props.theme.primaryColorGradientEnd} 99.33%
  );
  border-radius: ${props => props.theme.buttonRadius};
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  padding: ${props => props.theme.regularPadding};

  &:hover {
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)),
      linear-gradient(
        259.17deg,
        ${props => props.theme.primaryColor} 0%,
        ${props => props.theme.primaryColorGradientEnd} 99.33%
      );
  }
`;


/**
 * This is a Button component
 */
export const Button: React.FunctionComponent<ButtonProps> = (props: ButtonProps): JSX.Element => {

    return <StyledButton
        name={props.title}
        onClick={props.onClick}
    >
        {props.title}
    </StyledButton>
};

Button.defaultProps = {
    type: 'primary'
};

export default Button;



