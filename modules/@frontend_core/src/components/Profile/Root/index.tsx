import React, { useContext, useState } from 'react';
import {
    LinksContainer,
    ArrowLink,
    WalletHeader,
    LanguageLink,
    FullPageLoading,
} from '@frontend/flib-react/lib/components';
import { useRequest } from '../../../hooks/useRequest';
import { v4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../redux';
import { Logout } from '../../../redux/ducks/auth';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import '../locales';
import { TicketsCountResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsCountResponse.dto';
import { UserContext } from '../../../utils/UserContext';
import { FeatureFlag } from '../../FeatureFlag';
import { getEnv } from '../../../utils/getEnv';
import { isRequestError } from '../../../utils/isRequestError';

export interface ProfileRootProps {
    desktop?: boolean;
    extraButtons?: JSX.Element[];
}

const ProfileRoot: React.FC<ProfileRootProps> = ({ desktop, extraButtons }: ProfileRootProps): JSX.Element => {
    const [uuid] = useState(v4());
    const { token } = useSelector((state: AppState) => ({
        token: state.auth.token?.value,
    }));
    const user = useContext(UserContext);
    const dispatch = useDispatch();
    const history = useHistory();
    const [t, i18n] = useTranslation(['profile', 'common']);

    const tickets = useRequest<TicketsCountResponseDto>(
        {
            method: 'tickets.count',
            args: [token, {}],
            refreshRate: 50,
        },
        uuid,
    );

    if (tickets.response.loading) {
        return <FullPageLoading />;
    }

    return (
        <>
            <WalletHeader
                username={user.username}
                picture={'/favicon.ico'}
                tickets={isRequestError(tickets) ? '?' : tickets.response.data.tickets.count}
            />
            <LinksContainer title={t('account')}>
                {extraButtons || null}
                <LanguageLink
                    label={t('language')}
                    currentLanguage={t(i18n.language.slice(0, 2))}
                    onClick={() => {
                        history.push(desktop ? history.location.pathname + '?profile=language' : 'profile/language');
                    }}
                />
                <ArrowLink
                    label={t('report_bug')}
                    onClick={() => {
                        window.location = getEnv().REACT_APP_BUG_REPORT_LINK;
                    }}
                />
                <ArrowLink
                    label={t('log_out')}
                    onClick={() => {
                        dispatch(Logout());
                        history.replace('/');
                    }}
                />
                <FeatureFlag flag={'stripe_interface_setup'}>
                    <ArrowLink
                        label={t('receive_money_with_stripe')}
                        onClick={() => {
                            history.push('/stripe/connect');
                        }}
                    />
                </FeatureFlag>
                <FeatureFlag flag={'admin_flag'}>
                    <ArrowLink
                        label={t('you_are_an_admin')}
                        onClick={() => {
                            history.push('/you/are/an/admin');
                        }}
                    />
                </FeatureFlag>
            </LinksContainer>
        </>
    );
};

export default ProfileRoot;
