import * as React from 'react';
import styled    from '../../config/styled';
import { icons } from '../../shared';

export interface IconProps extends React.ComponentProps<any> {
  fill?: string;
  icon: string;
  height?: string;
  width?: string;
}

const Svg = styled.svg<IconProps>`
  display: block;
  flex-shrink: 0;
  fill: ${props => props.fill ? props.fill : props.theme.primaryColor};
  height: 16px;
  transition: all 300ms ease;
  width: auto;
`;

export const Icon: React.FunctionComponent<IconProps & {className?: string}> = (props: IconProps): JSX.Element => {
  return <Svg viewBox={`0 0 ${props.width} ${props.height}`} className={props.className}>
          <path d={icons[props.icon]} fill={props.fill}/>
        </Svg>
}

Icon.defaultProps = {
  height: "24",
  width: "24"
}

export default Icon;
