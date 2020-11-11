import { StatusBarMargin } from '@frontend/core/lib/utils/StatusBarMargin';
import { NavbarMargin }             from '@frontend/core/lib/utils/NavbarMargin';
import ProfileRoot                  from '@frontend/core/lib/components/Profile/Root';
import React          from 'react';

const T721Profile: React.FC = (): JSX.Element => {

    return <ProfileRoot/>

};

export default StatusBarMargin(NavbarMargin(T721Profile));

