import * as React from 'react';
import styled from '../../../../config/styled';

export interface GradientProps extends React.ComponentProps<any> {
  values: string[];
}

const GradientBar = styled.div<GradientProps>`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), ${props => props.values.join(', ')});
  bottom: 0;
  content: '';
  height: 100%;
  position: absolute;
  right: 0;
  transform: matrix(-1, 0, 0, 1, 0, 0);
  width: 8px;

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

  return <GradientBar values={props.values}></GradientBar>

};

export default Gradient;
