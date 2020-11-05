import React, { useEffect, useState }       from 'react';
import styled                               from 'styled-components';
import { useTranslation }                   from 'react-i18next';
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
import { CategoriesFetcher }                from './CategoriesFetcher';
import { useHistory }                       from 'react-router';
import { UsersSetDeviceAddressResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/users/dto/UsersSetDeviceAddressResponse.dto';

const Wallet: React.FC = () => {
    const history = useHistory();
    const { t } = useTranslation(['wallet', 'common']);
    const token = useSelector((state: T721AppState) => state.auth.token.value);
    const devicePk = useSelector((state: T721AppState) => state.deviceWallet.pk);
    const [uuid] = useState<string>(v4() + '@wallet');

    const { lazyRequest: postAddress } = useLazyRequest<UsersSetDeviceAddressResponseDto>('users.setDeviceAddress', uuid);

    const { response: ticketsResp, force } = useRequest<TicketsSearchResponseDto>({
            method: 'tickets.search',
            args: [
                token,
                {
                    $sort: [{
                        $field_name: 'updated_at',
                        $order: 'desc',
                    }],
                },
            ],
            refreshRate: 60,
        },
        uuid);

    useEffect(() => {
        if (devicePk) {
            postAddress([
                token,
                {
                    deviceAddress: localStorage.getItem('deviceAddress'),
                },
            ]);
        }
        // eslint-disable-next-line
    }, [token, devicePk]);

    if (ticketsResp.loading) {
        return <FullPageLoading/>;
    }

    if (ticketsResp.error) {
        return (<Error message={t('fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={force}/>);
    }

    return (
        <div>
            <Title>
                <h1>
                    {t('my_tickets')}
                </h1>
            </Title>
            {
                ticketsResp.data?.tickets?.length > 0

                    ?
                    <CategoriesFetcher
                        uuid={uuid}
                        tickets={ticketsResp.data.tickets}
                    />
                    :
                    <EmptyWallet>
                        <span>{t('empty_wallet')}</span>
                        <div onClick={() => history.push('/search')}>
                            <span>{t('return_to_search')}</span>
                            <Icon icon={'chevron'} size={'8px'} color={'#2143AB'}/>
                        </div>
                    </EmptyWallet>
            }
        </div>
    );
};

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
