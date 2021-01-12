import * as React from 'react';
import Select, { components } from 'react-select';
import styled from '../../../config/styled';
import { currencies, symbolOf } from '@common/global/lib/currency';
import { SelectOption } from '../select';

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
        width: 370,
        marginTop: 8,
        position: 'absolute' as 'absolute',
    }),
    menuList: () => ({
        maxHeight: 200,
        overflow: 'auto',
        padding: 0,
    }),
    valueContainer: () => ({
        padding: '10px',
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

export interface CurrencySelectProps {
    name: string;
    defaultCode?: string;
    disabled?: boolean;
    value?: Array<SelectOption>;
    className?: string;
    selectedColor?: string;
    onChange: (options: SelectOption) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const StyledInputContainer = styled.div<Partial<CurrencySelectProps>>`
    border-radius: ${(props) => props.theme.defaultRadius};
    display: flex;
    flex-direction: column;
    transition: background-color 300ms ease;
    &:hover {
        background-color: ${(props) => props.theme.componentColorLight};
    }
    &:focus-within {
        background-color: ${(props) => props.theme.componentColorLighter};
    }

    & > div > div[class$='Menu'] {
        background-color: rgb(34, 32, 41);
    }

    & div[class$='SingleValue'] {
        color: ${(props) => props.selectedColor || props.theme.textColor};
    }
`;

const currenciesSelectOptions = currencies.map((curr: { code: string; description: string }) => ({
    label: `${curr.description} (${symbolOf(curr.code)})`,
    shortLabel: symbolOf(curr.code) || curr.code,
    value: curr.code.toLowerCase(),
}));

const SingleValue = (props: any) => <components.SingleValue {...props}>{props.data.shortLabel}</components.SingleValue>;

export const CurrencySelectInput: React.FunctionComponent<CurrencySelectProps> = (
    props: CurrencySelectProps,
): JSX.Element => {
    const defaultCurrency: any = currencies.find(
        (curr: { code: string; description: string }) => (curr.code = props.defaultCode || 'USD'),
    );

    return (
        <StyledInputContainer className={props.className} selectedColor={props.selectedColor}>
            <Select
                name={props.name}
                components={{ SingleValue }}
                defaultValue={{
                    label: `${defaultCurrency.description} (${symbolOf(defaultCurrency.code)})`,
                    shortLabel: symbolOf(defaultCurrency.code) || defaultCurrency.code,
                    value: defaultCurrency.code.toLowerCase(),
                }}
                noOptionsMessage={() => 'No values available'}
                options={currenciesSelectOptions}
                styles={customStyles}
                onChange={props.onChange}
                onBlur={props.onBlur}
                isDisabled={props.disabled}
            />
        </StyledInputContainer>
    );
};

export default CurrencySelectInput;
