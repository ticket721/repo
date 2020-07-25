import React, { useEffect, useState } from 'react';
import QrReader                       from 'react-qr-reader';
import styled  from 'styled-components';
import { TopNavbar }              from './TopNavbar';
import { Error, FullPageLoading } from '@frontend/flib-react/lib/components';
import { DateItem }               from '../../components/EventSelection';
import { useSelector }                      from 'react-redux';
import { StaffAppState }                    from '../../redux';
import { verifyMessage, BigNumber }         from 'ethers/utils';
import { second }                           from '@frontend/core/lib/utils/date';
import { useLazyRequest }                   from '@frontend/core/lib/hooks/useLazyRequest';
import { v4 }                               from 'uuid';
import { TicketsValidateTicketResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsValidateTicketResponse.dto';
import { PushNotification }            from '@frontend/core/lib/redux/ducks/notifications';
import { useDispatch }                 from 'react-redux';
import { useTranslation }              from 'react-i18next';
import { useDeepEffect }               from '@frontend/core/lib/hooks/useDeepEffect';
import './locales';
import { CacheCore }                   from '@frontend/core/lib/cores/cache/CacheCore';
import { UpdateItemData }              from '@frontend/core/lib/redux/ducks/cache';
import { ScannerZone }                 from './ScannerZone';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { CategoriesFetcher }           from '../../components/Filters/CategoriesFetcher';
import { Icon }                        from '@frontend/flib-react/lib/components';
import { PushGuest }                   from '../../redux/ducks/current_event';

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
        dateId,
        filteredCategories,
        checkedGuests,
    ] = useSelector((state: StaffAppState) =>
        [
            state.auth.token.value,
            state.currentEvent.eventId,
            state.currentEvent.dateId,
            state.currentEvent.filteredCategories,
            state.currentEvent.checkedGuests,
        ]);

    const [ loaded, setLoaded ] = useState<boolean>(false);
    const [ status, setStatus ] = useState<Status>('scanning');
    const [ timestampRange, setTimestampRange ] = useState<number[]>([]);
    const [ scannedTicket, setScannedTicket ] = useState<QrPayload>(null);
    const [ statusMsg, setStatusMsg ] = useState<string>(null);
    const [ filtersOpened, setFiltersOpened ] = useState<boolean>(false);

    const [uuid] = useState(v4() + '@scanner');

    const [ t ] = useTranslation(['scanner', 'verify_errors']);
    const dispatch = useDispatch();

    const categoriesReq = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [
            token,
            {
                parent_id: {
                    $in: [eventId, dateId]
                }
            }
        ],
        refreshRate: 30,
    }, uuid + ':' + dateId);

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
                const ticketId = '0x' + data.slice(130, 194);
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
                        ticketId: new BigNumber(ticketId).toString(),
                        address,
                    }
                ], {
                    force: true
                });
            } else {
                setStatus('error');
                setStatusMsg('verify_errors:invalid_qrcode');
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
                case 'unauthorized_scan':
                    setStatusMsg('verify_errors:invalid_event');
                    break;
                default:
                    dispatch(PushNotification(t('verify_errors:internal_server_error'), 'error'));
                    setStatusMsg('retry');
            }
        }
    }, [validationResp.error]);

    useDeepEffect(() => {
        if (validationResp.data && scannedTicket) {
            if (validationResp.data.info) {
                if (
                    categoriesReq.response.data.categories
                    .findIndex(category => category.id === validationResp.data.info.category) === -1
                ) {
                    setStatus('error');
                    setStatusMsg('verify_errors:invalid_date');
                    return;
                }

                if (
                    filteredCategories.length > 0 &&
                    filteredCategories.findIndex((category) => category.id === validationResp.data.info.category) === -1
                ) {
                    setStatus('error');
                    setStatusMsg('verify_errors:invalid_category');
                    return;
                }

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

                if (checkedGuests.findIndex(checkedGuest => checkedGuest.ticketId === validationResp.data.info.ticket) !== -1) {
                    setStatus('error');
                    setStatusMsg('verify_errors:already_checked');
                    return;
                }

                setStatus('success');
                setStatusMsg(t('valid'));
                dispatch(PushGuest({
                    ticketId: validationResp.data.info.ticket,
                    email: validationResp.data.info.email,
                    name: validationResp.data.info.username,
                    category: validationResp.data.info.category,
                    checkedTimestamp: Date.now(),
                }));
            } else {
                setStatus('error');
                setStatusMsg('verify_errors:invalid_user');
                return;
            }
        }
    }, [validationResp.data, scannedTicket]);

    useEffect(() => {
        if (dateId && filteredCategories.length === 0) {
            setFiltersOpened(true);
        }
    }, [filteredCategories, dateId]);

    if (categoriesReq.response.loading) {
        return <FullPageLoading/>;
    }

    if (categoriesReq.response.error) {
        return <Error message={t('error_cannot_fetch_categories')} retryLabel={t('common:retrying_in')} onRefresh={categoriesReq.force}/>;
    }

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
                            setStatus('scanning');
                            dispatch(UpdateItemData(CacheCore.key('tickets.validate', [
                                token,
                                eventId,
                                {
                                    ticketId: scannedTicket.ticketId,
                                    address: scannedTicket.address,
                                }
                            ]), null));
                            setScannedTicket(null);
                        }
                    }}>{t('scan_again')}</TapToScan> :
                    null
            }
            {
                status === 'scanning' ?
                    <FilterBtn onClick={() => setFiltersOpened(true)}>
                        <Icon icon={'filter'} size={'24px'} color={'#FFF'}/>
                        <BtnLabel>
                            <span>{t('filter_btn_label')}</span>
                            <span>{
                                filteredCategories.length === categoriesReq.response.data.categories.length ?
                                    t('every_categories') :
                                    t('category', {count: filteredCategories.length})
                            }</span>
                        </BtnLabel>
                    </FilterBtn> :
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
            <CategoriesFetcher open={filtersOpened} onClose={() => setFiltersOpened(false)}/>
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

const FilterBtn = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    padding: ${props => props.theme.regularSpacing};
    bottom: ${props => props.theme.biggerSpacing};
    left: ${props => props.theme.biggerSpacing};
    z-index: 4;
    border-radius: ${props => props.theme.defaultRadius};
    width: calc(100vw - 2 * ${props => props.theme.biggerSpacing});
    background-color: ${props => props.theme.componentColorLighter};
    backdrop-filter: blur(40px);
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
`;

const BtnLabel = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-left: ${props => props.theme.regularSpacing};
    margin-top: 4px;
    height: 30px;
    font-weight: 500;

    & > span:last-child {
        font-size: 12px;
        color: ${props => props.theme.textColorDark};
    }
`;
