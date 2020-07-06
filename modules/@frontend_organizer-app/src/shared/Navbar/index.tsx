import React, { useEffect, useState } from 'react';
import styled                         from 'styled-components';
import { Icon, WalletHeader } from '@frontend/flib-react/lib/components';

import { DrawerAccount, ProfileRoute } from '../DrawerAccount';
import { useTranslation }              from 'react-i18next';
import { blurAndDarkenBackground, truncate } from '@frontend/core/lib/utils';
import { useHistory }                        from 'react-router';
import { NavLink }                           from 'react-router-dom';
import { useSelector }                       from 'react-redux';
import { AppState }                          from '@frontend/core/lib/redux';
import { getContract }                       from '@frontend/core/lib/subspace/getContract';
import './locales';
import { v4 }                                from 'uuid';

// tslint:disable-next-line:no-var-requires
const { observe, useSubspace } = require('@embarklabs/subspace-react');

const NavBar: React.FC = () => {
    const { t } = useTranslation('navbar');
    const history = useHistory();
    const user = useSelector((state: AppState) => state.auth.user);
    const [uuid] = useState(v4());
    const subspace = useSubspace();
    const T721TokenContract = getContract(subspace, 't721token', 'T721Token', uuid);
    const [ profileRoute, setProfileRoute ] = useState<ProfileRoute>();

    const $balance = (T721TokenContract.loading || T721TokenContract.error)
        ? '...'
        : T721TokenContract.contract.methods.balanceOf(user?.address).track();

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
                    <ConnectedUserHeader username={user?.username} picture={'/favicon.ico'} balance={$balance}/>
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
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 24px;
  ${(props): string => blurAndDarkenBackground('chrome')};
`;

const ActionContainer = styled.div`
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    width: 335px;
    && button {
        outline: none;
        font-size: 13px;
        width: 150px;
    }
`;

const Profile = styled.div`
    display: flex;
    width: 170px;
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

const ConnectedUserHeader = observe(UserHeader);

const Chevron = styled(Icon)`
    transform: rotate(90deg);
`;
export default NavBar;
