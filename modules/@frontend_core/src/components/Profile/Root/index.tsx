import React, { useContext, useState } from 'react';
import {
    ArrowLink,
    FullPageLoading,
    LanguageLink,
    LinksContainer,
    WalletHeader,
} from '@frontend/flib-react/lib/components';
import { useRequest } from '../../../hooks/useRequest';
import { v4 } from 'uuid';
import { useDispatch } from 'react-redux';
import { Logout } from '../../../redux/ducks/auth';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import '../locales';
import { TicketsCountResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsCountResponse.dto';
import { UserContext } from '../../../utils/UserContext';
import { FeatureFlag } from '../../FeatureFlag';
import { getEnv } from '../../../utils/getEnv';
import { isRequestError } from '../../../utils/isRequestError';
import { useToken } from '../../../hooks/useToken';
import { useHaptics, HapticsImpactStyle } from '../../../utils/useHaptics';

export interface ProfileRootProps {
    desktop?: boolean;
    extraButtons?: JSX.Element[];
}

const ProfileRoot: React.FC<ProfileRootProps> = ({ desktop, extraButtons }: ProfileRootProps): JSX.Element => {
    const [uuid] = useState(v4());
    const token = useToken();
    const user = useContext(UserContext);
    const dispatch = useDispatch();
    const history = useHistory();
    const [t, i18n] = useTranslation(['profile', 'common']);
    const [thisIsASelfDestructVariable, die] = useState(null);
    const haptics = useHaptics();

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
                        haptics.impact({
                            style: HapticsImpactStyle.Light,
                        });
                        history.push(desktop ? history.location.pathname + '?profile=language' : 'profile/language');
                    }}
                />
                <ArrowLink
                    label={t('report_bug')}
                    onClick={() => {
                        haptics.impact({
                            style: HapticsImpactStyle.Light,
                        });
                        window.location = getEnv().REACT_APP_BUG_REPORT_LINK;
                    }}
                />
                <ArrowLink
                    label={t('log_out')}
                    onClick={() => {
                        haptics.impact({
                            style: HapticsImpactStyle.Light,
                        });
                        dispatch(Logout());
                        history.replace('/');
                    }}
                />
                <FeatureFlag flag={'stripe_interface_setup'}>
                    <ArrowLink
                        label={t('receive_money_with_stripe')}
                        onClick={() => {
                            haptics.impact({
                                style: HapticsImpactStyle.Light,
                            });
                            history.push('/stripe/connect');
                        }}
                    />
                </FeatureFlag>
                <FeatureFlag flag={'admin_flag'}>
                    <ArrowLink
                        label={t('you_are_an_admin')}
                        onClick={() => {
                            haptics.impact({
                                style: HapticsImpactStyle.Light,
                            });
                            history.push('/you/are/an/admin');
                        }}
                    />
                </FeatureFlag>
                <FeatureFlag flag={'admin_flag'}>
                    <ArrowLink
                        label={t('self_destruct')}
                        onClick={() => {
                            haptics.impact({
                                style: HapticsImpactStyle.Light,
                            });
                            die({
                                date_of_death: new Date(Date.now()),
                            });
                        }}
                    />
                    {thisIsASelfDestructVariable}
                </FeatureFlag>
            </LinksContainer>
        </>
    );
};

export default ProfileRoot;
