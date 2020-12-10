import { useToken } from '@frontend/core/lib/hooks/useToken';
import { Toggle } from '@frontend/flib-react/lib/components';
import React, { useEffect, useMemo, useState } from 'react';
import { v4 }                          from 'uuid';
import { useTranslation }              from 'react-i18next';
import styled                          from 'styled-components';
import { useHistory }       from 'react-router';
import { OnlineTag }                   from '../../../components/OnlineTag';
import { RequestResp, useLazyRequest } from '@frontend/core/lib/hooks/useLazyRequest';
import { EventsStatusResponseDto }     from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsStatusResponse.dto';
import { useDispatch }                 from 'react-redux';
import { PushNotification }            from '@frontend/core/lib/redux/ducks/notifications';
import { Dispatch }                    from 'redux';
import { CategoryEntity } from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { format } from '@frontend/core/lib/utils/date';

export interface DateCardProps {
    eventId: string;
    id: string;
    eventStatus: 'preview' | 'live';
    status: 'preview' | 'live';
    name: string;
    begin: Date;
    end: Date;
    online: boolean;
    avatar: string;
    colors: string[];
    categories: CategoryEntity[];
    forceRefresh: () => void;
}

const handleStatus = (req: RequestResp<EventsStatusResponseDto>, history: any, dispatch: Dispatch, t: any): void => {
    switch (req.error.response.data.message) {
        case 'no_stripe_interface_bound':
            dispatch(PushNotification(t('no_stripe_interface'), 'warning'));
            history.push('/stripe/connect');
            break;
        case 'stripe_interface_not_ready':
            dispatch(PushNotification(t('stripe_not_ready'), 'warning'));
            history.push('/stripe/connect');
            break;
        default:
            dispatch(PushNotification(t('toggle_error'), 'error'));
            break;
    }
}

export const DateCard: React.FC<DateCardProps> = ({
    eventId,
    id,
    eventStatus,
    status,
    name,
    begin,
    end,
    online,
    avatar,
    colors,
    categories,
    forceRefresh,
}) => {
    const [ t ] = useTranslation('dates_dashboard');
    const token = useToken();

    const history = useHistory();
    const dispatch = useDispatch();

    const [toggleDateStatusUuid] = useState(v4() + '@date-status-toggle');

    const [ dateStatusChanging, setDateStatusChanging ] = useState<boolean>(false);

    const categoriesInfos = useMemo<{ startPrice: number, totalSeats: number }>(() => {
        const totalSeats = categories.reduce((acc, category) => acc + category.seats, 0);

        if (!totalSeats) {
            return null;
        }

        return {
            startPrice: categories.sort((prevCategory, category) => prevCategory.price - category.price)[0].price,
            totalSeats,
        };
    }, [categories]);

    const { response: toggleDateStatusResp, lazyRequest: toggleDateStatus } =
        useLazyRequest<EventsStatusResponseDto>('events.status', toggleDateStatusUuid);

    const handleLiveToggle = (checked: boolean) => {
        if (checked === (status === 'live')) {
            dispatch(PushNotification(t('status_already_in_state', { status }), 'error'));
            return;
        }

        setDateStatusChanging(true);
        toggleDateStatus([
            token,
            eventId,
            {
                dates: {
                    [id]: checked,
                },
            }
        ], { force: true });
    }

    useEffect(() => {
        if (toggleDateStatusResp.data) {
            forceRefresh();
            setDateStatusChanging(false);
        }
        // eslint-disable-next-line
    }, [toggleDateStatusResp.data]);

    useEffect(() => {
        if (toggleDateStatusResp.error) {
            setDateStatusChanging(false);
            handleStatus(toggleDateStatusResp, history, dispatch, t);
        }
        // eslint-disable-next-line
    }, [toggleDateStatusResp.error]);

    return <Container>
        {
            eventStatus === 'live' ?
            <LiveToggle disabled={dateStatusChanging}>
                <Toggle
                name={'live-toggle' + id}
                label={t(status)}
                checked={status === 'live'}
                gradient={colors}
                disabled={dateStatusChanging}
                onChange={handleLiveToggle}/>
            </LiveToggle> :
            null
        }
        <DateCardContainer
        cover={avatar}
        live={status === 'live'}
        onClick={() => history.push(`/event/${eventId}/date/${id}/dates-typology`)}>
                <Filter/>
                {
                    online ?
                    <Online><OnlineTag/></Online> :
                    null
                }
                <Name>{name}</Name>
                <DateRange>
                    {t('from')}&nbsp;
                    <strong>{format(begin)}</strong>
                    &nbsp;{t('to')}&nbsp;
                    <strong>{format(end)}</strong>
                </DateRange>
                <CategoriesInfos primaryColor={colors[0]}>
                    {
                        categoriesInfos !== null ?
                        <>
                            <strong>{categoriesInfos.totalSeats}</strong>&nbsp;{t('seats')}&nbsp;•&nbsp;
                            {
                                categoriesInfos.startPrice > 0 ?
                                <>{t('price_from')}&nbsp;<strong>{categoriesInfos.startPrice/100}€</strong></> :
                                <strong>{t('free')}</strong>
                            }
                        </> :
                        <NoCategory>{t('no_category')}</NoCategory>
                    }
                </CategoriesInfos>
        </DateCardContainer>
    </Container>;
};

const Container = styled.div`
    position: relative;
`;

const LiveToggle = styled.div<{ disabled: boolean }>`
    position: absolute;
    top: -${props => props.theme.doubleSpacing};
    right: 4px;
    pointer-events: ${props => props.disabled ? 'none' : null};
    filter: ${props => props.disabled ? 'greyscale(1)' : null};

    label {
        padding-top: 3px;
    }
`;

const DateCardContainer = styled.div<{ cover: string, live: boolean }>`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 400px;
    width: calc((100vw - 450px - (${props => props.theme.doubleSpacing} * 2)) / 3);
    height: calc((100vw - 450px - (${props => props.theme.doubleSpacing} * 2)) * (3/16));
    background: url(${props => props.cover});
    background-size: cover;
    padding: ${props => props.theme.biggerSpacing};
    border-radius: ${props => props.theme.defaultRadius};
    cursor: pointer;

    filter: ${props => props.live ? null : 'grayscale(0.5)'};

    @media screen and (max-width: 1500px) {
        width: calc((100vw - 450px - ${props => props.theme.doubleSpacing}) / 2);
        height: calc((100vw - 450px - ${props => props.theme.doubleSpacing}) * (9/32));
    }

    @media screen and (max-width: 900px) {
        width: calc(100vw - 450px);
        height: calc((100vw - 450px) * (9/16));
    }
`;

const Filter = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    border-radius: ${props => props.theme.defaultRadius};
    width: 100%;
    height: 100%;
    background: linear-gradient(0deg, rgba(0,0,0,0.6) 15%, transparent);
`;

const Online = styled.div`
    position: absolute;
    top: ${props => props.theme.regularSpacing};
    right: ${props => props.theme.regularSpacing};
`;

const Name = styled.span`
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: ${props => props.theme.smallSpacing};
    z-index: 1;
`;

const DateRange = styled.div`
    display: flex;
    z-index: 1;
    padding-bottom: ${props => props.theme.smallSpacing};
    font-size: 12px;
    color: ${props => props.theme.textColorDark};

    strong {
        color: ${props => props.theme.textColor};
        font-weight: 500;
    }
`;

const CategoriesInfos = styled.span<{ primaryColor: string }>`
    font-size: 14px;
    z-index: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-weight: 500;

    strong {
        color: ${props => props.primaryColor};
        text-shadow: 0 0 1px ${props => props.primaryColor};
    }
`;

const NoCategory = styled.span`
    color: #AAA;
`;