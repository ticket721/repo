import * as React from 'react';
import Select from 'react-select';
import styled from '../../../config/styled';

const customStyles = {
    container: () => ({
        position: 'relative' as 'relative',

        '& > div': {
            paddingTop: '10px',
            paddingRight: '9px',
            paddingBottom: ' 8.5px',
            paddingLeft: ' 12px',
        },
    }),
    option: () => ({
        backgroundColor: 'transparent',
        color: 'rgba(255, 255, 255, 0.6)',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
        paddingBottom: 12,
        paddingTop: 12,
        transition: 'all 300ms ease',

        ':hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            color: 'rgba(255, 255, 255, 0.9)',
        },
    }),
    control: () => ({
        display: 'flex',
        paddingBottom: 24,
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 16,
    }),
    indicatorsContainer: () => ({
        display: 'flex',
        position: 'relative' as 'relative',
        top: '-1px',

        '& > div': {
            padding: 0,
        },
    }),
    indicatorSeparator: () => ({
        border: 'none',
    }),
    input: () => ({
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
    }),
    menu: () => ({
        backgroundColor: '#262331',
        borderRadius: 8,
        marginTop: 8,
        position: 'absolute' as 'absolute',
        width: '100%',
    }),
    menuList: () => ({
        maxHeight: 300,
        overflow: 'auto',
        padding: 0,
    }),
    noOptionsMessage: () => ({
        color: 'rgba(255, 255, 255, 0.6)',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
        paddingBottom: 12,
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 12,
    }),
    placeholder: () => ({
        color: 'rgba(255, 255, 255, 0.38)',
        fontSize: '14px',
        fontWeight: 500,
        position: 'absolute' as 'absolute',
    }),
    valueContainer: () => ({
        alignItems: 'center',
        display: 'flex',
        flex: 1,
        padding: 0,
        flexWrap: 'wrap' as 'wrap',
    }),
    singleValue: () => ({
        fontSize: 14,
        fontWeight: 500,
        marginRight: 8,
        opacity: 0.9,
    }),
};

export interface SelectProps {
    defaultValue?: object;
    error?: string | undefined;
    label?: string;
    disabled?: boolean;
    options: Array<object>;
    placeholder?: string;
    searchable?: boolean;
    multiple?: boolean;
    value?: Array<object>;
    className?: string;
    onChange?: (val: any) => void;
    menu?: boolean;
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

const Error = styled.span`
    top: 110%;
    color: ${(props) => props.theme.errorColor.hex};
    font-size: 13px;
    font-weight: 500;
    left: 10px;
    position: absolute;
`;

const StyledInputContainer = styled.div<Partial<SelectProps>>`
    background-color: ${(props) => props.theme.componentColor};
    border-radius: ${(props) => props.theme.defaultRadius};
    display: flex;
    flex-direction: column;
    padding-top: ${(props) => (props.label ? props.theme.biggerSpacing : 0)};
    transition: background-color 300ms ease;
    [class*='dummyInput'] {
        display: none;
    }
    &:hover {
        background-color: ${(props) => props.theme.componentColorLight};
    }
    &:focus-within {
        background-color: ${(props) => props.theme.componentColorLighter};
        ${StyledLabel} {
            transform: translateX(0px);
            &::before {
                opacity: 1;
            }
        }
    }

    & > div > div {
        padding-left: ${(props) => props.theme.biggerSpacing};
    }

    & > div > div[class$='Menu'] {
        background-color: rgb(34, 32, 41);
        z-index: 1;
    }

    & > div > div > div[class$='ValueContainer'] > div[class$='multiValue'] {
        background-color: #241f33;
        padding: 5px;

        & > div {
            color: ${(props) => props.theme.textColor};
        }
    }
`;

export const SelectInput: React.FunctionComponent<SelectProps> = (props: SelectProps): JSX.Element => {
    return (
        <StyledInputContainer label={props.label} className={props.className}>
            {props.label && <StyledLabel>{props.label}</StyledLabel>}
            <Select
                isMulti={props.multiple}
                isDisabled={props.disabled}
                value={props.value}
                defaultValue={props.defaultValue}
                noOptionsMessage={() => 'No values available'}
                options={props.options}
                placeholder={props.placeholder}
                isSearchable={props.searchable}
                styles={customStyles}
                onChange={props.onChange}
            />
            {props.error && <Error>{props.error}</Error>}
        </StyledInputContainer>
    );
};

export default SelectInput;
