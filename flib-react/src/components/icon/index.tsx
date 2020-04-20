import * as React from 'react';
import styled    from '../../config/styled';
import { icons } from '../../shared';

export interface IconProps extends React.ComponentProps<any> {
  fill?: string;
  icon: string;
  height?: string;
  width?: string;
}

const Svg = styled.svg`
  display: block;
  flex-shrink: 0;
  height: ${props => props.height ? `${props.height}px` : '100%'};
  transition: all 300ms ease;
  width: ${props => props.width ? `${props.width}px` : '100%'};
`;


export const Icon: React.FunctionComponent<IconProps> = (props: IconProps): JSX.Element => {
  return <Svg height={props.height} width={props.width}>
          <path d={icons[props.icon]} fill={props.fill}/>
        </Svg>
}

export default Icon;
