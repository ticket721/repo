import React from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
import { Icon }            from '@frontend/flib-react/lib/components';
import { Theme }                            from '@frontend/flib-react/lib/config/theme';
import './locales';
import { Status }                           from './Scanner';

interface ScannerZoneProps {
    status: Status;
}

export const ScannerZone: React.FC<ScannerZoneProps> = ({ status }: ScannerZoneProps) => {
    const theme = useTheme() as Theme;

    return (
        <ScannerZoneWrapper status={status}>
            <TopContainer>
                <TopLeftCorner/>
                <TopRightCorner/>
            </TopContainer>
            <BottomContainer>
                <BottomLeftCorner/>
                <BottomRightCorner/>
            </BottomContainer>
            <ScanIcon
                icon={
                    status === 'verifying' ?
                        'loader' :
                        status === 'error' ?
                            'close' :
                            status === 'success' ?
                                'check' :
                                'scan'
                }
                className={status === 'verifying' ? 'loading' : null}
                size={'50px'}
                color={
                    status === 'error' ?
                        `rgba(${theme.errorColor.r},${theme.errorColor.g},${theme.errorColor.b},0.9)` :
                        status === 'success' ?
                            `rgba(${theme.successColor.r},${theme.successColor.g},${theme.successColor.b},0.9)` :
                            'rgba(255,255,255,0.9)'}/>
        </ScannerZoneWrapper>
    );
};

const TopContainer = styled.div`
    position: relative;
    top: -2px;
    left: -2px;
    width: calc(100% + 4px);
    display: flex;
    justify-content: space-between;
    height: 25%;
    box-sizing: border-box;
`;

const BottomContainer = styled.div`
    position: relative;
    bottom: -2px;
    left: -2px;
    width: calc(100% + 4px);
    display: flex;
    justify-content: space-between;
    height: 25%;
    box-sizing: border-box;
`;

const ScannerZoneWrapper = styled.div<{ status: Status }>`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: fixed;
    top: calc((-100vh - 100vw + 2 * ${props => props.theme.doubleSpacing}) / 2);
    left: calc((-200vh + 2 * ${props => props.theme.doubleSpacing}) / 2);
    width: calc(100vw - 2 * ${props => props.theme.doubleSpacing});
    height: calc(100vw - 2 * ${props => props.theme.doubleSpacing});
    border: 100vh solid ${props => props.status === 'error' ?
    `rgba(${props.theme.errorColor.r}, ${props.theme.errorColor.g}, ${props.theme.errorColor.b}, 0.3)` :
    props.status === 'success' ?
        `rgba(${props.theme.successColor.r}, ${props.theme.successColor.g}, ${props.theme.successColor.b}, 0.3)` :
        `rgba(0,0,0,0.3)`
};
    border-radius: calc(100vh + ${props => props.theme.regularSpacing});
    z-index: 1;
    box-sizing: content-box;

    & > ${TopContainer} > div, & > ${BottomContainer} > div {
        border-color: ${props => props.status === 'error' ?
    `rgba(${props.theme.errorColor.r}, ${props.theme.errorColor.g}, ${props.theme.errorColor.b}, 0.6)` :
    props.status === 'success' ?
        `rgba(${props.theme.successColor.r}, ${props.theme.successColor.g}, ${props.theme.successColor.b}, 0.6)` :
        props.theme.textColorDark
}
`;

const TopLeftCorner = styled.div`
    width: 25%;
    height: 100;
    border-left: 5px solid ${props => props.theme.textColorDark};
    border-top: 5px solid ${props => props.theme.textColorDark};
    border-radius: ${props => props.theme.regularSpacing} 0 0 0;
`;

const TopRightCorner = styled.div`
    width: 25%;
    height: 100%;
    border-right: 5px solid ${props => props.theme.textColorDark};
    border-top: 5px solid ${props => props.theme.textColorDark};
    border-radius: 0 ${props => props.theme.regularSpacing} 0 0;
`;

const BottomRightCorner = styled.div`
    width: 25%;
    height: 100%;
    border-right: 5px solid ${props => props.theme.textColorDark};
    border-bottom: 5px solid ${props => props.theme.textColorDark};
    border-radius: 0 0 ${props => props.theme.regularSpacing} 0;
`;

const BottomLeftCorner = styled.div`
    width: 25%;
    height: 100%;
    border-left: 5px solid ${props => props.theme.textColorDark};
    border-bottom: 5px solid ${props => props.theme.textColorDark};
    border-radius: 0 0 0 ${props => props.theme.regularSpacing};
`;

const loaderRotation = keyframes`
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
`;

const ScanIcon = styled(Icon)`
    position: absolute;
    top: calc(50% - 25px);
    left: calc(50% - 25px);

    &.loading {
        animation: ${loaderRotation} 1s linear infinite;
    }
`;
