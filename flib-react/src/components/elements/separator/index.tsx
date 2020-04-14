import * as React from 'react';
import styled from '../../../../config/styled';

export interface SeparatorProps extends React.ComponentProps<any> {
  overflow?: boolean;
}

const SeparatorContainer = styled.div<SeparatorProps>`
  background-color: #0B0912;
  bottom: 0;
  content: "";
  display: block;
  height: 2px;
  left: 0;
  position: absolute;
  width: ${props => props.overflow ? 'calc(100% + 8px)' : '100%'};
  z-index: 100;

  &::before,
  &::after {
    background-color: #0B0912;
    content: "";
    display: inline-block;
    height: ${props => props.theme.regularSpacing};
    position: absolute;
    top: -7px;
    transform: rotate(45deg);
    width: ${props => props.theme.regularSpacing};
  }

  &::before {
    left: -8px;
  }

  &::after {
    right: -8px;
  }

  ${props => props.overflow && `
    &::after {
      display: none;
    }
  `}
`

export const Separator: React.FunctionComponent<SeparatorProps> = (props: SeparatorProps): JSX.Element => {

  return <SeparatorContainer overflow={props.overflow}/>

};

export default Separator;
