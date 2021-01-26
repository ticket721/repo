import * as React from 'react';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import styled from '../../../config/styled';

const customStyles = {
    container: () => ({
        position: 'relative' as 'relative',
    }),
    option: () => ({
        backgroundColor: 'transparent',
        color: 'rgba(255, 255, 255, 0.6)',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
        padding: '20px 1.5rem',
        transition: 'all 300ms ease',
        display: 'flex',
        alignItems: 'center',

        ':hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            color: 'rgba(255, 255, 255, 0.9)',
        },
    }),
    control: () => ({
        display: 'flex',
    }),
    indicatorSeparator: () => ({
        border: 'none',
    }),
    input: () => ({
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
    }),
    menu: () => ({
        zIndex: 9999,
        backgroundColor: '#262331',
        borderRadius: 8,
        marginTop: 8,
        position: 'absolute' as 'absolute',
        width: '100%',
    }),
    menuList: () => ({
        maxHeight: 200,
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
        padding: '1rem 1.5rem',
        alignItems: 'center',
        display: 'flex',
        flex: 1,
        flexWrap: 'wrap' as 'wrap',
    }),
    singleValue: () => ({
        fontSize: 14,
        fontWeight: 500,
        opacity: 0.9,
    }),
};

export interface SelectOption {
    label: string;
    value: string;
    [key: string]: any;
}

export interface GroupedSelectOption {
    label: string;
    options: SelectOption[];
}

export interface SelectProps {
    name?: string;
    defaultValue?: SelectOption;
    error?: string;
    label?: string;
    disabled?: boolean;
    options: Array<SelectOption | GroupedSelectOption>;
    allOpt?: SelectOption;
    placeholder?: string;
    searchable?: boolean;
    multiple?: boolean;
    value?: Array<SelectOption>;
    className?: string;
    onChange: (options: Array<SelectOption>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    grouped?: boolean;
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
    top: 104%;
    color: ${(props) => props.theme.errorColor.hex};
    font-size: 13px;
    font-weight: 500;
    position: absolute;
    margin-left: ${(props) => props.theme.regularSpacing};
`;

const StyledInputContainer = styled.div<Partial<SelectProps>>`
    background-color: ${(props) => props.theme.componentColor};
    border-radius: ${(props) => props.theme.defaultRadius};
    display: flex;
    position: relative;
    flex-direction: column;
    padding-top: ${(props) => (props.label ? props.theme.biggerSpacing : 0)};
    transition: background-color 300ms ease;
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

    & > div > div[class$='Menu'] {
        background-color: rgb(34, 32, 41);
    }

    & > div > div > div[class$='ValueContainer'] > div[class$='multiValue'] {
        background-color: #241f33;
        padding: 5px;

        & > div {
            color: ${(props) => props.theme.textColor};
        }
    }
`;

const GroupLabel = styled.div`
    text-transform: uppercase;

    &:first-child {
        margin-top: ${(props) => props.theme.smallSpacing};
    }
`;

const formatGroupLabel = (data: any) => <GroupLabel>{data.label}</GroupLabel>;

export const SelectInput: React.FunctionComponent<SelectProps> = (props: SelectProps): JSX.Element => {
    const [selected, setSelected] = useState<SelectOption[]>();

    useEffect(() => {
        setSelected(props.value);
    }, [props.value]);

    return (
        <StyledInputContainer label={props.label} className={props.className}>
            {props.label && <StyledLabel>{props.label}</StyledLabel>}
            <Select
                name={props.name}
                isMulti={props.multiple}
                isSearchable={props.searchable}
                value={props.multiple ? selected : selected ? selected[0] : null}
                defaultValue={props.defaultValue}
                noOptionsMessage={() => 'No values available'}
                options={props.allOpt ? [props.allOpt, ...props.options] : props.options}
                formatGroupLabel={props.grouped ? formatGroupLabel : undefined}
                placeholder={props.placeholder}
                styles={customStyles}
                onChange={(options: SelectOption | SelectOption[]) => {
                    setSelected(options as any);
                    if (!options) {
                        props.onChange([]);
                        return;
                    }

                    if (props.multiple) {
                        if (
                            options &&
                            !Object.keys(props.options[0]).includes('options') &&
                            (options as SelectOption[]).findIndex((option) => option.value === props.allOpt?.value) !==
                                -1
                        ) {
                            props.onChange(props.options as SelectOption[]);
                        } else {
                            props.onChange(options as SelectOption[]);
                        }
                    } else {
                        props.onChange([options as SelectOption]);
                    }
                }}
                onBlur={props.onBlur}
            />
            {props.error && <Error>{props.error}</Error>}
        </StyledInputContainer>
    );
};

export default SelectInput;
