import React, { useContext, useEffect, useState } from 'react';
import { EventsContext }               from '../Fetchers/EventsFetcher';
import styled                          from 'styled-components';
import { Button }                      from '@frontend/flib-react/lib/components';
import { useLazyRequest }              from '@frontend/core/lib/hooks/useLazyRequest';
import { v4 }                          from 'uuid';
import { useToken }                    from '@frontend/core/lib/hooks/useToken';
import { PushNotification }            from '@frontend/core/lib/redux/ducks/notifications';
import { useDispatch }                 from 'react-redux';
import { useTranslation }              from 'react-i18next';
import { fromAtomicValue }             from '@common/global';
import './locales';
import { EventsExportSlipResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsExportSlipResponse.dto';

const SlipCard = styled.div`
    width: 90%;
    margin: 5%;
    padding: ${props => props.theme.doubleSpacing};
    background-color: ${props => props.theme.darkBg};
    border-radius: ${props => props.theme.defaultRadius};
`

const download = (filename: string, text: string): void => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

const generateExport = (tarifs: any[]): void => {
    let csv = `name,price,currency,quantity,total`;

    for (const tarif of tarifs) {
        csv = `${csv}
${tarif.id} (${tarif.name} v${tarif.version}),${fromAtomicValue(tarif.currency, tarif.price)},${tarif.currency},`
        csv = `${csv}${tarif.amount},${fromAtomicValue(tarif.currency, tarif.amount * tarif.price)}`
    }

    download('event-slip.csv', csv);
}

export const Slip = () => {
    const token = useToken();
    const [uuid] = useState<string>(v4() + '@categories-fetch');
    const events = useContext(EventsContext);
    const dispatch = useDispatch();
    const [t] = useTranslation('slip');

    const fetchSlipLazyRequest = useLazyRequest<EventsExportSlipResponseDto>('events.exportSlip', uuid);

    useEffect(() => {

            if (!fetchSlipLazyRequest.response.loading) {
                if (fetchSlipLazyRequest.response.data) {
                    console.log(fetchSlipLazyRequest.response.data);
                    dispatch(PushNotification(t('export_slip_success'), 'success'));
                    generateExport(fetchSlipLazyRequest.response.data.tarifications);
                } else if (fetchSlipLazyRequest.response.error) {
                    dispatch(PushNotification(t('export_slip_failure'), 'error'));
                }
            }

        },
        // eslint-disable-next-line
        [fetchSlipLazyRequest.response.loading])

    return <SlipCard>
        <h1>{t('export_slip_title')}</h1>
        <p>{t('export_slip_description')}</p>
        <div
            style={{
                width: '30%'
            }}
        >
            <Button
                title={t('export_slip_button')}
                variant={'primary'}
                onClick={() => {
                    fetchSlipLazyRequest.lazyRequest([
                        token,
                        events.events[0].id,
                        v4()
                    ])
                }}
            />
        </div>
    </SlipCard>;
}
