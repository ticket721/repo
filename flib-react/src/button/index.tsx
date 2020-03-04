import * as React from 'react';
import styled from '../../config/styled';

export interface ButtonProps extends React.ComponentProps<any> {
  /**
   * Title of the button
  */
  title: string;

  /**
   * Gradient start color
   */
  gradientStart?: string;

  /**
   * Gradient end color
   */
  gradientEnd?: string;
  /**
   * Method called upon button click
  */
  onClick: () => void;

  /**
   * Type of the button
    */
  type: 'primary' | 'secondary' | 'custom';
}



const StyledButton = styled.button<ButtonProps>`
  ${props => props.type === 'primary' &&`
    background: linear-gradient(261.65deg, ${props.theme.primaryColor} 0%, ${props.theme.primaryColorGradientEnd} 100%);

    &::before {
      background: linear-gradient(0deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)), linear-gradient(259.17deg, ${props.theme.primaryColor} 0%, ${props.theme.primaryColorGradientEnd} 99.33%);
    }
  `};

  ${props => props.type === 'secondary' &&`
    background-color: ${props.theme.secondaryColor};

    &::before {
      background: linear-gradient(0deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15), ${props.theme.secondaryColor});
    }
  `};

  ${props => props.type === 'custom' &&`
    background: linear-gradient(261.65deg, ${props.gradientStart} 0%, ${props.gradientEnd} 100%);

    &::before {
      background: linear-gradient(0deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)), linear-gradient(259.17deg, ${props.gradientStart} 0%, ${props.gradientEnd} 99.33%);
    }
  `};

  border-radius: ${props => props.theme.buttonRadius};
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  overflow: hidden;
  padding: ${props => props.theme.regularPadding};
  position: relative;

  &::before {
    content: '';
    display: block;
    height: 100%;
    left: 0;
    opacity: 0;
    position: absolute;
    top: 0;
    transition: opacity 300ms ease;
    width: 100%;
  }

  &:hover {
    &::before {
      opacity: 1;
    }
  }

  span {
    position: relative;
    z-index: 1;
  }
`;


/**
 * This is a Button component
 */
export const Button: React.FunctionComponent<ButtonProps> = (props: ButtonProps): JSX.Element => {

  return <StyledButton
    name={props.title}
    onClick={props.onClick}
    gradientStart={props.gradientStart}
    gradientEnd={props.gradientEnd}
    type={props.type}
  >
    <span>{props.title}</span>
  </StyledButton>
};

Button.defaultProps = {
  type: 'primary'
};

export default Button;



