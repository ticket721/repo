import React, { Suspense, useContext, useEffect, useMemo, useState } from 'react';
import { Error, FullPageLoading }    from '@frontend/flib-react/lib/components';
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

const Graph = React.lazy(() => import('./Graph'));

const LoaderContainer = styled.div`
  background-color: ${props => props.theme.darkerBg};
  border-radius: ${props => props.theme.defaultRadius};
  width: 90%;
  height: 50vh;
`

const AggregationOptionsContainer = styled.div`
  height: 50px;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const AggregationOption = styled.div`
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

const AggregationSelector = ({aggregation, setAggregation}: {aggregation: string; setAggregation: (val: string) => void;}) => {

    const options = useMemo(() => [
        'minutes',
        'quarters',
        'halfs',
        'hours',
        'sixhours',
        'twelvehours',
        'days'
    ], []);

    const titles = useMemo(() => [
        '1m',
        '15m',
        '30m',
        '1h',
        '6h',
        '12h',
        '1d'
    ], []);

    return <div
        style={{
            width: '90%'
        }}
    >
        <AggregationOptionsContainer>
            {
                options.map((val, idx) => (
                    <AggregationOption key={val} onClick={() => setAggregation(val)} className={val === aggregation ? 'selected' : undefined}>
                        <span>{titles[idx]}</span>
                    </AggregationOption>

                ))
            }
        </AggregationOptionsContainer>
    </div>
}

const useQueryParameterState = (key: string, defaultValue: string | number): [string, (val: string) => void] => {
    const history = useHistory();
    const searchParams = useMemo(() => new URLSearchParams(history.location.search), [history.location.search]);
    const [value, setValue] = useState<string>(searchParams.get(key) ? searchParams.get(key).toString() : defaultValue.toString());

    useEffect(() => {

        const _searchParams = new URLSearchParams(history.location.search);

        _searchParams.set(key, value.toString());

        history.replace({
            pathname: history.location.pathname,
            search: _searchParams.toString()
        });

    }, [value, history, key])

    return [value, setValue];
}

const TotalCardContainer = styled.div`
  position: relative;
  background-color: ${props => props.theme.darkerBg};
  border-radius: ${props => props.theme.defaultRadius};
  height: 200px;
  width: 33%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const TotalCard = ({transactions}: {transactions: Transaction[]}): JSX.Element => {
    return <TotalCardContainer>
        <h2
            style={{
                position: 'absolute',
                left: 12,
                top: 12
            }}
        >Total</h2>
        <span style={{
            fontSize: 35
        }}>{getPrice({
            price: transactions
                .map((tx) => tx.price)
                .reduce((acc, tx): number => acc + tx),
            currency: transactions[0]?.currency
        } as any, '0')}</span>
    </TotalCardContainer>
}

const HeaderInfos = ({transactions}: {transactions: Transaction[]}): JSX.Element => {
    return <div
        style={{
            width: '90%',
            marginTop: 12,
            marginBottom: 12
        }}
    >
        <TotalCard transactions={transactions}/>
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

const getMin = (mode: DisplayModes, now: number): number => {
    switch (mode) {
        case '1h': return now - HOUR;
        case '6h': return now - (6 * HOUR);
        case '12h': return now - (12 * HOUR);
        case '1d': return now - DAY;
        case '1w': return now - (7 * DAY);
        case '1m': return now - (30 * DAY);
        case 'custom': return null;
    }
}

const getMax = (mode: DisplayModes, now: number): number => {
    switch (mode) {
        case '1h': return null;
        case '6h': return null;
        case '12h': return null;
        case '1d': return null;
        case '1w': return null;
        case '1m': return null;
        case 'custom': return null;
    }
}

const SalesFetcher = ({eventId}: {eventId: string}) => {

    const token = useToken();
    const [uuid] = useState<string>(v4() + '@sales-fetch');
    const [t] = useTranslation(['attendees', 'common']);
    const [aggregation, setAggregation] = useQueryParameterState('aggregation', 'quarters');
    const [mode, setMode] = useQueryParameterState('mode', '12h');
    const now = useTimer(aggregation);

    const [min, max] = useMemo(() => [
        getMin(mode as DisplayModes, now),
        getMax(mode as DisplayModes, now)
    ], [mode, now]);

    const payload = useMemo(() => ({
        ...(min ? {start: new Date(min)} : {}),
        ...(max ? {end: new Date(max)} : {})
        ,
    }), [min, max])

    console.log(payload);

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
        return <LoaderContainer>
            <FullPageLoading/>
        </LoaderContainer>;
    }

    return <Suspense
        fallback={
            <LoaderContainer>
                <FullPageLoading/>
            </LoaderContainer>
        }
    >
        <h1>Sales Summary</h1>
        <HeaderInfos transactions={salesReq.response.data.transactions}/>
        <AggregationSelector aggregation={aggregation} setAggregation={setAggregation}/>
        <Graph
            transactions={salesReq.response.data.transactions}
            aggregation={aggregation}
            min={min}
            max={max || now}
        />
    </Suspense>
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
