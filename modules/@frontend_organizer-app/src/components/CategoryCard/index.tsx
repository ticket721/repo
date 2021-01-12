import { useRequest } from '@frontend/core/lib/hooks/useRequest';
import { useToken } from '@frontend/core/lib/hooks/useToken';
import { FullPageLoading, Error, Icon, Toggle } from '@frontend/flib-react/lib/components';
import React, { useEffect, useState } from 'react';
import { v4 }                               from 'uuid';
import { useTranslation }                   from 'react-i18next';
import styled                               from 'styled-components';
import { useHistory }                       from 'react-router';
import { CategoriesCountTicketResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesCountTicketResponse.dto';
import './locales';
import { MultiDatesTag }                    from '../MultiDatesTag';
import { RequestResp, useLazyRequest }      from '@frontend/core/lib/hooks/useLazyRequest';
import { EventsStatusResponseDto }          from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsStatusResponse.dto';
import { PushNotification }                 from '@frontend/core/lib/redux/ducks/notifications';
import { useDispatch }                      from 'react-redux';
import { Dispatch }                         from 'redux';
import { format as formatPrice } from '@common/global';

export interface CategoryCardProps {
    eventId: string;
    id: string;
    status: 'preview' | 'live';
    name: string;
    seats: number;
    price: number;
    currency: string;
    link: string;
    datesInfos: {
        cover: string;
        colors: string[];
    }[];
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
        case 'cannot_live_category_with_no_live_dates':
            dispatch(PushNotification(t('no_live_date'), 'warning'));
            break ;
        default:
            dispatch(PushNotification(t('toggle_error'), 'error'));
            break;
    }
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
    eventId,
    id,
    status,
    name,
    seats,
    price,
    currency,
    link,
    datesInfos,
    forceRefresh,
}) => {
    const [ t ] = useTranslation('category_card');
    const token = useToken();

    const dispatch = useDispatch();
    const history = useHistory();

    const [ticketCountUuid] = useState(v4() + '@ticket-count');
    const [toggleCategoryStatusUuid] = useState(v4() + '@category-status-toggle');

    const [ categoryStatusChanging, setCategoryStatusChanging ] = useState<boolean>(false);

    const [ currentCoverIdx, setCurrentCoverIdx ] = useState<number>(0);

    const { response: ticketCountResp, force: forceTicketCount } = useRequest<CategoriesCountTicketResponseDto>({
        method: 'categories.countTickets',
        args: [
            token,
            id,
        ],
        refreshRate: 10,
    }, ticketCountUuid);

    const { response: toggleCategoryStatusResp, lazyRequest: toggleCategoryStatus } =
    useLazyRequest<EventsStatusResponseDto>('events.status', toggleCategoryStatusUuid);

    const handleLiveToggle = (checked: boolean) => {
        if (checked === (status === 'live')) {
            dispatch(PushNotification(t('status_already_in_state', { status }), 'error'));
            return;
        }

        setCategoryStatusChanging(true);
        toggleCategoryStatus([
            token,
            eventId,
            {
                categories: {
                    [id]: checked,
                },
            },
            v4()
        ], { force: true });
    }

    useEffect(() => {
        if (datesInfos?.length > 1) {
            const interval = setInterval(() => {
                setCurrentCoverIdx(coverIdx => {
                    if (coverIdx < datesInfos.length - 1) {
                        return coverIdx + 1
                    }
                    return 0;
                });
            }, 6000);

            return () => clearInterval(interval);
        }
    }, [datesInfos]);


    useEffect(() => {
        if (toggleCategoryStatusResp.data) {
            forceRefresh();
            setCategoryStatusChanging(false);
        }
        // eslint-disable-next-line
    }, [toggleCategoryStatusResp.data]);

    useEffect(() => {
        if (toggleCategoryStatusResp.error) {
            setCategoryStatusChanging(false);
            handleStatus(toggleCategoryStatusResp, history, dispatch, t);
        }
        // eslint-disable-next-line
    }, [toggleCategoryStatusResp.error]);

    if (ticketCountResp.loading) {
        return <FullPageLoading/>;
    }

    if (ticketCountResp.error) {
        return <Error message={t('ticket_count_fetch_error')} onRefresh={forceTicketCount}/>;
    }

    return <Container>
        <LiveToggle disabled={categoryStatusChanging}>
            <Toggle
            name={'live-toggle' + id}
            label={t(status)}
            checked={status === 'live'}
            gradient={datesInfos[currentCoverIdx].colors}
            disabled={categoryStatusChanging}
            onChange={handleLiveToggle}/>
        </LiveToggle>
        <CategoryCardContainer
        live={status === 'live'}
        onClick={() => history.push(link)}>
            <EditIcon className={'edit-icon'} icon={'edit'} size={'16px'} color={'white'}/>
            <CoverCarousel cover={datesInfos[currentCoverIdx].cover}>
                {
                    datesInfos.length > 1 ? datesInfos.map((_, dateIdx) =>
                        <ProgressBar
                        key={dateIdx}
                        selected={dateIdx === currentCoverIdx}/>
                    ) :
                    null
                }
            </CoverCarousel>
            <Infos>
                <Title>
                    <Name>{name}</Name>
                    {
                        datesInfos.length > 1 ?
                        <MultiDatesTag/> :
                        null
                    }
                </Title>
                <RemainingTickets color={datesInfos[currentCoverIdx].colors[0]}>
                    <strong>{ticketCountResp.data.count}</strong>/{seats}&nbsp;{t('sold_tickets')}
                </RemainingTickets>
            </Infos>
            <Price color={datesInfos[currentCoverIdx].colors[0]}>{currency !== 'FREE' ? formatPrice(currency, price) : t('free')}</Price>
        </CategoryCardContainer>
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

const CategoryCardContainer = styled.div<{ live: boolean }>`
    position: relative;
    background-color: ${props => props.theme.darkerBg};
    padding: ${props => props.theme.regularSpacing};
    border-radius: ${props => props.theme.defaultRadius};
    display: flex;
    width: 600px;
    cursor: pointer;

    filter: ${props => props.live ? null : 'grayscale(0.3)'};

    :hover {
        .edit-icon {
            opacity: 1;
        }
    }
`;

const EditIcon = styled(Icon)`
    position: absolute;
    top: ${props => props.theme.smallSpacing};
    right: ${props => props.theme.smallSpacing};
    opacity: 0.2;
`;

const CoverCarousel = styled.div<{ cover: string }>`
    display: flex;
    align-items: flex-start;
    width: 100px;
    height: 100px;
    padding: 2px;
    border-radius: calc(${props => props.theme.defaultRadius} / 2);
    background-image: url(${props => props.cover});
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    transition: background-image 300ms ease;
`;

const ProgressBar = styled.div<{ selected: boolean }>`
    flex: 1;
    height: 4px;
    margin: 0 1px;
    border-radius: ${props => props.theme.defaultRadius};
    background-color: ${props => props.selected ? props.theme.textColor : props.theme.textColorDarker};
    transition: background-color 300ms ease;
`;

const Infos = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: ${props => props.theme.regularSpacing};
`;

const Title = styled.div`
    display: flex;
    margin: ${props => props.theme.regularSpacing} 0;
`;

const Name = styled.span`
    margin-right: ${props =>props.theme.smallSpacing};
    font-weight: 600;
`;

const RemainingTickets = styled.span<{ color: string }>`
    font-weight: 500;
    font-size: 12px;

    strong {
        font-size: 20px;
        color: ${props => props.color};
        text-shadow: 0 0 1px ${props => props.color};
        transition: color 300ms ease;
    }
`;

const Price = styled.span<{ color: string }>`
    position: absolute;
    bottom: ${props => props.theme.regularSpacing};
    right: ${props => props.theme.regularSpacing};
    font-size: 20px;
    font-weight: 600;
    color: ${props => props.color};
    text-shadow: 0 0 1px ${props => props.color};
    transition: color 300ms ease;
`;
