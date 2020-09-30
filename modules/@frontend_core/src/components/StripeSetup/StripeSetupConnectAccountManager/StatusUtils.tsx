import { Theme } from '@frontend/flib-react/lib/config/theme';
import React from 'react';
import styled from 'styled-components';

export const StatusIcon = (props: { status: string }): JSX.Element => {
    let char;

    switch (props.status) {
        case 'warning': {
            char = '○';
            break;
        }
        case 'error': {
            char = '⦿';
            break;
        }
        case 'success': {
            char = '✔';
            break;
        }
        default: {
            char = '⦾';
            break;
        }
    }

    return <span style={{ fontSize: 16, marginLeft: 5 }}>{char}</span>;
};

export const colorFromStatus = (theme: Theme, status: string): string => {
    switch (status) {
        case 'warning':
            return theme.warningColor.hex;
        case 'success':
            return theme.successColor.hex;
        case 'error':
            return theme.errorColor.hex;
        default:
            return theme.textColor;
    }
};

export interface StatusTextProps {
    color: string;
}

export const StatusText = styled.h3<StatusTextProps>`
    font-size: 16px;
    font-weight: 400;
    color: ${(props) => props.color};
`;
