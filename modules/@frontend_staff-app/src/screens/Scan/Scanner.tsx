import React, { useState } from 'react';
import QrReader                        from 'react-qr-reader';
import styled  from 'styled-components';
import { TopNavbar }                   from './TopNavbar';
import { FullPageLoading }            from '@frontend/flib-react/lib/components';
import { DateItem }                         from '../../components/EventSelection';
import { useSelector }                      from 'react-redux';
import { StaffAppState }                    from '../../redux';
import { verifyMessage, BigNumber }         from 'ethers/utils';
import { second }                           from '@frontend/core/lib/utils/date';
import { useLazyRequest }                   from '@frontend/core/lib/hooks/useLazyRequest';
import { v4 }                               from 'uuid';
import { TicketsValidateTicketResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsValidateTicketResponse.dto';
import { PushNotification }                 from '@frontend/core/lib/redux/ducks/notifications';
import { useDispatch }                      from 'react-redux';
import { useTranslation }                   from 'react-i18next';
import { useDeepEffect }                    from '@frontend/core/lib/hooks/useDeepEffect';
import './locales';
import { CacheCore }                        from '@frontend/core/lib/cores/cache/CacheCore';
import { UpdateItemData }                   from '@frontend/core/lib/redux/ducks/cache';
import { ScannerZone }                      from './ScannerZone';

export type Status = 'error' | 'success' | 'verifying' | 'scanning';

interface ScannerProps {
    events: {
        id: string;
        name: string;
    }[];
    dates: DateItem[];
}

interface QrPayload {
    address: string;
    ticketId: string;
    timestamp: number;
}

export const Scanner: React.FC<ScannerProps> = ({ events, dates }: ScannerProps) => {
    const [
        token,
        eventId,
        dateId ] = useSelector((state: StaffAppState) =>
        [
            state.auth.token.value,
            state.currentEvent.eventId,
            state.currentEvent.dateId,
        ]);

    const [ loaded, setLoaded ] = useState<boolean>(false);
    const [ status, setStatus ] = useState<Status>('scanning');
    const [ timestampRange, setTimestampRange ] = useState<number[]>([]);
    // const [ categoryFilters, setCategoryFilters ] = useState<string[]>([]);
    const [ scannedTicket, setScannedTicket ] = useState<QrPayload>(null);
    const [ statusMsg, setStatusMsg ] = useState<string>(null);

    const [uuid] = useState(v4() + '@scanner');

    const [ t ] = useTranslation(['scanner', 'verify_errors']);
    const dispatch = useDispatch();

    const { lazyRequest: validateTicket, response: validationResp } = useLazyRequest<TicketsValidateTicketResponseDto>('tickets.validate', uuid);

    const verifyTicket = (data: string) => {
        if (status === 'scanning' && data) {
            setStatus('verifying');
            const timestamps = [
                new Date(Date.now() - 15 * second).getTime(),
                new Date(Date.now() + 15 * second).getTime(),
            ];
            setTimestampRange(timestamps);

            if (
                data.length === 194 + timestamps[0].toString().length ||
                data.length === 194 + timestamps[1].toString().length
            ) {
                const sig = '0x' + data.slice(0, 130);
                const ticketId = new BigNumber('0x' + data.slice(130, 194)).toString();
                const timestamp = parseInt(data.slice(194), 10);
                const address = verifyMessage(ticketId + timestamp, sig);

                setScannedTicket({
                    address,
                    ticketId,
                    timestamp,
                });

                validateTicket([
                    token,
                    eventId,
                    {
                        ticketId,
                        address,
                    }
                ], {
                    force: true
                });
            }
        }
    };

    useDeepEffect(() => {
        if (validationResp.error) {
            setStatus('error');
            switch (validationResp.error.response.data.message) {
                case 'entity_not_found':
                    setStatusMsg('verify_errors:ticket_not_found');
                    break;
                default:
                    dispatch(PushNotification(t('verify_errors:internal_server_error'), 'error'));
                    setStatusMsg('retry');
            }
        }
    }, [validationResp.error]);

    useDeepEffect(() => {
        console.log('validationResp', validationResp.data);
        if (validationResp.data) {
            if (validationResp.data.info) {
                // if (categoryFilters.findIndex((category) => category === validationResp.data.info.category) === -1) {
                //     setStatus('error');
                //     setStatusMsg('verify_errors:invalid_category');
                // }

                if (scannedTicket.timestamp < timestampRange[0]) {
                    setStatus('error');
                    setStatusMsg('verify_errors:expired_qr');
                    return;
                }

                if (scannedTicket.timestamp > timestampRange[1]) {
                    setStatus('error');
                    setStatusMsg('verify_errors:invalid_time_zone');
                    return;
                }

                setStatus('success');
                setStatusMsg(t('valid'));
            } else {
                setStatus('error');
                setStatusMsg('verify_errors:invalid_user');
                return;
            }
        }
    }, [validationResp.data]);

    return (
        <ScannerWrapper>
            <TopNavbar status={status} msg={t(statusMsg)} events={events} dates={dates}/>
            {
                dateId && !loaded ?
                    <FullPageLoading/> :
                    null
            }
            <ScannerZone status={status}/>
            {
                status === 'error' || status === 'success' ?
                    <TapToScan onClick={() => {
                        if (status === 'error' || status === 'success') {
                            setTimestampRange([]);
                            setStatusMsg(null);
                            setScannedTicket(null);
                            setStatus('scanning');
                            dispatch(UpdateItemData(CacheCore.key('tickets.validate', [
                                token,
                                eventId,
                                {
                                    ticketId: scannedTicket.ticketId,
                                    address: scannedTicket.address,
                                }
                            ]), null));
                        }
                    }}>{t('scan_again')}</TapToScan> :
                    null
            }
            {
                dateId ?
                    <QrReader
                        onScan={verifyTicket}
                        onError={(err) => console.log(err)}
                        onLoad={() => setLoaded(true)}
                        delay={300}
                        facingMode={'environment'}
                        style={{
                            'width': '100vw',
                            'height': '100vh'
                        }}
                        showViewFinder={false} /> :
                    null
            }
        </ScannerWrapper>
    );
};

const ScannerWrapper = styled.div`
    section > section {
        padding-top: 100vh !important;
    }
`;

const TapToScan = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    bottom: calc(19vh - 25vw + ${props => props.theme.regularSpacing});
    left: calc(50% - 6vh);
    width: 12vh;
    height: 12vh;
    font-size: 2vh;
    z-index: 3;
    background-color: ${props => props.theme.darkerBg};
    border-radius: 50%;
    text-align: center;
    font-weight: 500;
`;
