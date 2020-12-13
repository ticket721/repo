import React, { useContext, useState } from 'react';
import {
    ArrowLink,
    FullPageLoading,
    LanguageLink,
    LinksContainer,
    WalletHeader,
    InfoLine,
} from '@frontend/flib-react/lib/components';
import { useRequest } from '../../../hooks/useRequest';
import { v4 } from 'uuid';
import { useDispatch } from 'react-redux';
import { Logout } from '../../../redux/ducks/auth';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import '../locales';
import { TicketsCountResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/tickets/dto/TicketsCountResponse.dto';
import { UserContext } from '../../../contexts/UserContext';
import { FeatureFlag } from '../../FeatureFlag';
import { getEnv } from '../../../utils/getEnv';
import { isRequestError } from '../../../utils/isRequestError';
import { useToken } from '../../../hooks/useToken';
import { useHaptics, HapticsImpactStyle } from '../../../hooks/useHaptics';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { event } from '../../../tracking/registerEvent';
// tslint:disable-next-line:no-var-requires
const StripeLogo = require('./stripe.png');

export interface ProfileRootProps {
    payments?: boolean;
    desktop?: boolean;
    extraButtons?: JSX.Element[];
}

const RoundButtonContainer = styled.div`
    padding: ${(props) => props.theme.regularSpacing};
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
`;

interface RoundButtonProps {
    avatar: string;
}

const RoundButton = styled(motion.div)<RoundButtonProps>`
    border-radius: 100%;
    width: 65px;
    height: 65px;
    background-image: url(${(props) => props.avatar});
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    background-color: ${(props) => props.theme.darkBg};
    margin: ${(props) => props.theme.smallSpacing};
    cursor: pointer;
`;

const Section = styled.section`
    padding: ${(props) => props.theme.biggerSpacing} 0;

    h2 {
        padding-left: ${(props) => props.theme.biggerSpacing};
    }
`;

const ProfileRoot: React.FC<ProfileRootProps> = ({ desktop, extraButtons, payments }: ProfileRootProps): JSX.Element => {
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
            {
                payments

                ? <Section>
                        <h2>{t('payments')}</h2>
                        <RoundButtonContainer>
                            <RoundButton
                                whileTap={{
                                    scale: 0.95,
                                }}
                                avatar={`${StripeLogo}`}
                                onClick={() => {
                                    haptics.impact({
                                        style: HapticsImpactStyle.Light,
                                    });
                                    history.push('/stripe/connect');
                                }}
                            />
                        </RoundButtonContainer>
                    </Section>

                    : null
            }
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
                        event('Auth', 'Logout', 'User logged out');
                    }}
                />
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
            <LinksContainer title={t('about')}>
                <InfoLine discrete={true} label={t('release')} content={getEnv().REACT_APP_RELEASE} />
                <ArrowLink
                    discrete={true}
                    label={t('cgo')}
                    onClick={() => {
                        haptics.impact({
                            style: HapticsImpactStyle.Light,
                        });
                        history.push('/about/cgo');
                    }}
                />
                <ArrowLink
                    discrete={true}
                    label={t('cgu')}
                    onClick={() => {
                        haptics.impact({
                            style: HapticsImpactStyle.Light,
                        });
                        history.push('/about/cgu');
                    }}
                />
                <ArrowLink
                    discrete={true}
                    label={t('privacy')}
                    onClick={() => {
                        haptics.impact({
                            style: HapticsImpactStyle.Light,
                        });
                        history.push('/about/privacy');
                    }}
                />
                <ArrowLink
                    discrete={true}
                    label={t('acknowledgements')}
                    onClick={() => {
                        haptics.impact({
                            style: HapticsImpactStyle.Light,
                        });
                        history.push('/about/acknowledgements');
                    }}
                />
            </LinksContainer>
        </>
    );
};

export default ProfileRoot;
