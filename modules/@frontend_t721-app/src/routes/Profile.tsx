import { StatusBarMargin }                from '@frontend/core/lib/utils/margins/StatusBarMargin';
import { NavbarMargin }                   from '@frontend/core/lib/utils/margins/NavbarMargin';
import ProfileRoot                        from '@frontend/core/lib/components/Profile/Root';
import React                              from 'react';
import { ArrowLink }                      from '@frontend/flib-react/lib/components';
import { HapticsImpactStyle, useHaptics } from '@frontend/core/lib/hooks/useHaptics';
import { getEnv }                         from '@frontend/core/lib/utils/getEnv';
import { useTranslation }                 from 'react-i18next';

const T721Profile: React.FC = (): JSX.Element => {

    const haptics = useHaptics();
    const [t] = useTranslation('common');

    const extraButtons = [
        <ArrowLink
            key={'create_event'}
            label={t('create_event')}
            onClick={() => {
                haptics.impact({
                    style: HapticsImpactStyle.Light,
                });
                window.location = getEnv().REACT_APP_EVENT_CREATION_LINK;
            }}
        />
    ]

    return <ProfileRoot
        extraButtons={extraButtons}
    />

};

export default StatusBarMargin(NavbarMargin(T721Profile));

