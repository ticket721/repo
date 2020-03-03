import * as React from 'react';
import styled from 'styled-components';

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
  padding-bottom: 10px;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 15px;
  background-color: blue;
  &:active {
    outline: 0;
    color: #fff;
    top: 1px;
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



