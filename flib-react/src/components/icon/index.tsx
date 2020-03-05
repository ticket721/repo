import React from 'react';
import styled from '../../../config/styled';
import { icons } from '../../shared/icons';

export interface IconProps extends React.ComponentProps<any> {
  fill?: string;
  icon: string;
  height?: string;
  width?: string;
}

const Svg = styled.svg`
  display: block;
  fill: ${props => props.fill ? props.fill : props.theme.primaryColor};
  height: ${props => props.height ? props.height : 24}px;
  width: ${props => props.width ? props.width : 24}px;
`;


export const Icon: React.FunctionComponent<IconProps> = (props: IconProps): JSX.Element => {
  return <Svg fill={props.fill} height={props.height} width={props.width}>
      <path d={icons[props.icon]} />
    </Svg>
}

export default Icon;
