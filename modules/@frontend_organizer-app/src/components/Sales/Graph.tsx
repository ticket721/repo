import React, { useMemo }   from 'react';
import styled, { useTheme } from 'styled-components';
import { Transaction }      from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSalesResponse.dto';
import { Theme }            from '@frontend/flib-react/lib/config/theme';
import { fillTheGaps }      from './fillTheGaps';
import { aggregate }        from './aggregate';
import { trim }             from './trim';
import { MINUTE}            from './time';
import { add }                     from './add';
import { fromAtomicValue } from '@common/global';
// tslint:disable-next-line:no-var-requires
const { Chart } = require('react-charts');


const GraphContainer = styled.div`
    background-color: ${props => props.theme.darkerBg};
    border-radius: ${props => props.theme.defaultRadius};
    width: 90%;
    height: 50vh;
    padding: ${props => props.theme.regularSpacing};
`

interface GraphProps {
    transactions: Transaction[];
    aggregation: string;
    min: number;
    max: number;
    dataMode: string;
    custom: boolean;
    setCustom: (limits: {customMin: number; customMax: number;}) => void;
}


const generateData = (transactions: Transaction[], aggregationMode: string, end: Date, dataMode: string, start?: Date) => {
    switch (dataMode) {
        case 'revenue': return [
            {
                label: 'Confirmed Transactions Revenue',
                data: fillTheGaps(
                    aggregationMode,
                    aggregate(
                        aggregationMode, transactions.filter((tx: Transaction) => tx.status === 'confirmed')
                    ),
                    end,
                    'confirmed',
                    start
                )
                    .map((tx: Transaction) => [
                            new Date(tx.date),
                            tx.price
                        ]
                    ),
                secondaryAxisID: 'Revenue'
            },
            {
                label: 'Pending Transactions Revenue',
                data: aggregate(
                    aggregationMode, transactions
                        .filter((tx: Transaction) => tx.status === 'waiting' && new Date(tx.date).getTime() + 15 * MINUTE > Date.now())
                )
                    .map((tx: Transaction) => [
                        new Date(tx.date),
                        tx.price
                    ]),
                secondaryAxisID: 'Revenue'
            },
        ]
        case 'quantity': return [
            {
                label: 'Confirmed Transactions Quantity',
                data: fillTheGaps(
                    aggregationMode,
                    aggregate(
                        aggregationMode, transactions.filter((tx: Transaction) => tx.status === 'confirmed')
                    ),
                    end,
                    'confirmed',
                    start
                )
                    .map((tx: Transaction) => [
                        new Date(tx.date),
                        tx.quantity
                    ]),
                secondaryAxisID: 'Quantity'
            },
            {
                label: 'Pending Transactions Quantity',
                data: aggregate(
                    aggregationMode, transactions
                        .filter((tx: Transaction) => tx.status === 'waiting' && new Date(tx.date).getTime() + 15 * MINUTE > Date.now())
                )
                    .map((tx: Transaction) => [
                        new Date(tx.date),
                        tx.quantity
                    ]),
                secondaryAxisID: 'Quantity'
            }
        ]
    }
}

export default ({transactions, aggregation, min, max, dataMode, custom, setCustom}: GraphProps) => {

    const theme = useTheme() as Theme;

    const currency = useMemo(() => {
        return (transactions.filter((tx) => tx.currency !== null)[0] || {}).currency || null;
    }, [transactions]);

    const defs = useMemo(() => (
        <defs>
            <linearGradient id='0' x1='0' x2='0' y1='1' y2='0'>
                <stop offset='0%' stopColor={theme.primaryColor.hex} />
                <stop offset='100%' stopColor={theme.primaryColorGradientEnd.hex} />
            </linearGradient>
            <linearGradient id='1' x1='0' x2='0' y1='1' y2='0'>
                <stop offset='0%' stopColor={theme.warningColor.hex} />
                <stop offset='100%' stopColor={theme.warningColor.hex} />
            </linearGradient>
            <linearGradient id='2' x1='0' x2='0' y1='1' y2='0'>
                <stop offset='0%' stopColor={theme.errorColor.hex} />
                <stop offset='100%' stopColor={theme.errorColor.hex} />
            </linearGradient>
        </defs>
    ), [theme]);

    const valueMax = useMemo(() => {
        if (transactions.length === 0) {
            return 1;
        } else {
            return aggregate(
                aggregation, transactions
            )
                .map(tx => dataMode === 'revenue' ? tx.price : tx.quantity)
                .reduce((acc, val) => val > acc ? val : acc) + (dataMode === 'revenue' ? 100 : 1);
        }
    }, [transactions, aggregation, dataMode]);

    const defaultMin = useMemo(() => {
        if (transactions.length) {
            return transactions
                .map(tx => new Date(tx.date).getTime())
                .reduce((acc, val) => acc < val ? acc : val)
        } else {
            return null
        }
    }, [transactions]);

    const data = React.useMemo(
        () => generateData(
            transactions,
            aggregation,
            trim(aggregation, new Date(max)), dataMode, min ? new Date(min) : (defaultMin ? new Date(defaultMin) : undefined)
        ),
        [transactions, aggregation, max, dataMode, min,  defaultMin]
    )
    const series = React.useCallback(
        (s, i) => {
            return {
                type: 'line'
            }
        },
        []
    )

    const axes = React.useMemo(
        () => [
            { id: 'Time', primary: true, type: 'time', position: 'bottom', hardMin: min, hardMax: add(aggregation, max)},
            { id: 'Revenue', type: 'linear', position: 'left', hardMax: valueMax , show: dataMode === 'revenue', format: (d: string) => {
                    return currency !== null ? fromAtomicValue(currency, parseInt(d.replace(/,/g, ''), 10)) : d
                }},
            { id: 'Quantity', type: 'linear', position: 'left', hardMax: valueMax , show: dataMode === 'quantity' },
        ],
        [min, max, dataMode, aggregation, valueMax, currency]
    )

    const getSeriesStyle = React.useCallback(
        (_series) => {
            if (_series.label.indexOf('Confirmed') !== -1) {
                return {
                    color: `url(#0)`,
                    opacity: 1
                }
            }
            if (_series.label.indexOf('Pending') !== -1) {
                return {
                    color: `url(#1)`,
                    opacity: 1
                }
            }
            if (_series.label.indexOf('Rejected') !== -1) {
                return {
                    color: `url(#2)`,
                    opacity: 1
                }
            }
        },
        []
    )

    const getDatumStyle = React.useCallback(
        () => ({
            r: 4
        }),
        []
    )

    const brush = React.useMemo(
        () => ({
            onSelect: (brushData: any) => {
                setCustom({
                    customMin: Math.min(brushData.start, brushData.end),
                    customMax: Math.max(brushData.start, brushData.end)
                })
            }
        }),
        [setCustom]
    )

    return <GraphContainer>
        <div
            style={{
                width: '100%',
                height: '100%'
            }}
        >
            <Chart
                tooltip={true}
                dark={true}
                series={series}
                data={data}
                primaryCursor={true}
                secondaryCursor={true}
                renderSVG={() => defs}
                getSeriesStyle={getSeriesStyle}
                getDatumStyle={getDatumStyle}
                axes={axes}
                brush={custom ? brush : undefined}
            />
        </div>
    </GraphContainer>
}
