import React, { useContext, useEffect, useState } from 'react';
import styled                                     from 'styled-components';
import { FullPageLoading, Icon, WalletHeader } from '@frontend/flib-react/lib/components';

import { DrawerAccount, ProfileRoute }       from '@frontend/core/lib/components/DrawerAccount';
import { useTranslation }                    from 'react-i18next';
import { truncate } from '@frontend/core/lib/utils';
import { useHistory }                        from 'react-router';
import { NavLink }                           from 'react-router-dom';
import './locales';
import { v4 }                                from 'uuid';
import { useRequest }                        from '@frontend/core/lib/hooks/useRequest';
import { TicketsCountResponseDto }           from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsCountResponse.dto';
import { UserContext }                       from '@frontend/core/lib/contexts/UserContext';
import { useToken } from '@frontend/core/lib/hooks/useToken';

const AuthNavBar: React.FC = () => {
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

    const tickets = useRequest<TicketsCountResponseDto>({
        method: 'tickets.count',
        args: [
            token,
            {}
        ],
        refreshRate: 10,
    }, uuid);

    if (tickets.response.loading) {
        return <FullPageLoading/>
    }

    return (
        <Container>
            <NavLink
                to='/'>
                <Icon icon='t721' color='#fff' size='30px'/>
            </NavLink>
            <ActionContainer>
                <NavLink
                    to='/create-event'>
                    {
                        t('create_event')
                    }
                </NavLink>
                <Profile
                    onClick={
                        () => history.push(history.location.pathname + '?profile=root')
                    }>
                    <UserHeader
                        username={user?.username}
                        picture={'/favicon.ico'}
                        tickets={tickets.response.error ? '?' : tickets.response.data.tickets.count}/>
                    <Chevron icon='chevron' color='#fff' size='7px'/>
                </Profile>
            </ActionContainer>
            <DrawerAccount
                route={profileRoute}
                onClose={() => history.push(history.location.pathname)}/>
        </Container>
    );
};

const Container = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 24px;
  background-color: #1a1524;
`;

const ActionContainer = styled.div`
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

const NavBar = () => {
    const user = useContext(UserContext);

    if (user?.valid) {
        return <AuthNavBar/>
    } else {
        return null
    }

};

export default NavBar;
