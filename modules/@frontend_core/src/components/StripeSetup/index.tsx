import React, { useContext, useState }    from 'react';
import { UserContext }                    from '../../utils/UserContext';
import { FullPageLoading }                from '@frontend/flib-react/lib/components';
import { StripeSetupManager }             from './StripeSetupManager';
import { StripeCreateBankAccountManager } from './StripeCreateBankAccountManager';
import { StripeWithdrawManager }          from './StripeWithdrawManager';

export const StripeContext = React.createContext({
    marginTop: 0,
});

export const StripeSetup = (marginTop: number = 0): React.FC => {
    return (): JSX.Element => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const user = useContext(UserContext);
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [options] = useState({
            marginTop,
        });

        if (user) {
            return (
                <>
                    <StripeContext.Provider value={options}>
                        <StripeSetupManager user={user} />
                    </StripeContext.Provider>
                </>
            );
        } else {
            return (
                <>
                    <StripeContext.Provider value={options}>
                        <FullPageLoading />
                    </StripeContext.Provider>
                </>
            );
        }
    };
};

export const StripeCreateBankAccount = (): JSX.Element => {
    const user = useContext(UserContext);

    if (user) {
        return <StripeCreateBankAccountManager user={user} />;
    } else {
        return <FullPageLoading />;
    }
};

export const StripeWithdraw = (): JSX.Element => {
    const user = useContext(UserContext);

    if (user) {
        return <StripeWithdrawManager user={user} />;
    } else {
        return <FullPageLoading />;
    }
}
