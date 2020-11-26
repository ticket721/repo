import styled from 'styled-components';
import { Icon } from '@frontend/flib-react/lib/components';
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import Cleave from 'cleave.js/react';
import { symbolOf } from '@common/global';
import { Currency } from './Currency';
import { useStripeBalance } from '../../../hooks/useStripeBalance';
import { HapticsImpactStyle, useHaptics } from '../../../utils/useHaptics';

interface CurrencySelectorProps {
    currency: Currency;
    setCurrency: (curr: string) => void;
    isOpen: boolean;
    setOpen: (value: boolean) => void;
}

const CurrencyText = styled.span`
    color: white;
    font-size: 22px;
    font-weight: 400;
    margin: 0;
`;

const ChangeIcon = styled(Icon)`
    margin-left: ${(props) => props.theme.smallSpacing};
    margin-right: ${(props) => props.theme.smallSpacing};
`;

const ChangeContainer = styled(motion.div)``;

export const CurrencySelector: React.FC<CurrencySelectorProps> = (props: CurrencySelectorProps) => {
    const haptics = useHaptics();

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onClick={() => {
                haptics.impact({
                    style: HapticsImpactStyle.Light,
                });
                if (props.currency) {
                    props.setOpen(!props.isOpen);
                }
            }}
        >
            <CurrencyText>{props.currency ? props.currency.currency.toUpperCase() : '...'}</CurrencyText>
            {props.currency ? (
                <ChangeContainer
                    variants={{
                        closed: {
                            rotate: 0,
                        },
                        open: {
                            rotate: 180,
                        },
                    }}
                    transition={{
                        type: 'spring',
                    }}
                    initial={'closed'}
                    animate={props.isOpen ? 'open' : 'closed'}
                >
                    <ChangeIcon icon={'chevron'} size={'8px'} />
                </ChangeContainer>
            ) : null}
        </div>
    );
};

const ValueInput = styled(Cleave)`
    text-align: end;
    font-size: 22px;
    font-weight: 400;
    padding: 0;
    padding-right: 2px;
    font-family: 'Roboto Mono', monospace;
    caret-color: #00000000;
    user-select: none;
    pointer-events: none;

    &:focus {
        outline: none;
    }
`;

const CaretDiv = styled.div`
    animation: blink-animation 1s ease-in-out infinite;

    @keyframes blink-animation {
        0% {
            background-color: ${(props) => props.theme.primaryColor.hex};
        }
        50% {
            background-color: #00000000;
        }
        100% {
            background-color: ${(props) => props.theme.primaryColor.hex};
        }
    }
`;

interface CurrencyValueProps {
    currency: Currency;
    amount: string;
    setAmount: (value: string) => void;
}

export const CurrencyValue: React.FC<CurrencyValueProps> = (props: CurrencyValueProps) => {
    const [inputRef, setInputRef] = useState(null);
    const [focused, setFocused] = useState(false);

    const displayed = useMemo(() => {
        if (props.amount === '' || props.amount === '0') {
            return '0.00';
        } else {
            const value = parseInt(props.amount, 10) / 100;
            const decimalsCount = value.toString().split('.')[1]?.length || 0;
            return `${value}${decimalsCount === 0 ? '.' : ''}${'0'.repeat(2 - decimalsCount)}`;
        }
    }, [props.amount]);

    useEffect(() => {
        setTimeout(() => {
            if (inputRef) {
                inputRef.focus();
            }
        }, 500);
    }, [inputRef]);

    if (!props.currency) {
        return (
            <div>
                <CurrencyText>...</CurrencyText>
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onClick={(e) => {
                e.preventDefault();
                if (inputRef) {
                    inputRef.focus();
                }
            }}
        >
            <ValueInput
                autoFocus={true}
                inputMode={'numeric'}
                htmlRef={(ref) => setInputRef(ref)}
                style={{
                    color: props.amount === '' ? '#666666' : 'white',
                    width: '100%',
                }}
                value={displayed}
                options={{
                    prefix: `${symbolOf(props.currency.currency)} `,
                    numeral: true,
                    numeralDecimalMark: '.',
                    delimiter: ',',
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyUp={(e) => {
                    e.preventDefault();
                    if (e.key === 'Backspace') {
                        props.setAmount(props.amount.slice(0, -1));
                    }
                }}
                onKeyDown={(e) => {
                    e.preventDefault();
                    const value = parseInt(e.key, 10);
                    if (value >= 0 && value <= 9) {
                        const newValue = parseInt(props.amount + e.key, 10);
                        if (newValue <= props.currency.amount) {
                            props.setAmount(newValue.toString());
                        } else {
                            props.setAmount(props.currency.amount.toString());
                        }
                    }
                }}
                onChange={(e) => e.preventDefault()}
            />
            <CaretDiv
                style={{
                    width: 1,
                    height: 22,
                    opacity: focused ? 1 : 0,
                }}
            />
        </div>
    );
};

export const PriceSelectionContainer = styled.div`
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-left: ${(props) => props.theme.regularSpacing};
    padding-right: ${(props) => props.theme.regularSpacing};
`;

const DrawerDiv = styled(motion.div)`
    overflow: hidden;
    background-color: ${(props) => props.theme.darkerBg};
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
`;

const CurrencyButton = styled(motion.div)`
    background-color: ${(props) => props.theme.componentColorLight};
    padding: ${(props) => props.theme.smallSpacing};
    margin: ${(props) => props.theme.regularSpacing};
    margin-right: 0;
    border-radius: ${(props) => props.theme.defaultRadius};
`;

interface PriceSelectionDrawerProps {
    isOpen: boolean;
    currency: Currency;
    setCurrency: (currency: Currency) => void;
    setOpen: (value: boolean) => void;
}

export const PriceSelectionDrawer: React.FC<PriceSelectionDrawerProps> = (
    props: PriceSelectionDrawerProps,
): JSX.Element => {
    const stripeBalanceRequestBag = useStripeBalance();
    const haptics = useHaptics();

    if (!stripeBalanceRequestBag.response!.data) {
        return null;
    }

    return (
        <DrawerDiv
            variants={{
                visible: {
                    height: 'auto',
                },
                hidden: {
                    height: 0,
                },
            }}
            initial={'hidden'}
            animate={props.isOpen ? 'visible' : 'hidden'}
        >
            {stripeBalanceRequestBag.response.data.balance.available.map((curr: Currency) => (
                <CurrencyButton
                    onClick={() => {
                        haptics.impact({
                            style: HapticsImpactStyle.Light,
                        });
                        props.setCurrency(curr);
                        props.setOpen(false);
                    }}
                    key={curr.currency}
                >
                    {curr.currency.toUpperCase()} {symbolOf(curr.currency)}
                </CurrencyButton>
            ))}
        </DrawerDiv>
    );
};
