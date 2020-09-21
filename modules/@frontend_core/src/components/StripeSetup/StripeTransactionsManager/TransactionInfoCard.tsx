import React from 'react';
import { symbolOf } from '@common/global';
import { formatShort } from '../../../utils/date';
import styled from 'styled-components';
import { TxTypeColors, TxType } from './TxType';

export interface TransactionInfo {
    id: string;
    object: 'balance_transaction';
    amount: number;
    available_on: number;
    created: number;
    currency: string;
    description: string | null;
    exchange_rate: number | null;
    fee: number;
    fee_details: any[];
    net: number;
    reporting_category: string;
    source: string | null;
    status: string;
    type: TxType;
}

export const MarginContainer = styled.div`
    padding-left: ${(props) => props.theme.regularSpacing};
    padding-right: ${(props) => props.theme.regularSpacing};
    margin-top: ${(props) => props.theme.regularSpacing};
    margin-bottom: ${(props) => props.theme.regularSpacing};
    box-sizing: border-box;
    max-width: 500px;
    width: 100%;
`;

export interface ContainerProps {
    color: string;
}

export const Container = styled.div<ContainerProps>`
    width: 100%;
    background-color: ${(props) => {
        switch (props.color) {
            case 'error': {
                return '#332222';
            }
            case 'loading': {
                return '#110e1f';
            }
            default: {
                return '#24232c';
            }
        }
    }};
    // props.color === 'error' ? '#332222' : '#24232c'
    padding: ${(props) => props.theme.regularSpacing};
    border-radius: ${(props) => props.theme.defaultRadius};
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    cursor: pointer;
    z-index: 10;
`;

export const Description = styled.span`
    margin: 0;
    text-transform: uppercase;
    font-size: 16px;
    font-weight: 500;
`;

export interface PriceProps {
    amount: number;
}

export const Price = styled.span<PriceProps>`
    margin: 0;
    color: ${(props) => props.theme.textColorDark};
    font-size: 16px;
`;

export const TitleAndPriceContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

export const DateContainer = styled.div`
    margin-top: ${(props) => props.theme.smallSpacing};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

export const DateText = styled.span`
    margin: 0;
    color: ${(props) => props.theme.textColorDark};
    font-size: 14px;
`;

export interface StatusTextProps {
    color: string;
}

export const StatusText = styled.span<StatusTextProps>`
    text-transform: capitalize;
    margin: 0;
    color: ${(props) => (props.color === 'error' ? props.theme.errorColor.hex : props.theme.textColor)};
    font-size: 14px;
`;

export interface TransactionInfoCardProps {
    transaction: TransactionInfo;
    forwardedRef?: any;
}

export const TransactionInfoCard: React.FC<TransactionInfoCardProps> = (
    props: TransactionInfoCardProps,
): JSX.Element => {
    return (
        <MarginContainer>
            <Container color={TxTypeColors[props.transaction.type]} ref={props.forwardedRef}>
                <TitleAndPriceContainer>
                    <Description>{props.transaction.description || props.transaction.type}</Description>
                    <Price amount={props.transaction.amount}>
                        {props.transaction.amount < 0 ? '-' : ''} {symbolOf(props.transaction.currency)}{' '}
                        {Math.abs(props.transaction.amount / 100).toLocaleString()}
                    </Price>
                </TitleAndPriceContainer>
                <DateContainer>
                    <DateText>{formatShort(new Date(props.transaction.created * 1000))}</DateText>
                    <StatusText color={TxTypeColors[props.transaction.type]}>
                        {props.transaction.type.replace('_', ' ')}
                    </StatusText>
                </DateContainer>
            </Container>
        </MarginContainer>
    );
};
