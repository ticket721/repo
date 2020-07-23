import * as React from 'react';
import { SketchPicker, ColorResult } from 'react-color';
import styled from '../../config/styled';
import { ChangeEvent, useEffect, useRef } from 'react';
import { useClickOutside } from '../../utils/useClickOutside';

export interface ColorPickerProps extends React.ComponentProps<any> {
    label: string;
    presetColors: any[];
    presetLabel?: string;
    color: string;
    handleChange: (color: ColorResult) => void;
    onFocus?: (
        eventOrPath: string | ChangeEvent<any>,
    ) => void | ((eventOrTextValue: string | ChangeEvent<any>) => void);
    onBlur?: (value: any) => void;
}

const StyledLabel = styled.label`
    display: inline-flex;
    transform: translateX(-12px);
    transition: all 300ms ease;

    &::before {
        background-color: ${(props) => props.theme.primaryColor.hex};
        border-radius: 100%;
        content: '';
        display: inline-block;
        height: 4px;
        margin-right: 8px;
        opacity: 0;
        position: relative;
        top: 2px;
        transition: opacity 300ms ease;
        width: 4px;
    }
`;

const ColorSwatch = styled.div`
    background-color: ${(props) => props.theme.primaryColor.hex};
    border-radius: ${(props) => props.theme.defaultRadius};
    content: '';
    display: inline-block;
    height: 40px;
    margin-left: ${(props) => props.theme.biggerSpacing};
    transition: background-color 300ms ease;
    width: 40px;
`;

const StyledContainer = styled.div`
    background-color: ${(props) => props.theme.componentColor};
    border-radius: ${(props) => props.theme.defaultRadius};
    cursor: pointer;
    display: flex;
    flex-direction: column;
    padding: ${(props) => props.theme.biggerSpacing} 0;
    transition: background-color 300ms ease;

    .row {
        margin-top: ${(props) => props.theme.regularSpacing};
    }

    &:hover {
        background-color: ${(props) => props.theme.componentColorLight};
    }

    &.active {
        background-color: ${(props) => props.theme.componentColorLighter};

        ${StyledLabel} {
            transform: translateX(0px);

            &::before {
                opacity: 1;
            }
        }
    }
`;

const PickerContainer = styled.div`
    position: relative;

    label {
        position: absolute;
        z-index: 2;
        top: 35px;
    }

    .sketch-picker {
        position: absolute;
        z-index: 1;
        background-color: rgb(34, 32, 41) !important;
        display: flex;
        flex-direction: column;
        margin-top: ${(props) => props.theme.regularSpacing};
        padding: ${(props) => props.theme.biggerSpacing} !important;

        & > div {
            order: 1;

            &:first-child {
                margin-bottom: ${(props) => props.theme.regularSpacing};
            }

            &:last-child {
                border: none !important;
                order: 0;
                margin: 24px 0 12px !important;
                padding: 0 !important;

                div {
                    height: 24px !important;
                    margin: 0 4px 4px 0 !important;
                    width: 24px !important;
                }
            }
        }

        input {
            background-color: ${(props) => props.theme.componentColorLight};
            border-radius: 4px;
            box-shadow: none !important;
            color: ${(props) => props.theme.textColorDark};
            margin-top: 12px;
            padding-top: 9px !important;
            text-align: center;

            & + span {
                color: ${(props) => props.theme.textColorDarker} !important;
                font-weight: 500;
                margin: 12px 0 0;
                padding: 0 !important;
                text-transform: uppercase !important;
            }
        }
    }
`;

const ColorLabel = styled.span`
    color: ${(props) => props.theme.textColorDark};
    display: inline-block;
    font-size: 13px;
    font-weight: 500;
    margin-left: ${(props) => props.theme.regularSpacing};
`;

export const ColorPicker: React.FunctionComponent<ColorPickerProps> = (props: ColorPickerProps): JSX.Element => {
    const [showPicker, setShowPicker] = React.useState(false);
    const pickerRef = useRef(null);
    const clickOutside = useClickOutside(pickerRef);

    useEffect(() => {
        if (clickOutside) {
            setShowPicker(false);
        }
    }, [clickOutside]);
    return (
        <div ref={pickerRef}>
            <StyledContainer
                onClick={() => {
                    if (showPicker && props.onBlur) {
                        props.onBlur('click');
                    } else {
                        if (props.onFocus) {
                            props.onFocus('');
                        }
                    }

                    setShowPicker(!showPicker);
                }}
                className={showPicker ? 'active' : ''}
            >
                <StyledLabel>{props.label}</StyledLabel>
                <div className={'row aic'}>
                    <ColorSwatch style={{ backgroundColor: `${props.color}` }} />
                    <ColorLabel>{props.color}</ColorLabel>
                </div>
            </StyledContainer>
            {showPicker && (
                <PickerContainer>
                    {props.presetColors.length > 0 && <label>{props.presetLabel}</label>}
                    <SketchPicker
                        color={props.color}
                        disableAlpha={true}
                        onChange={props.handleChange}
                        presetColors={props.presetColors}
                    />
                </PickerContainer>
            )}
        </div>
    );
};

ColorPicker.defaultProps = {
    showPicker: true,
};

export default ColorPicker;
