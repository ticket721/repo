import React, { useEffect, useMemo, useState } from 'react';
import styled, { useTheme }                    from 'styled-components';
import { Transaction }                         from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSalesResponse.dto';
import { Theme }                               from '@frontend/flib-react/lib/config/theme';
import { fillTheGaps }                         from './fillTheGaps';
import { aggregate }                           from './aggregate';
import { trim }            from './trim';
import { SECOND, SIXHOUR } from './time';
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
}


const generateData = (transactions: Transaction[], aggregationMode: string, end: Date, dataMode: string) => {
    switch (dataMode) {
        case 'revenue': return [
            {
                label: 'Confirmed Transactions Revenue',
                data: fillTheGaps(
                    aggregationMode,
                    aggregate(
                        aggregationMode, transactions.filter((tx: Transaction) => tx.status === 'confirmed')
                    ),
                    end
                )
                    .map((tx: Transaction) => [
                        new Date(tx.date),
                        tx.price / 100
                    ]),
                secondaryAxisID: 'Revenue'
            },
            {
                label: 'Pending Transactions Revenue',
                data: aggregate(
                    aggregationMode, transactions.filter((tx: Transaction) => tx.status === 'waiting')
                )
                    .map((tx: Transaction) => [
                        new Date(tx.date),
                        tx.price / 100
                    ]),
                secondaryAxisID: 'Revenue'
            },
            {
                label: 'Rejected Transactions Revenue',
                data: fillTheGaps(
                    aggregationMode,
                    aggregate(
                        aggregationMode, transactions.filter((tx: Transaction) => tx.status === 'rejected')
                    ),
                    end
                )
                    .map((tx: Transaction) => [
                        new Date(tx.date),
                        tx.price / 100
                    ]),
                secondaryAxisID: 'Revenue'
            }
        ]
        case 'quantity': return [
            {
                label: 'Confirmed Transactions Quantity',
                data: fillTheGaps(
                    aggregationMode,
                    aggregate(
                        aggregationMode, transactions.filter((tx: Transaction) => tx.status === 'confirmed')
                    ),
                    end
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
                    aggregationMode, transactions.filter((tx: Transaction) => tx.status === 'waiting')
                )
                    .map((tx: Transaction) => [
                        new Date(tx.date),
                        tx.quantity
                    ]),
                secondaryAxisID: 'Quantity'
            },
            {
                label: 'Rejected Transactions Quantity',
                data: fillTheGaps(
                    aggregationMode,
                    aggregate(
                        aggregationMode, transactions.filter((tx: Transaction) => tx.status === 'rejected')
                    ),
                    end
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

const useTimer = (mode: string) => {
    const [now, setNow] = useState(trim(mode, new Date()).getTime());
    const [raw, setRaw] = useState(Date.now());

    useEffect(() => {
        setNow(trim(mode, new Date()).getTime())
    }, [mode])

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setNow(trim(mode, new Date()).getTime())
            setRaw(Date.now());
        }, 5 * SECOND)
        return () => {
            clearTimeout(timeoutId);
        }
    }, [now, mode, raw])

    console.log('running', new Date(now));

    return now;
}

export default ({transactions, aggregation, min, max}: GraphProps) => {

    console.log(transactions);

    const theme = useTheme() as Theme;

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

    const data = React.useMemo(
        () => generateData(transactions, aggregation, trim(aggregation, new Date(max)), 'revenue'),
        [transactions, aggregation, max]
    )
    const series = React.useCallback(
        (s, i) => {
            if (s.label.indexOf('Quantity') !== -1) {
                return {
                    type: 'bar'
                }
            }
            return {
                type: 'line'
            }
        },
        []
    )
    const axes = React.useMemo(
        () => [
            { id: 'Time', primary: true, type: 'time', position: 'bottom', hardMin: min, hardMax: max },
            { id: 'Quantity', type: 'linear', position: 'left', stacked: true },
            { id: 'Revenue', type: 'linear', position: 'right'}
        ],
        [min, max]
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
            />
        </div>
    </GraphContainer>
}
