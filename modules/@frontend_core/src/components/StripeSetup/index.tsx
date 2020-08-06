import React, { useContext }  from 'react';
import { UserContext }        from '../../utils/UserContext';
import { FullPageLoading }    from '@frontend/flib-react/lib/components';
import { StripeSetupManager } from './StripeSetupManager';

export const StripeSetup = (): JSX.Element => {

    const user = useContext(UserContext);

    if (user) {
        return <StripeSetupManager user={user}/>;
    } else {
        return <FullPageLoading/>;
    }
};
