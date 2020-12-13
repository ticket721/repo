import React, { Suspense, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Error, FullPageLoading, Icon, CustomDatePicker }                                                 from '@frontend/flib-react/lib/components';
import styled                        from 'styled-components';
import { EventsContext }             from '../Fetchers/EventsFetcher';
import { useToken }                  from '@frontend/core/lib/hooks/useToken';
import { v4 }                        from 'uuid';
import { useRequest }                from '@frontend/core/lib/hooks/useRequest';
import { isRequestError }            from '@frontend/core/lib/utils/isRequestError';
import { useTranslation }            from 'react-i18next';
import { EventsSalesResponseDto }    from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSalesResponse.dto';
import { useHistory, useRouteMatch } from 'react-router';
import { Transaction }               from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsSalesResponse.dto';
import { getPrice }                  from '@frontend/core/lib/utils/prices';
import { trim }              from './trim';
import { DAY, HOUR, SECOND } from './time';
import './locales';

const Graph = React.lazy(() => import('./Graph'));

const LoaderContainer = styled.div`
  background-color: ${props => props.theme.darkerBg};
  border-radius: ${props => props.theme.defaultRadius};
  width: 90%;
  height: 50vh;
`

const OptionsContainer = styled.div`
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const Option = styled.div`
  border-radius: 4px;
  margin: 4px;
  padding: 4px;
  cursor: pointer;
  
  &.selected {
    background: linear-gradient(0deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)), linear-gradient(260deg, ${
    props => props.theme.primaryColor.hex
}, ${
    props => props.theme.primaryColorGradientEnd.hex
});
    font-weight: bold;
  }
  
  & > span {
    text-transform: uppercase;
    font-size: 12px;
  }
  
`

const ModeSelector = ({mode, setMode, customMin, customMax, reset}: {mode: string; setMode: (val: string) => void; customMin: number; customMax: number; reset: () => void;}) => {

    const [t] = useTranslation('stats');

    const options = useMemo(() => [
        '1h',
        '6h',
        '12h',
        '1d',
        '1w',
        '1m',
        'custom'
    ], []);

    const titles = useMemo(() => [
        t('last_hour'),
        t('last_six_hours'),
        t('last_twelve_hours'),
        t('last_day'),
        t('last_week'),
        t('last_month'),
        t('custom')
    ], []);

    return <>
        <OptionsContainer>
            {
                options.map((val, idx) => (
                    <Option key={val} onClick={() => setMode(val)} className={val === mode ? 'selected' : undefined}>
                        <span>{titles[idx]}</span>
                    </Option>

                ))
            }
            {
                mode === 'custom' && (customMin !== null || customMax !== null)

                    ? <Option className={'selected'} onClick={reset}>
                        <Icon
                            icon={'refresh'}
                            size={'15px'}
                            color={'white'}
                        />
                    </Option>

                    : null
            }
        </OptionsContainer>
    </>
}

const DataSelector = ({data, setData}: {data: string; setData: (val: string) => void;}) => {

    const [t] = useTranslation('stats');

    const options = useMemo(() => [
        'revenue',
        'quantity'
    ], []);

    const titles = useMemo(() => [
        t('revenue'),
        t('quantity')
    ], []);

    return <>
        <OptionsContainer>
            {
                options.map((val, idx) => (
                    <Option key={val} onClick={() => setData(val)} className={val === data ? 'selected' : undefined}>
                        <span>{titles[idx]}</span>
                    </Option>

                ))
            }
        </OptionsContainer>
    </>
}

const AggregationSelector = ({aggregation, setAggregation}: {aggregation: string; setAggregation: (val: string) => void;}) => {

    const options = useMemo(() => [
        'minutes',
        '5minutes',
        'quarters',
        'halfs',
        'hours',
        'sixhours',
        'twelvehours',
        'days'
    ], []);

    const titles = useMemo(() => [
        '1m',
        '5m',
        '15m',
        '30m',
        '1h',
        '6h',
        '12h',
        '1d'
    ], []);

    return <>
        <OptionsContainer>
            {
                options.map((val, idx) => (
                    <Option key={val} onClick={() => setAggregation(val)} className={val === aggregation ? 'selected' : undefined}>
                        <span>{titles[idx]}</span>
                    </Option>

                ))
            }
        </OptionsContainer>
    </>
}

const stringify = (val: any) => {
    switch (typeof val) {
        case 'object': return JSON.stringify(val);
        default: return val.toString();
    }
}

const useQueryParameterState = (key: string, defaultValue: any): [string, (val: any) => void] => {
    const history = useHistory();
    const searchParams = useMemo(() => new URLSearchParams(history.location.search), [history.location.search]);
    const [value, _setValue] = useState<string>(searchParams.get(key) ? searchParams.get(key).toString() : stringify(defaultValue));

    useEffect(() => {

        const _searchParams = new URLSearchParams(history.location.search);

        _searchParams.set(key, stringify(value));

        history.replace({
            pathname: history.location.pathname,
            search: _searchParams.toString()
        });

    }, [value, history, key])

    const setValue = useCallback((val: any) => _setValue(stringify(val)), [_setValue])

    return [value, setValue];
}

const TotalCardContainer = styled.div`
  position: relative;
  background-color: ${props => props.theme.darkerBg};
  border-radius: ${props => props.theme.defaultRadius};
  margin: ${props => props.theme.regularSpacing};
  height: 200px;
  width: 30%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Container = styled.div`
  position: relative;
  margin: ${props => props.theme.regularSpacing};
  height: 200px;
  width: 30%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`

const TotalCard = ({transactions, data}: {transactions: Transaction[], data: string}): JSX.Element => {

    const paidTransactions = useMemo(() => transactions.filter(tx => tx.price > 0), [transactions])
    const [t] = useTranslation('stats');

    switch (data) {
        case 'revenue': {
            return <TotalCardContainer>
                <h2
                    style={{
                        position: 'absolute',
                        left: 12,
                        top: 12
                    }}
                >{t('total_revenue')}</h2>
                <span style={{
                    fontSize: 35
                }}>{
                    paidTransactions.length > 0

                        ? getPrice({
                            price: paidTransactions
                                .map((tx) => tx.price)
                                .reduce((acc, tx): number => acc + tx),
                            currency: paidTransactions[0]?.currency
                        } as any, '0')

                        : '0'
                }</span>
            </TotalCardContainer>
        }
        case 'quantity': {
            return <TotalCardContainer>
                <h2
                    style={{
                        position: 'absolute',
                        left: 12,
                        top: 12
                    }}
                >{t('total_quantity')}</h2>
                <span style={{
                    fontSize: 50
                }}>{
                    transactions.length > 0

                        ? transactions
                            .map((tx) => tx.quantity)
                            .reduce((acc, tx): number => acc + tx)

                        : '0'

                }</span>
            </TotalCardContainer>
        }
    }

}

const HeaderInfos = ({transactions, mode, min, max, changeMin, changeMax}: {transactions: Transaction[], mode: string, min: number, max: number, changeMin: (val: number) => void, changeMax: (val: number) => void}): JSX.Element => {

    const [t] = useTranslation('stats');

    return <div
        style={{
            width: '90%',
            marginTop: 12,
            marginBottom: 12,
            display: 'flex',
            flexDirection: 'row'
        }}
    >
        <TotalCard transactions={transactions.filter((tx) => tx.status === 'confirmed')} data={'revenue'}/>
        <TotalCard transactions={transactions.filter((tx) => tx.status === 'confirmed')} data={'quantity'}/>
        {
            mode === 'custom'

                ?
                <Container>
                    <div
                        style={{
                            width: '100%',
                            margin: 8
                        }}
                    >
                        <CustomDatePicker
                            label={t('start')}
                            name={'date'}
                            placeholder={t('event_creation')}
                            showTime={true}
                            onChange={(val: Date) => changeMin(val.getTime())}
                            value={min !== null ? new Date(min) : undefined}
                        />
                    </div>
                    <div
                        style={{
                            width: '100%',
                            margin: 8
                        }}
                    >
                        <CustomDatePicker
                            label={t('end')}
                            name={'date'}
                            placeholder={t('now')}
                            showTime={true}
                            onChange={(val: Date) => changeMax(val.getTime())}
                            value={max !== null ? new Date(max) : undefined}
                        />
                    </div>
                </Container>

                :
                null
        }
    </div>
}

type DisplayModes = '1h' | '6h' | '12h' | '1d' | '1w' | '1m' | 'custom';

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

    return now;
}

const getMin = (mode: DisplayModes, now: number, customMin: number): number => {
    switch (mode) {
        case '1h': return now - HOUR;
        case '6h': return now - (6 * HOUR);
        case '12h': return now - (12 * HOUR);
        case '1d': return now - DAY;
        case '1w': return now - (7 * DAY);
        case '1m': return now - (30 * DAY);
        case 'custom': return customMin;
    }
}

const getMax = (mode: DisplayModes, now: number, customMax: number): number => {
    switch (mode) {
        case '1h': return null;
        case '6h': return null;
        case '12h': return null;
        case '1d': return null;
        case '1w': return null;
        case '1m': return null;
        case 'custom': return customMax;
    }
}

const SalesFetcher = ({eventId}: {eventId: string}) => {

    const token = useToken();
    const [uuid] = useState<string>(v4() + '@sales-fetch');
    const [t] = useTranslation(['attendees', 'common']);
    const [aggregation, setAggregation] = useQueryParameterState('aggregation', '5minutes');
    const [mode, setMode] = useQueryParameterState('mode', '1h');
    const [data, setData] = useQueryParameterState('data', 'revenue');
    const [customs, setCustom] = useQueryParameterState('customlimits', {customMin: null, customMax: null});
    const now = useTimer(aggregation);
    const {customMin, customMax} = useMemo(() => JSON.parse(customs), [customs]);

    const [min, max] = useMemo(() => [
        getMin(mode as DisplayModes, now, customMin),
        getMax(mode as DisplayModes, now, customMax)
    ], [mode, now, customMin, customMax]);

    const payload = useMemo(() => ({
        ...(min ? {start: new Date(min)} : {}),
        ...(max ? {end: new Date(max)} : {})
        ,
    }), [min, max])

    const changeMin = useCallback((val: number) => {
        setCustom({
            customMin: val,
            customMax
        });
    }, [customMin, customMax, setCustom]);

    const changeMax = useCallback((val: number) => {
        setCustom({
            customMin,
            customMax: val
        });
    }, [customMin, customMax, setCustom]);

    const salesReq = useRequest<EventsSalesResponseDto>({
        method: 'events.sales',
        args: [
            token,
            eventId,
            payload
        ],
        refreshRate: 15
    }, uuid);

    if (isRequestError(salesReq)) {
        return <Error message={t('infos_fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={salesReq.force}/>;
    }

    if (salesReq.response.loading) {
        return <>
            <HeaderInfos transactions={[]} mode={mode} min={customMin} max={customMax} changeMin={changeMin} changeMax={changeMax}/>
            <div
                style={{
                    width: '90%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}
            >
                <AggregationSelector aggregation={aggregation} setAggregation={setAggregation}/>
                <DataSelector data={data} setData={setData}/>
            </div>
            <LoaderContainer>
                <FullPageLoading/>
            </LoaderContainer>
            <div
                style={{
                    width: '90%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}
            >
                <ModeSelector mode={mode} setMode={setMode} customMax={customMax} customMin={customMin} reset={() => {
                    setCustom({
                        customMin: null,
                        customMax: null
                    })
                }}/>
            </div>
        </>
    }

    return <>
        <HeaderInfos transactions={salesReq.response.data.transactions} mode={mode} min={customMin} max={customMax} changeMin={changeMin} changeMax={changeMax}/>
        <div
            style={{
                width: '90%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between'
            }}
        >
            <AggregationSelector aggregation={aggregation} setAggregation={setAggregation}/>
            <DataSelector data={data} setData={setData}/>
        </div>
        <Suspense
            fallback={
                <LoaderContainer>
                    <FullPageLoading/>
                </LoaderContainer>
            }
        >
            <Graph
                transactions={salesReq.response.data.transactions}
                aggregation={aggregation}
                dataMode={data}
                min={min}
                max={max || now}
                custom={mode === 'custom'}
                setCustom={setCustom}
            />
            <div
                style={{
                    width: '90%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}
            >
                <ModeSelector mode={mode} setMode={setMode} customMax={customMax} customMin={customMin} reset={() => {
                    setCustom({
                        customMin: null,
                        customMax: null
                    })
                }}/>
            </div>
        </Suspense>
    </>
}

export const Sales = () => {

    const events = useContext(EventsContext);

    if (!events.events[0]) {
        return <FullPageLoading/>
    }

    return <div
        style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            flexDirection: 'column'
        }}
    >
        <SalesFetcher eventId={events.events[0].id}/>
    </div>;
}
