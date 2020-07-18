import React, { useCallback, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import Icon from '../icon';
import { Theme } from '../../config/theme';
import Countdown from 'react-countdown';

export interface ErrorProps {
    message: string;
    onRefresh?: () => void;
    retryLabel?: string;
}

const ErrorText = styled.p`
    font-size: 20px;
    font-weight: 400;
    color: ${(props) => props.theme.textColor};
    margin-bottom: ${(props) => props.theme.regularSpacing};
`;

const CenteredDiv = styled.div`
    border-radius: ${(props) => props.theme.defaultRadius};
    margin: ${(props) => props.theme.regularSpacing};
    margin-top: calc(48px + constant(safe-area-inset-top) + ${(props) => props.theme.regularSpacing});
    margin-top: calc(48px + env(safe-area-inset-top) + ${(props) => props.theme.regularSpacing});
    background-color: ${(props) => props.theme.componentColor};
    padding: ${props => props.theme.regularSpacing};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;

const SadIcon = styled(Icon)`
    color: ${(props) => props.theme.textColor};
    margin-bottom: ${(props) => props.theme.regularSpacing};
`;

const CountdownText = styled.h4`
    font-weight: 300;
    font-size: 12px;
    text-transform: uppercase;
`;

const renderer = (
    retryingInLabel: string,
    { hours, minutes, seconds, completed }: { hours: number; minutes: number; seconds: number; completed: boolean },
) => {
    if (completed) {
        return null;
    } else {
        return (
            <CountdownText>
                {retryingInLabel} {seconds}
            </CountdownText>
        );
    }
};

export const Error: React.FC<ErrorProps> = (props: ErrorProps): JSX.Element => {
    const theme = useTheme() as Theme;

    const [end, setEnd] = useState(Date.now() + 5000);
    const [countdown, setCountdown] = useState(true);

    const onComplete = useCallback(() => {
        setCountdown(false);

        setTimeout(() => {
            setEnd(Date.now() + 5000);
            setCountdown(true);
        }, 1000);

        if (props.onRefresh) {
            props.onRefresh();
        }
    }, [end, countdown]);

    return (
        <CenteredDiv>
            <SadIcon icon={'sad'} size={'50px'} color={theme.textColor} />
            <ErrorText>{props.message}</ErrorText>
            {props.onRefresh && countdown ? (
                <Countdown date={end} renderer={renderer.bind(null, props.retryLabel)} onComplete={onComplete} />
            ) : null}
        </CenteredDiv>
    );
};

Error.defaultProps = {
    message: 'Error',
};

export default Error;
