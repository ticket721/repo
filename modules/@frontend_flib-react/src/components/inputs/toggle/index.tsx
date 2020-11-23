import * as React from 'react';
import { Icon } from '../../icon';
import styled from '../../../config/styled';

interface CustomToggle {
    on: {
        char?: string;
        icon?: string;
        size: string;
    };
    off: {
        char?: string;
        icon?: string;
        size: string;
    };
}

export interface ToggleProps extends React.ComponentProps<any> {
    label: string;
    name: string;
    description?: string;
    onChange: (checked: boolean, id: string, e: React.ChangeEvent<HTMLElement>) => void;
    gradient?: string[];
    checked?: boolean;
    custom?: CustomToggle;
    disabled?: boolean;
}

const StyledLabel = styled.label`
    color: ${(props) => props.theme.textColor};
    cursor: pointer;
    display: inline-flex;
    flex: 1;
    flex-wrap: wrap;
    font-size: 14px;
    font-weight: 700;
    line-height: 150%;
    padding: 0 64px 0 0;
    position: relative;
    text-transform: none;

    p {
        color: ${(props) => props.theme.textColorDark};
        font-size: 14px;
        font-weight: 500;
        padding-top: 0.5rem;
        width: 100%;
    }
`;

const ToggleSwitch = styled.div<ToggleProps>`
    align-items: center;
    background: ${(props) =>
        props.custom
            ? `linear-gradient(260deg, ${props.gradient?.join(', ')})`
            : props.checked
            ? `linear-gradient(260deg, ${props.gradient?.join(', ')})`
            : props.theme.componentColorLighter};
    border-radius: ${(props) => props.theme.defaultRadius};
    display: inline-flex;
    height: 24px;
    justify-content: center;
    left: 0;
    position: absolute;
    transform: translateX(${(props) => (props.checked ? 100 : 0)}%);
    transition: transform 300ms ease, opacity 300ms ease;
    top: 0;
    width: 24px;

    & > span {
        opacity: ${(props) => (props.custom || props.checked ? 1 : 0)};
    }

    & > .icon-char {
        padding-top: 3px;
        font-weight: 500;
        font-size: 13px;
    }
`;

const ToggleSwitchContainer = styled.div`
    background-color: ${(props) => props.theme.componentColorLight};
    border-radius: ${(props) => props.theme.defaultRadius};
    display: block;
    height: 24px;
    padding-left: ${(props) => props.theme.doubleSpacing};
    position: absolute;
    right: 0;
    top: 0;
    width: 44px;
`;

const StyledCheckboxContainer = styled.div`
    color: ${(props) => props.theme.textColorDark};
    display: flex;
    margin-bottom: ${(props) => props.theme.biggerSpacing};
    width: 100%;

    &:last-of-type {
        margin-bottom: 0;
    }
`;

export const Toggle: React.FunctionComponent<ToggleProps & { className?: string }> = (
    props: ToggleProps,
): JSX.Element => {
    return (
        <StyledCheckboxContainer className={props.className}>
            <StyledLabel htmlFor={props.name}>
                {props.label}
                <input
                    checked={props.checked}
                    type={'checkbox'}
                    name={props.name}
                    id={props.name}
                    disabled={props.disabled}
                    onChange={(e) => {
                        props.onChange(e.target.checked, props.name, e);
                    }}
                />
                <ToggleSwitchContainer>
                    <ToggleSwitch gradient={props.gradient} custom={props.custom} checked={props.checked}>
                        {props.custom ? (
                            props.custom.on.icon && props.custom.off.icon ? (
                                <Icon
                                    size={props.checked ? props.custom.on.size : props.custom.off.size}
                                    color={'white'}
                                    icon={props.checked ? props.custom.on.icon : props.custom.off.icon}
                                />
                            ) : (
                                <span className={'icon-char'}>
                                    {props.checked ? props.custom?.on.char : props.custom?.off.char}
                                </span>
                            )
                        ) : (
                            <Icon size={'12px'} color={'white'} icon={'check'} />
                        )}
                    </ToggleSwitch>
                </ToggleSwitchContainer>
                {props.description && <p>{props.description}</p>}
            </StyledLabel>
        </StyledCheckboxContainer>
    );
};

Toggle.defaultProps = {
    onChange: () => {
        console.log('onChange');
    },
    gradient: ['#079CF0', '#2143AB'],
};

export default Toggle;
