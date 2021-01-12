import React, { useState } from 'react';
import styled from '../../../config/styled';
import { fromAtomicValue, getAtomicValue, getDecimalScale } from '@common/global/lib/currency';
import CurrencySelectInput from '../currency-select';
import NumberFormat from 'react-number-format';

export interface PriceInputProps {
    name: string;
    currName: string;
    label: string;
    placeholder?: string;
    defaultCurrency?: string;
    disabled?: boolean;
    defaultValue?: number;
    value?: number;
    className?: string;
    currColor?: string;
    error?: string;
    onPriceChange: (atomicValue: number) => void;
    onCurrencyChange: (code: string) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const Error = styled.span`
    top: 104%;
    color: ${(props) => props.theme.errorColor.hex};
    font-size: 13px;
    font-weight: 500;
    left: 10px;
    position: absolute;
`;

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

const StyledInputContainer = styled.div<Partial<PriceInputProps>>`
    position: relative;
    background-color: ${(props) => props.theme.componentColor};
    border-radius: ${(props) => props.theme.defaultRadius};
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-top: ${(props) => props.theme.biggerSpacing};
    transition: background-color 300ms ease;

    ${(props) =>
        props.disabled
            ? `
        opacity: 0.3;
        filter: grayscale(1);
    `
            : null};

    ${(props) =>
        props.error &&
        `
    ${StyledLabel}{
      color: ${props.theme.errorColor.hex};
      transform: translateX(0px);

      &::before {
        background-color: ${props.theme.errorColor.hex};
        opacity: 1;
      }
    }
  `}

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

    .sub-container {
        display: flex;
        align-items: center;
        padding-left: 1.5rem;
    }
`;

export const PriceInput: React.FunctionComponent<PriceInputProps> = (props: PriceInputProps): JSX.Element => {
    const defaultCurrency: any = props.defaultCurrency || 'USD';

    const [curr, setCurr] = useState<string>(defaultCurrency);

    return (
        <StyledInputContainer error={props.error} className={props.className} disabled={props.disabled}>
            <StyledLabel htmlFor={props.name}>{props.label}</StyledLabel>
            <div className={'sub-container'}>
                <CurrencySelectInput
                    name={props.currName}
                    defaultCode={defaultCurrency}
                    disabled={props.disabled}
                    selectedColor={props.currColor}
                    onChange={(currOpt) => {
                        setCurr(currOpt.value);
                        props.onCurrencyChange(currOpt.value);
                    }}
                    onBlur={props.onBlur}
                />
                <NumberFormat
                    defaultValue={props.defaultValue && fromAtomicValue(curr, props.defaultValue)}
                    value={props.value && fromAtomicValue(curr, props.value)}
                    placeholder={props.placeholder}
                    thousandSeparator={true}
                    decimalScale={getDecimalScale(curr)}
                    fixedDecimalScale={true}
                    allowNegative={false}
                    allowedDecimalSeparators={[',', '.']}
                    disabled={props.disabled}
                    onValueChange={(value: any) =>
                        props.onPriceChange(Math.round(getAtomicValue(curr, value.floatValue)))
                    }
                />
            </div>
            {props.error && <Error>{props.error}</Error>}
        </StyledInputContainer>
    );
};

export default PriceInput;
