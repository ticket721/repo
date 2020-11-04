import React, { useCallback, useState } from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import Icon from '../icon';
import { Theme } from '../../config/theme';

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
    padding: ${(props) => props.theme.regularSpacing};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;

const SadIcon = styled(Icon)`
    color: ${(props) => props.theme.textColor};
    margin-bottom: ${(props) => props.theme.regularSpacing};
`;

const RefreshText = styled.span`
    font-weight: 300;
    font-size: 12px;
    text-transform: uppercase;
`;

const loaderRotation = keyframes`
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
`;

const LoaderIcon = styled(Icon)`
    animation: ${loaderRotation} 1s ease-in-out infinite;
`;

export const Error: React.FC<ErrorProps> = (props: ErrorProps): JSX.Element => {
    const theme = useTheme() as Theme;
    const [pressed, onPressed] = useState(false);

    const onComplete = useCallback(() => {
        onPressed(true);
        if (props.onRefresh) {
            props.onRefresh();
        }
        const tid = setTimeout(() => {
            onPressed(false);
        }, 5000);

        return () => {
          clearTimeout(tid);
        }
    }, [props]);

    return (
        <CenteredDiv onClick={pressed ? undefined : onComplete}>
            <SadIcon icon={'sad'} size={'50px'} color={theme.textColor} />
            <ErrorText>{props.message}</ErrorText>
            {pressed ? (
                <LoaderIcon icon={'loader'} size={'12px'} color={'rgba(255,255,255,0.9)'} />
            ) : (
                <RefreshText>{props.retryLabel}</RefreshText>
            )}
        </CenteredDiv>
    );
};

Error.defaultProps = {
    message: 'Error',
};

export default Error;
