import * as React from 'react';
import styled from '../../../config/styled';
import Icon from '../../icon';

export interface SearchInputProps extends React.ComponentProps<any> {
    name: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    cancel?: () => void;
    clearInput: () => void;
    placeholder: string;
    value?: string;
    mainColor?: string;
    cancelLabel?: string;
    icon?: string;
    autofocus?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
}

const Container = styled.div`
    align-items: center;
    display: flex;
    padding: ${(props) => props.theme.regularSpacing} ${(props) => props.theme.biggerSpacing};
`;

const InputContainer = styled.div`
    background-color: ${(props) => props.theme.componentColorLight};
    border-radius: ${(props) => props.theme.defaultRadius};
    flex: 1;
    overflow: hidden;
    padding: 0 ${(props) => props.theme.regularSpacing};
    position: relative;

    input {
        font-size: 15px;
        padding: ${(props) => props.theme.regularSpacing} ${(props) => props.theme.biggerSpacing} 0.75rem;
        width: 100%;

        &::placeholder {
            color: ${(props) => props.theme.textColorDark};
        }
    }
`;

const CancelButton = styled.button<SearchInputProps>`
    color: ${(props) => props.theme.textColorDark};
    font-size: 10px;
    font-weight: 700;
    max-width: ${(props) => (props.focused ? '100px' : '0')};
    opacity: ${(props) => (props.focused ? 1 : 0)};
    overflow: hidden;
    padding-left: ${(props) => (props.focused ? '12px' : '0')};
    text-transform: uppercase;
    transition: all 300ms ease;
`;

const ClearButton = styled.button<SearchInputProps>`
    opacity: ${(props) => (props.value ? 1 : 0)};
    position: absolute;
    right: ${(props) => props.theme.regularSpacing};
    top: 18px;
    transition: opacity 300ms ease;
`;

const ClearIcon = styled(Icon)`
    fill: ${(props) => props.theme.textColorDark};
    height: 12px;
`;

const SearchIcon = styled(Icon)`
    height: 18px;
    position: absolute;
    top: ${(props) => props.theme.regularSpacing};
`;

export const SearchInput: React.FunctionComponent<SearchInputProps> = (props: SearchInputProps): JSX.Element => {
    const [focused, setFocus] = React.useState(false);

    const onFocus = () => {
        setFocus(true);
        if (props.onFocus) {
            props.onFocus();
        }
    };

    const onBlur = () => {
        setFocus(false);
        if (props.onBlur) {
            props.onBlur();
        }
    };

    return (
        <Container>
            <InputContainer>
                <SearchIcon icon={props.icon} size={'16px'} color={props.mainColor} />
                <input
                    id={props.name}
                    name={props.name}
                    placeholder={props.placeholder}
                    onFocus={onFocus}
                    onChange={props.onChange}
                    value={props.value}
                    autoFocus={props.autofocus}
                    onBlur={onBlur}
                />
                {props.clearInput ? (
                    <ClearButton value={props.value} onClick={props.clearInput}>
                        <ClearIcon icon={'close'} size={'12px'} />
                    </ClearButton>
                ) : null}
            </InputContainer>
            {props.cancel ? (
                <CancelButton focused={focused} onClick={props.cancel}>
                    {props.cancelLabel}
                </CancelButton>
            ) : null}
        </Container>
    );
};

SearchInput.defaultProps = {
    mainColor: '#079CF0',
    icon: 'search',
};

export default SearchInput;
