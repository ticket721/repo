import * as React from 'react';
import styled from '../../../config/styled';

export interface GradientProps extends React.ComponentProps<any> {
  /**
   * Add 6.25% to the 1st value of the array
   * So the result looks like this
   * ['#EBBC16 6.25%', '#DB535B']
  */
  blurOnly?:boolean;
  values: string[];
}

const GradientBar = styled.div<GradientProps>`
  ${props => !props.blurOnly && `
    background: linear-gradient(180deg, rgba(255, 255, 255, 0), ${props.values.join(', ')});
  `}
  bottom: 0;
  content: '';
  height: 100%;
  position: absolute;
  right: 0;
  transform: matrix(-1, 0, 0, 1, 0, 0);
  width: ${props => props.blurOnly ? '0px' : '8px'};
  z-index: 0;

  &::after {
    background: linear-gradient(180deg, ${props => props.values.join(', ')});
    content: '';
    display: block;
    filter: blur(100px);
    height: 100%;
    opacity: 0.12;
    transform: matrix(-1, 0, 0, 1, 0, 0);
    width: 150px;
  }
`

export const Gradient: React.FunctionComponent<GradientProps> = (props: GradientProps): JSX.Element => {

  return <GradientBar values={props.values} blurOnly={props.blurOnly} />

};

export default Gradient;
