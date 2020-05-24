import * as React from 'react';

import styled                          from '../../../config/styled';
import { useEffect, useState } from 'react';
import { Icon }                        from '../../icon';
import { TextInput, InputProps } from '../text';

export interface PasswordProps extends InputProps {
    score?: number;
}

const PasswordInputContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
`;

const ShowHide = styled.div`
    position: absolute;
    right: 30px;
`;

export const PasswordInput: React.FunctionComponent<PasswordProps & {className?: string}> = (props: PasswordProps): JSX.Element => {
    const [ passwordState, setPasswordState ] = useState('password');
    const [ showPassword, setShowPassword ] = useState(false);

    useEffect(() => {
        setPasswordState(showPassword ? 'text' : 'password');
    }, [ showPassword ]);

    return <PasswordInputContainer>
        <TextInput
        error={props.error}
        label={props.label}
        name={props.name}
        onChange={props.onChange}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        placeholder={props.placeholder}
        value={props.value}
        className={props.className}
        type={passwordState}
        />
        <Score score={props.score || 0}>
            <Gauge/>
        </Score>
        <ShowHide onClick={() => {
            setShowPassword(!showPassword);
            document.getElementById(props.name)?.focus();
        }}>
            <Icon
            icon='show'
            color={showPassword ? '#FFF' : '#666'}
            size='20px'/>
        </ShowHide>
    </PasswordInputContainer>
};

const Score = styled.div<{ score: number }>`
    height: 4px;
    width: calc(25% * ${(props) => props.score});
    bottom: 0;
    position: absolute;
    border-radius: 0 0 0 4px;
    overflow: hidden;
    transition: width 0.5s;
`;

const Gauge = styled.div`
    background: linear-gradient(260deg, ${(props) => props.theme.primaryColor}, ${(props) => props.theme.primaryColorGradientEnd});
    height: 100%;
    width: 100%;
`;

export default TextInput;
