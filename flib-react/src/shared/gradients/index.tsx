import * as React from 'react';
import styled from '../../../config/styled';

export interface GradientProps extends React.ComponentProps<any> {
  gradients: string[];

}

const GradientContainer = styled.div<GradientProps>`
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), ${props => props.gradients.join(', ')});
  bottom: 0;
  content: '';
  height: 100%;
  position: absolute;
  right: 0;
  transform: matrix(-1, 0, 0, 1, 0, 0);
  width: 8px;

  &::after {
    background: linear-gradient(180deg, ${props => props.gradients.join(', ')});
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

  return <GradientContainer
            gradients={props.gradients}
          >
          </GradientContainer>
};

export default Gradient;



