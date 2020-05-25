import * as React                          from 'react';
import styled                              from '../../config/styled';
import { Icon }                            from '../icon';
import { useContext, useEffect, useState } from 'react';
import { ThemeContext }                    from 'styled-components';
import Timeout = NodeJS.Timeout;
import { ColorDefinition }                 from '../../config/theme';

export interface NotificationProps extends React.ComponentProps<any> {
    message: string;
    kind: 'info' | 'success' | 'error' | 'warning';
    temporizer?: number;
    icon?: string;
    color?: string;
    onCloseClick?: () => void;
}

const StyledNotification = styled.div<NotificationProps & { opacity: number, bgColor: ColorDefinition }>`
    position: relative;
    display: inline-flex;
    align-items: center;
    color: rgba(255, 255, 255, 0.9);
    padding: calc(${props => props.theme.regularSpacing} - 4px) ${props => props.theme.regularSpacing};
    margin: 15px 15px 15px 33px;
    font-size: 15px;
    font-weight: 500;
    border-radius: 0px 5px 5px 5px;
    opacity: ${props => props.opacity};
    background-color: ${props => props.bgColor.hex};
    box-shadow: 0 0 8px rgba(${props => `${props.bgColor.r}, ${props.bgColor.g}, ${props.bgColor.b}`}, 0.5);

    transition: opacity 300ms;

    ::before {
        content: "";
        position: absolute;
        background-color: transparent;
        height: 18px;
        top: 22px;
        width: 18px;
        border-top-right-radius: 5px;
        left: -18px;
        box-shadow: 5px -5px 0px 0px${props => props.bgColor.hex};
    }
`;

const Close = styled.div<NotificationProps & { bgColor: ColorDefinition }>`
    position: absolute;
    top: 0;
    left: -18px;
    padding: 6px 2px 6px 6px;
    background-color: ${props => props.bgColor.hex};
    box-shadow: 0 0 8px rgba(${props => `${props.bgColor.r}, ${props.bgColor.g}, ${props.bgColor.b}`}, 0.5);
    border-radius: 4px 0 0 4px;
    cursor: pointer;
`;

const Message = styled.span`
    margin: 3px 0 0 10px;
`;

export const Notification: React.FunctionComponent<NotificationProps> = (props: NotificationProps): JSX.Element => {
    const [ opacity, setOpacity ] = useState(1);

    useEffect(() => {
        let timeout: Timeout;
        if (props.temporizer) {
            timeout = setTimeout(() => {
                setOpacity(0);
            }, props.temporizer - 300);
        }

        return () => clearTimeout(timeout);
    }, []);

    const themeContext = useContext(ThemeContext);

    const selectThemeColor = (): string => {
        switch(props.kind) {
            case 'info':
                return themeContext.primaryColorGradientEnd;
            case 'success':
                return themeContext.successColor;
            case 'error':
                return themeContext.errorColor;
            case 'warning':
                return themeContext.warningColor;
          default:
                return themeContext.primaryColorGradientEnd;
        }
    };

    return <StyledNotification
    bgColor={selectThemeColor()}
    opacity={opacity}>
        {
            props.onCloseClick ?
            <Close
            bgColor={selectThemeColor()}
            onClick={props.onCloseClick}>
                <Icon
                icon='close'
                size='10px'
                color='rgba(255, 255, 255, 0.75)' />
            </Close> :
            null
        }
        <Icon
          icon={props.icon || props.kind}
          size='25px'
          color='rgba(255, 255, 255, 0.9)' />
        <Message>{props.message}</Message>
    </StyledNotification>
};

Notification.defaultProps = {
  kind: 'info',
};

export default Notification;



