import * as React from 'react';
import styled from '../../config/styled';
import '../../../static/t721-icons/t721-icons.css';

interface IconGradient {
    hexCodes: string[];
    angle: number;
}

export type IconColor = string | IconGradient;

export interface IconProps extends React.ComponentProps<any> {
    color?: IconColor;
    icon: string;
    size: string;
    onClick?: () => void;
}

export const Icon: React.FunctionComponent<IconProps & { className?: string }> = (props: IconProps): JSX.Element => {
    return (
        <IconSpan
            onClick={props.onClick}
            className={`
    t721-icons-${props.icon}
    ${props.className ? props.className : ''}
    `}
            size={props.size}
            color={props.color}
        />
    );
};

const IconSpan = styled.span<IconProps>`
    display: block;
    flex-shrink: 0;
    font-size: ${(props) => props.size} !important;
    transition: all 300ms ease;
    color: ${(props) =>
        props.color
            ? typeof props.color === 'string'
                ? props.color
                : props.color.hexCodes[0]
            : props.theme.primaryColor.hex} !important;
    ${(props) =>
        props.color && typeof props.color !== 'string'
            ? `
        background: -webkit-linear-gradient(${props.color.angle}deg, ${props.color.hexCodes.join(',')});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        `
            : null}
`;

Icon.defaultProps = {
    size: '24px',
};

export default Icon;
