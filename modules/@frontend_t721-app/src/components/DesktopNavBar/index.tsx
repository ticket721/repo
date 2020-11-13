import React, { useContext, useEffect, useState } from 'react';
import styled                                     from 'styled-components';
import { FullPageLoading, Icon, WalletHeader } from '@frontend/flib-react/lib/components';

import { DrawerAccount, ProfileRoute } from '@frontend/core/lib/components/DrawerAccount';
import { useTranslation }              from 'react-i18next';
import { truncate }                    from '@frontend/core/lib/utils';
import { useHistory }                  from 'react-router';
import { NavLink }                     from 'react-router-dom';
import { useToken }                    from '@frontend/core/lib/hooks/useToken';
import './locales';

import { v4 }                          from 'uuid';
import { TicketsCountResponseDto }     from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsCountResponse.dto';
import { UserContext }                 from '@frontend/core/lib/utils/UserContext';
import { useLazyRequest }              from '@frontend/core/lib/hooks/useLazyRequest';
import { getEnv }                      from '@frontend/core/lib/utils/getEnv';

export const DesktopNavbar: React.FC = () => {
    const { t } = useTranslation('navbar');
    const history = useHistory();
    const [uuid] = useState(v4());
    const user = useContext(UserContext);
    const [ profileRoute, setProfileRoute ] = useState<ProfileRoute>();
    const token = useToken();
    useEffect(() => {
        if (history.location.search.match(/[?|&]profile=(root|activities|language)$/)) {
            const route = history.location.search.match(/[?|&]profile=(root|activities|language)$/)[1];
            if (route === 'root' || route === 'activities' || route === 'language') {
                setProfileRoute(route);
            } else {
                setProfileRoute(null);
            }
        } else {
            setProfileRoute(null);
        }
    }, [history.location.search]);

    const { response: ticketCountResp, lazyRequest: fetchTicketCount } =
        useLazyRequest<TicketsCountResponseDto>('tickets.count', uuid);

    useEffect(() => {
        if (token && user) {
            fetchTicketCount([
                token,
                {}
            ], { force: true });
        }
        // eslint-disable-next-line
    }, [token, user, history.location.pathname]);

    if (ticketCountResp.loading) {
        return <FullPageLoading/>
    }

    return (
        <Container>
            <LeftSide>
                <NavLink to='/'>
                    <Icon icon='t721' color='#fff' size='30px'/>
                </NavLink>
                <Link to='/search' selected={history.location.pathname.startsWith('/search')}>
                    {t('search')}
                </Link>
                <Link to='/wallet' selected={history.location.pathname.startsWith('/wallet')}>
                    {t('my_tickets')}
                </Link>
                <Link to='/tags' selected={history.location.pathname.startsWith('/tags')}>
                    {t('liked_events')}
                </Link>
            </LeftSide>
            <UserContainer>
                <BasicLink href={getEnv().REACT_APP_EVENT_CREATION_LINK}>
                    {t('create_event')}
                </BasicLink>
                { user ?
                    <Profile
                        onClick={
                            () => history.push(history.location.pathname + '?profile=root')
                        }>
                        <UserHeader
                            username={user?.username}
                            picture={'/favicon.ico'}
                            tickets={ticketCountResp.error ? '?' : ticketCountResp.data?.tickets.count}/>
                        <Chevron icon='chevron' color='#fff' size='7px'/>
                    </Profile> :
                    <Connect>
                        <Link selected={history.location.pathname.startsWith('/login')} to='/login'>{t('login')}</Link>
                        <Link selected={history.location.pathname.startsWith('/register')} to='/register'>{t('register')}</Link>
                    </Connect>
                }
            </UserContainer>
            {
                user

                    ?
                    <DrawerAccount
                        route={profileRoute}
                        onClose={() => history.push(history.location.pathname)}/>

                    :
                    null

            }
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    height: 80px;
    z-index: 3;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${props => props.theme.smallSpacing} ${props => props.theme.smallSpacing} ${props => props.theme.smallSpacing} ${props => props.theme.biggerSpacing};
    z-index: 1001;
`;

const LeftSide = styled.div`
    display: flex;
    align-items: center;
`;

const Link = styled(NavLink)<{ selected: boolean }>`
    margin-left: ${props => props.theme.biggerSpacing};

    ${props => props.selected ?
    `color: ${props.theme.textColor};`
    : null
}

    :hover {
        color: ${props => props.theme.textColor};
    }
`;

const BasicLink = styled.a`
    margin-right: ${props => props.theme.regularSpacing};

    :hover {
        color: ${props => props.theme.textColor};
    }
`;

const UserContainer = styled.div`
    display: flex;
    align-items: center;
    && button {
        outline: none;
        font-size: 13px;
        width: 150px;
    }
`;

const Profile = styled.div`
    display: flex;
    width: 170px;
    margin-left: ${props => props.theme.biggerSpacing};
    align-items: center;
    justify-content: space-between;
    background-color: rgba(255, 255, 255, 0.06);
    border-radius: ${(props) => props.theme.defaultRadius};
    padding: 12px 16px;
`;

const UserHeader = styled(WalletHeader)`
    padding: 0;
    cursor: pointer;
    img {
        width: 40px;
        height: 40px;
    }
    h3 {
        ${truncate('80px')};
        font-size: 13px;
    }
`;

const Chevron = styled(Icon)`
    transform: rotate(90deg);
`;

const Connect = styled.div`
    display: flex;
    margin-right: ${props => props.theme.regularSpacing};

    a:first-child {
        margin-right: ${props => props.theme.regularSpacing};
    }

    a:hover {
        color: ${props => props.theme.textColor};
    }
`;
