import React, { useMemo } from 'react';
import styled from '../../../config/styled';
import { fromAtomicValue, getAtomicValue, getDecimalScale, symbolOf } from '@common/global/lib/currency';
import CurrencySelectInput from '../currency-select';
import NumberFormat from 'react-number-format';
import ReactTooltip from 'react-tooltip';

export interface PriceInputProps {
    name: string;
    currName?: string;
    label: string;
    placeholder?: string;
    currency?: string;
    disabledCurr?: boolean;
    disabled?: boolean;
    defaultValue?: number;
    value?: number;
    className?: string;
    currColor?: string;
    error?: string;
    tooltipId?: string;
    tooltipMsgs?: string[];
    onPriceChange: (atomicValue: number) => void;
    onCurrencyChange?: (code: string) => void;
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

const InfoTooltip = styled.div`
    width: 16px;
    height: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    right: 12px;
    top: 8px;
    font-size: 10px;
    font-weight: 600;
    border: 1px solid ${(props) => props.theme.textColorDarker};
    color: ${(props) => props.theme.textColorDarker};
    border-radius: 10px;
    padding: 4px 2px 2px;
    cursor: pointer;
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

const parsePrice = (price: string): number => {
    return parseFloat(price.replace(',', ''));
};

export const PriceInput: React.FunctionComponent<PriceInputProps> = (props: PriceInputProps): JSX.Element => {
    const defaultCurrency: any = 'EUR';

    const curr = useMemo(() => {
        return props.currency || defaultCurrency;
    }, [props.currency]);

    return (
        <StyledInputContainer error={props.error} className={props.className} disabled={props.disabled}>
            <StyledLabel htmlFor={props.name}>{props.label}</StyledLabel>
            {props.tooltipId && props.tooltipMsgs ? (
                <>
                    <InfoTooltip data-tip data-for={props.tooltipId}>
                        i
                    </InfoTooltip>
                    <ReactTooltip id={props.tooltipId} place={'top'} effect={'solid'} multiline={true}>
                        {props.tooltipMsgs.map((msg, idx) => (
                            <div key={idx} style={{ padding: 4 }}>
                                {msg}
                            </div>
                        ))}
                    </ReactTooltip>
                </>
            ) : null}
            <div className={'sub-container'}>
                {props.currency ? (
                    props.onCurrencyChange ? (
                        <CurrencySelectInput
                            name={props.currName || 'default_curr_name'}
                            code={curr}
                            disabled={props.disabledCurr || props.disabled}
                            selectedColor={props.currColor}
                            onChange={(currOpt) => {
                                props.onCurrencyChange ? props.onCurrencyChange(currOpt.value) : console.log();
                            }}
                            onBlur={props.onBlur}
                        />
                    ) : (
                        <span>{symbolOf(props.currency) || props.currency}</span>
                    )
                ) : null}
                <NumberFormat
                    name={props.name}
                    defaultValue={props.defaultValue && fromAtomicValue(curr, props.defaultValue)}
                    value={props.value && fromAtomicValue(curr, props.value)}
                    placeholder={props.placeholder}
                    thousandSeparator={true}
                    decimalScale={getDecimalScale(curr)}
                    fixedDecimalScale={true}
                    allowNegative={false}
                    allowedDecimalSeparators={[',', '.']}
                    disabled={props.disabled}
                    onChange={(e) => props.onPriceChange(Math.round(getAtomicValue(curr, parsePrice(e.target.value))))}
                    onBlur={props.onBlur}
                />
            </div>
            {props.error && <Error>{props.error}</Error>}
        </StyledInputContainer>
    );
};

export default PriceInput;
