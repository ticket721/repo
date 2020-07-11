import React, { useEffect, useState } from 'react';
import styled                         from 'styled-components';
import { useTranslation }           from 'react-i18next';
import {
    Icon,
    Error,
    FullPageLoading,
}                                           from '@frontend/flib-react/lib/components';
import './locales';
import { useRequest }                       from '@frontend/core/lib/hooks/useRequest';
import { useLazyRequest }                   from '@frontend/core/lib/hooks/useLazyRequest';
import { TicketsSearchResponseDto }         from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsSearchResponse.dto';
import { useSelector }                      from 'react-redux';
import { T721AppState }                     from '../../redux';
import { v4 }                               from 'uuid';
import { CategoryFetcher }                  from './CategoryFetcher';
import Flicking                             from '@egjs/react-flicking';
import { useHistory }                       from 'react-router';
import { UsersSetDeviceAddressResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/users/dto/UsersSetDeviceAddressResponse.dto';

const Wallet: React.FC = () => {
    const history = useHistory();
    const [ ticketIdx, setTicketIdx ] = useState<number>(0);
    const { t } = useTranslation('wallet');
    const [ token, address ] = useSelector((state: T721AppState) => [ state.auth.token.value, state.auth.user.address ]);
    const devicePk = useSelector((state: T721AppState) => state.deviceWallet.pk);
    const [uuid] = useState<string>(v4() + '@wallet');

    const { lazyRequest: postAddress } = useLazyRequest<UsersSetDeviceAddressResponseDto>('users.setDeviceAddress', uuid);

    const { response: ticketsResp } = useRequest<TicketsSearchResponseDto>({
        method: 'tickets.search',
        args: [
            token,
            {
                owner: {
                    $eq: address
                },
                status: {
                    $ne: 'canceled',
                },
                $sort: [{
                    $field_name: 'updated_at',
                    $order: 'desc',
                }]
            }
        ],
        refreshRate: 5,
    },
    uuid);

    useEffect(() => {
        if (devicePk) {
            postAddress([
                token,
                {
                    deviceAddress: localStorage.getItem('deviceAddress')
                },
            ]);
        }
    }, [token, devicePk, postAddress]);

    if (ticketsResp.loading) {
        return (
            <FullPageLoading
                width={250}
                height={250}
            />
        );
    }

    if (ticketsResp.error) {
        return (<Error message={t('fetch_error')}/>);
    }

    return (
        <Container>
            <Title>
                <h1>
                    {t('my_tickets')}
                </h1>
            </Title>
                {
                    ticketsResp.data?.tickets?.length > 0 ?
                        <TicketList>
                            <Flicking
                                overflow={true}
                                collectStatistics={false}
                                gap={24}
                                bound={true}
                                onChange={(e) => setTicketIdx(e.index)}
                            >
                                {
                                    ticketsResp.data.tickets.map((ticket) => (
                                        <CategoryFetcher
                                            key={ticket.id}
                                            uuid={uuid}
                                            categoryId={ticket.category}
                                            ticketId={ticket.id}/>
                                    ))
                                }
                            </Flicking>
                            <Dots>
                                {
                                    ticketsResp.data.tickets.map((ticket, idx) => (
                                        <Dot key={ticket.id} selected={idx === ticketIdx}/>
                                    ))
                                }
                            </Dots>
                        </TicketList> :
                    null
                }
            {
                ticketsResp.data?.tickets?.length === 0 ?
                <EmptyWallet>
                    <span>{t('empty_wallet')}</span>
                    <div onClick={() => history.push('/search')}>
                        <span>{t('return_to_search')}</span>
                        <Icon icon={'chevron'} size={'8px'} color={'#2143AB'}/>
                    </div>
                </EmptyWallet> :
                null
            }
        </Container>
    );
};

const Container = styled.div`
`;

const Title = styled.div`
    font-weight: bold;
    color: ${props => props.theme.textColor};
    font-family: ${props => props.theme.fontStack};
    margin-top: ${props => props.theme.regularSpacing};

    h1 {
        margin-bottom: 0;
        text-align: center;
        font-size: 16px;
    }
`;

const TicketList = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: calc(100vh - 102px);
    margin: 0 20px;
`;

const Dots = styled.div`
    display: flex;
    justify-content: center;
    margin-top: ${props => props.theme.regularSpacing };
`;

const Dot = styled.div<{ selected: boolean }>`
    width: ${props => props.theme.smallSpacing};
    height: ${props => props.theme.smallSpacing};
    border-radius: 8px;
    background-color: ${props => props.selected ? props.theme.textColor : props.theme.componentColorLight};

    :not(:last-child) {
        margin-right: ${props => props.theme.smallSpacing};
    }
`;

const EmptyWallet = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: calc(100vh - 108px);
    color: ${props => props.theme.textColorDark};
    font-weight: 500;

    & > div {
        display: flex;
        color: ${props => props.theme.primaryColorGradientEnd.hex};
        margin-top: ${props => props.theme.regularSpacing};

        & > span:last-child {
            margin-left: ${props => props.theme.smallSpacing};
            margin-bottom: 2px;
            transform: rotate(-90deg);
        }
    }
`;

export default Wallet;
