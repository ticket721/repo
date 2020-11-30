import { StripeSetup }   from '@frontend/core/lib/components/StripeSetup';
import { useMediaQuery }  from 'react-responsive';
import React, { useMemo } from 'react';

export default () => {

    const isUnder900 = useMediaQuery({ maxWidth: 900 });

    const StripePage = useMemo(() => StripeSetup(isUnder900 ? 0 : 80), [isUnder900]);

    return <StripePage/>
}
