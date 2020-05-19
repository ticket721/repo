import * as React from 'react';
import styled       from '../../config/styled';
import '../../../static/t721-icons/t721-icons.css';

export interface IconProps extends React.ComponentProps<any> {
  color?: string;
  icon: string;
  size: string;
}

export const Icon: React.FunctionComponent<IconProps & {className?: string}> = (props: IconProps): JSX.Element => {
  console.log(props.color);
  return <IconSpan
    className={`
    t721-icons-${props.icon}
    ${props.className ? props.className : ''}
    `}
    size={props.size}
    color={props.color} />
};

const IconSpan = styled.span<IconProps>`
  display: block;
  flex-shrink: 0;
  color: ${props => props.color ? props.color : props.theme.primaryColor};
  font-size: ${props => props.size };
  transition: all 300ms ease;
`;

Icon.defaultProps = {
  size: '24px',
};

export default Icon;
