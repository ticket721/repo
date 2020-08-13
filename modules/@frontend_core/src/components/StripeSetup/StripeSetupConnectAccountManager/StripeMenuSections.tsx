import styled, { keyframes } from 'styled-components';
import { motion, MotionProps, useTransform, useSpring } from 'framer-motion';
import React, { PropsWithChildren, useState } from 'react';
import { Icon } from '@frontend/flib-react/lib/components';
// tslint:disable-next-line
const getSymbolFromCurrency = require('currency-symbol-map');

export const SectionHeader = styled.div`
    background-color: ${(props) => props.theme.darkBg};
    height: 50px;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    & > span {
        font-size: 18px;
        font-weight: 500;
        margin-left: ${(props) => props.theme.regularSpacing};
    }
`;

export interface SectionElementContainerProps {
    clickable?: boolean;
}

export const SectionElementContainer = styled.div<SectionElementContainerProps>`
    max-width: 500px;
    background-color: #24232c;
    padding: ${(props) => props.theme.regularSpacing};
    margin: ${(props) => props.theme.regularSpacing};
    border-radius: ${(props) => props.theme.defaultRadius};
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
`;

const DraggableSectionElementContainer = styled(motion.div) <SectionElementContainerProps & MotionProps>`
    max-width: 500px;
    background-color: #24232c;
    padding: ${(props) => props.theme.regularSpacing};
    margin: ${(props) => props.theme.regularSpacing};
    border-radius: ${(props) => props.theme.defaultRadius};
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
    position: relative;
    z-index: 10;
`;

interface DefaultButtonProps {
    disabled: boolean;
    transitionable: boolean;
}

const DefaultButton = styled(motion.div) <DefaultButtonProps & MotionProps>`
    position: absolute;
    right: 66px;
    top: 0;
    width: 50px;
    height: 100%;
    background-color: ${(props) =>
        props.disabled ? props.theme.componentColor : props.theme.primaryColorGradientEnd.hex};
    margin: 0 ${(props) => props.theme.regularSpacing};
    border-radius: ${(props) => props.theme.defaultRadius};
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    transition: opacity 300ms ease-in-out, background-color 300ms ease-in-out;

    & p {
        font-size: 12px;
        top: 4px;
        font-weight: 400;
    }

    & span {
        font-size: 28px;
        font-weight: 400;
        margin-top: 8px;
    }
`;

interface CloseButtonProps {
    disabled: boolean;
    transitionable: boolean;
}

const CloseButton = styled(motion.div) <CloseButtonProps & MotionProps>`
    position: absolute;
    right: 0;
    top: 0;
    width: 50px;
    height: 100%;
    background-color: ${(props) => (props.disabled ? props.theme.componentColor : props.theme.errorColor.hex)};
    margin: 0 ${(props) => props.theme.regularSpacing};
    border-radius: ${(props) => props.theme.defaultRadius};
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    ${(props) =>
        props.transitionable ? 'transition: opacity 300ms ease-in-out, background-color 300ms ease-in-out;' : ''}
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

export interface DragToActionSelectionElementContainerProps {
    onDelete: () => void;
    onDefault: () => void;
    loadingDelete: boolean;
    loadingDefault: boolean;
    default: boolean;
    currency: string;
}

export const DragToActionSelectionElementContainer: React.FC<PropsWithChildren<
    DragToActionSelectionElementContainerProps
>> = (props: PropsWithChildren<DragToActionSelectionElementContainerProps>): JSX.Element => {
    const x = useSpring(0, { stiffness: 1000, damping: 1000, mass: 1 });
    const [transitionable, setTransitionable] = useState(true);
    const [startDragPos, setStartDragPos] = useState(0);

    const setStartPos = () => {
        setStartDragPos(x.get());
    }

    const toggleOnRelease = () => {
        if (startDragPos > -66) {
            x.set(-132);
        } else {
            x.set(0);
        }
    }

    const toggle = () => {
        if (transitionable) {
            if (x.get() > -66) {
                x.set(-132);
            } else {
                x.set(0);
            }
        }
    }

    const removeOpacityInput = [-50, -20];
    const removeOpacityOutput = [props.default ? 0.5 : 1, 0];
    const removeOpacity = useTransform(x, removeOpacityInput, removeOpacityOutput);
    const removeScaleInput = [-50, 0];
    const removeScaleOutput = [1, 0.2];
    const removeScale = useTransform(x, removeScaleInput, removeScaleOutput);

    const defaultOpacityInput = [-116, -86];
    const defaultOpacityOutput = [1, 0];
    const defaultOpacity = useTransform(x, defaultOpacityInput, defaultOpacityOutput);
    const defaultScaleInput = [-116, 0];
    const defaultScaleOutput = [1, 0.2];
    const defaultScale = useTransform(x, defaultScaleInput, defaultScaleOutput);

    return (
        <div style={{ position: 'relative' }}>
            <DefaultButton
                transitionable={transitionable}
                disabled={!props.default}
                onClick={props.default ? undefined : props.onDefault}
                style={{
                    scale: defaultScale,
                    opacity: defaultOpacity,
                }}
            >
                {props.loadingDefault ? (
                    <LoaderIcon icon={'loader'} size={'20px'} color={'white)'} />
                ) : (
                        <span>{getSymbolFromCurrency(props.currency)}</span>
                    )}
                {props.default ? (
                    <p style={{ position: 'absolute', textAlign: 'center' }}>default</p>
                ) : (
                        <p style={{ position: 'absolute' }}>
                            make
                            <br />
                        default
                        </p>
                    )}
            </DefaultButton>
            <CloseButton
                transitionable={transitionable}
                disabled={props.default}
                onClick={props.default ? undefined : props.onDelete}
                style={{
                    scale: removeScale,
                    opacity: removeOpacity,
                }}
            >
                {props.loadingDelete ? (
                    <LoaderIcon icon={'loader'} size={'20px'} color={'white)'} />
                ) : (
                        <Icon icon={'close'} color={'white'} size={'20px'} />
                    )}
            </CloseButton>
            <DraggableSectionElementContainer
                clickable={true}
                onClick={toggle}
                onDragEnd={() => {
                    toggleOnRelease();
                    setTimeout(() => {
                        setTransitionable(true);
                    }, 100);
                }}
                onDragStart={() => {
                setStartPos();
                setTransitionable(false);
            }}
                style={{
                x,
            }}
                drag={'x'}
                dragElastic={0.1}
                dragConstraints={{
                left: -132,
                right: 0,
            }}
            >
            {props.children}
            </DraggableSectionElementContainer>
        </div >
    );
};

export const FieldTitle = styled.h4`
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    opacity: 0.3;
    margin-bottom: 4px;
`;

export const FieldContainer = styled.div``;

export const FieldsContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;
