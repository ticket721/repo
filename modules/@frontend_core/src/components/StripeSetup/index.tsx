import React, { useContext }  from 'react';
import { UserContext }        from '../../utils/UserContext';
import { FullPageLoading }    from '@frontend/flib-react/lib/components';
import { StripeSetupManager } from './StripeSetupManager';
import { StripeCreateBankAccountManager } from './StripeCreateBankAccountManager';

export const StripeSetup = (): JSX.Element => {

    const user = useContext(UserContext);

    if (user) {
        return <StripeSetupManager user={user}/>;
    } else {
        return <FullPageLoading/>;
    }
};


export const StripeCreateBankAccount = (): JSX.Element => {

    const user = useContext(UserContext);

    if (user) {
        return <StripeCreateBankAccountManager user={user}/>;
    } else {
        return <FullPageLoading/>;
    }
};
